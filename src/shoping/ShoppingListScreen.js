import React, {Component, Fragment} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Alert,
} from 'react-native';
import _ from 'lodash';
import GradientHeader from '../commons/GradientHeader';
import SafeAreaView from 'react-native-safe-area-view';
import LinearGradient from 'react-native-linear-gradient';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import Interactable from 'react-native-interactable';
import ItemLibraryManager from '../manager/ItemLibraryManager';
import ShoppingListManager from '../manager/ShoppingListManager';

const itemLibraryManager = ItemLibraryManager.getInstance();
const shoppingListManager = ShoppingListManager.getInstance();

const SHOPPING_LIST = [
  {
    name: 'Almond Milk',
    manufacturer: 'Firm-manufacturer',
    quantitative: '200 ml',
    price: 2,
    currency: '€',
    image: require('../resources/images/buyer/example-milk.png'),
    amount: 1,
  },
  {
    name: 'Chocolate',
    manufacturer: 'Milka',
    quantitative: '200 g',
    price: 6,
    currency: '€',
    image: require('../resources/images/buyer/example-chocolate.png'),
    amount: 2,
  },
];

const ShoppingItem = props => {
  const {
    item,
    removeItemFromShoppingList,
    increaseAmountItem,
    decreaseAmountItem,
  } = props;

  const {name, manufacturer, volume, price, currency, image, amount} = item;

  return (
    <View style={styles.shoppingItem}>
      <View style={styles.itemContainer}>
        <View style={styles.itemImageWrapper}>
          <Image
            style={styles.itemImage}
            source={{uri: `data:image/gif;base64,${image.data}`}}
          />
        </View>
        <View style={styles.itemInfo}>
          <View>
            <Text style={styles.itemName}>{name}</Text>
            <Text style={styles.itemManufacturer}>{manufacturer}</Text>
            <Text style={styles.itemQuantitative}>{volume}</Text>
          </View>
          <View style={styles.itemPrice}>
            <Text style={styles.itemPriceLabel}>Price:</Text>
            <Text style={styles.itemPriceValue}>
              {price} {currency}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => removeItemFromShoppingList(item)}>
          <Image source={require('../resources/images/buyer/close.png')} />
        </TouchableOpacity>
      </View>
      <View style={styles.amountAdjust}>
        <Text style={styles.amountLabel}>Amount:</Text>
        <Text style={styles.amountText}>{amount}</Text>
        <TouchableOpacity
          onPress={() => decreaseAmountItem(item)}
          style={styles.amountAdjustBtn}>
          <Image
            source={require('../resources/images/buyer/minus-circle.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => increaseAmountItem(item)}
          style={styles.amountAdjustBtn}>
          <Image
            source={require('../resources/images/buyer/plus-circle.png')}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SearchItem = props => {
  return (
    <Text style={styles.shoppingListItem}>
      - {name} {quantitive} {manufacturer}
    </Text>
  );
};

export default class ShoppingListScreen extends Component {
  static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      headerTitleStyle: {color: '#fff'},
      headerStyle: {
        backgroundColor: 'transparent',
      },
      header: props => <GradientHeader {...props} />,
      headerTitle: <Text style={styles.headerTitle}>Buyer</Text>,
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('MainTab');
          }}
          style={styles.headerLeftBtn}>
          <Image
            style={{tintColor: '#fff'}}
            source={require('../resources/images/settings/caret-left.png')}
          />
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      itemsFromLibrary: itemLibraryManager.getItemList() || [],
      itemsFromShoppingList: shoppingListManager.getItemList() || [],
      filterList: SHOPPING_LIST,
      searchKeyword: '',
    };
  }

  componentDidMount = async () => {
    itemLibraryManager.addScreen(this);
    shoppingListManager.addScreen(this);
  };

  componentWillUnmount = () => {
    itemLibraryManager.removeScreen(this);
    shoppingListManager.removeScreen(this);
  };

  _getItemsFromLibrary = () => {
    const itemsFromLibrary = itemLibraryManager.getItemList() || [];
    this.setState({itemsFromLibrary});
  };

  _getItemsFromShoppingList = () => {
    const itemsFromShoppingList = shoppingListManager.getItemList() || [];
    this.setState({itemsFromShoppingList});
  };

  _onSearch = text => {
    this.setState({searchKeyword: text});
  };

  _renderItem = ({item}) => {
    return (
      <ShoppingItem
        item={item}
        removeItemFromShoppingList={this._removeItemFromShoppingList}
        increaseAmountItem={this._increaseAmountItem}
        decreaseAmountItem={this._decreaseAmountItem}
      />
    );
  };

  _keyExtractor = (item, index) => {
    return index.toString();
  };

  _renderHeader = () => {
    return (
      <Text style={styles.emptyCaution}>Your shopping list is empty!</Text>
    );
  };

  _removeItemFromShoppingList = item => {
    const itemsFromShoppingList = _.cloneDeep(this.state.itemsFromShoppingList);
    _.remove(itemsFromShoppingList, obj => {
      return _.isEqual(obj, item);
    });
    console.log(itemsFromShoppingList);
    shoppingListManager.updateShoppingList(itemsFromShoppingList);
  };

  _renderSearchItem = ({item}) => {
    const {name, manufacturer, volume} = item;
    return (
      <TouchableOpacity onPress={() => this._onPressSearchItem(item)}>
        <Text style={styles.searchItem}>
          - {name} - {volume} - {manufacturer}
        </Text>
      </TouchableOpacity>
    );
  };

  _keyExtractorSearch = (item, index) => {
    return index.toString();
  };

  _onPressSearchItem = item => {
    // console.log(item)
    const itemsFromShoppingList = _.cloneDeep(this.state.itemsFromShoppingList);

    const checkExist = _.find(itemsFromShoppingList, object => {
      return (
        _.isEqual(object.image, item.image) &&
        object.name === item.name &&
        object.manufacturer === item.manufacturer &&
        object.price === item.price &&
        object.volume === item.volume
      );
    });

    if (checkExist) {
      Alert.alert(__APP_NAME__, 'This item is already added');
      return;
    }
    item.amount = 1;
    itemsFromShoppingList.push(item);
    shoppingListManager.updateShoppingList(itemsFromShoppingList);
  };

  _showSearch = () => {
    this.interactableSearch.snapTo({index: 0});
  };

  _hideSearch = () => {
    this.interactableSearch.snapTo({index: 1});
    this._searchInput.blur();
  };

  _onDragInteractableSearch = () => {
    this._searchInput.blur();
  };

  _increaseAmountItem = item => {
    const itemToChange = _.cloneDeep(item);
    const itemsFromShoppingList = _.cloneDeep(this.state.itemsFromShoppingList);
    const index = _.findIndex(itemsFromShoppingList, itemToChange);
    if (index !== -1) {
      itemToChange.amount++;
      itemsFromShoppingList[index] = itemToChange;
      shoppingListManager.updateShoppingList(itemsFromShoppingList);
    }
  };

  _decreaseAmountItem = item => {
    const itemToChange = _.cloneDeep(item);
    const itemsFromShoppingList = _.cloneDeep(this.state.itemsFromShoppingList);
    const index = _.findIndex(itemsFromShoppingList, itemToChange);
    if (index !== -1 && itemToChange.amount > 1) {
      itemToChange.amount--;
      itemsFromShoppingList[index] = itemToChange;
      shoppingListManager.updateShoppingList(itemsFromShoppingList);
    }
  };

  _calTotalCost = () => {
    const {itemsFromShoppingList} = this.state;
    const totalCost = _.sumBy(itemsFromShoppingList, object => {
      return object.price * object.amount;
    });
    return totalCost;
  };

  render() {
    const {
      searchKeyword,
      filterList,
      itemsFromLibrary,
      itemsFromShoppingList,
    } = this.state;

    const totalCost = this._calTotalCost();
    console.log('item====>', itemsFromShoppingList);
    return (
      <View style={styles.container}>
        <View style={styles.screenTitleContainer}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.goBack();
            }}
            style={styles.screenTitleBtn}>
            <Image
              source={require('../resources/images/settings/caret-left.png')}
            />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Shopping List</Text>
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.searchContainer}>
            <TouchableWithoutFeedback
              onPress={this._showSearch}
              style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.searchText}>
                Search add item to shopping list
              </Text>
              <Image source={require('../resources/images/buyer/search.png')} />
            </TouchableWithoutFeedback>
          </View>
          <TouchableOpacity
            style={styles.openItemLibrary}
            onPress={() => this.props.navigation.navigate('ItemLibrary')}>
            <Text style={styles.openItemLibraryText}>Open Item Library</Text>
          </TouchableOpacity>
          <FlatList
            style={{flex: 1}}
            showsVerticalScrollIndicator={false}
            data={itemsFromShoppingList}
            renderItem={this._renderItem}
            keyExtractor={this._keyExtractor}
            ListHeaderComponent={
              itemsFromShoppingList.length === 0 && this._renderHeader
            }
          />
          <View style={styles.totalCostContainer}>
            <Text style={styles.totalCostLabel}>Total Cost:</Text>
            <Text style={styles.itemPriceValue}>{totalCost} $</Text>
          </View>
          <View style={styles.createBtnWrapper}>
            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={styles.gradientBtn}>
              <LinearGradient
                style={styles.gradientBtnBackground}
                colors={['#E8222B', '#141414']}>
                <Text style={styles.gradientBtnLabel}>
                  Create Shopping List
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        <Interactable.View
          ref={refs => (this.interactableSearch = refs)}
          verticalOnly={true}
          initialPosition={{y: __SCREEN_HEIGHT__}}
          snapPoints={[{y: 50}, {y: __SCREEN_HEIGHT__}]}
          style={[styles.interactableSearch, {elevation: 12}]}
          onDrag={this._onDragInteractableSearch}>
          <View
            style={[
              styles.interactableSearchContainer,
              styles.gradientBtn,
              {height: __SCREEN_HEIGHT__},
            ]}>
            <TouchableWithoutFeedback onPress={this._hideSearch}>
              <View
                style={{
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    height: 8,
                    width: 60,
                    borderRadius: 5,
                    backgroundColor: '#ccc',
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
            <View style={{paddingHorizontal: 20, flex: 1}}>
              <View
                style={[
                  styles.searchContainer,
                  {flexDirection: 'row', alignItems: 'center'},
                ]}>
                <TextInput
                  ref={refs => (this._searchInput = refs)}
                  style={styles.searchText}
                  placeholder="Start typing the name"
                  value={searchKeyword}
                  onChangeText={this._onSearch}
                />
                <Image
                  source={require('../resources/images/buyer/search.png')}
                />
              </View>
              <FlatList
                data={itemsFromLibrary}
                renderItem={this._renderSearchItem}
                keyExtractor={this._keyExtractorSearch}
                style={{flex: 1, paddingVertical: 5}}
              />
            </View>
          </View>
        </Interactable.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerLeftBtn: {
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },
  screenTitleContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0,
    color: '#707070',
  },
  screenTitleBtn: {
    position: 'absolute',
    left: 0,
    padding: 25,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 14,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#C2C2C2',
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    letterSpacing: 0,
    color: '#707070',
    padding: 0,
  },
  openItemLibrary: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: '#888888',
    marginVertical: 10,
  },
  openItemLibraryText: {
    fontSize: 16,
    letterSpacing: 0,
    color: '#fff',
  },
  emptyCaution: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#707070',
    fontSize: 16,
    letterSpacing: 0,
  },
  shoppingItem: {},
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#C2C2C2',
    padding: 14,
  },
  itemImageWrapper: {
    shadowColor: '#00000029',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
  },
  itemImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  itemInfo: {
    marginLeft: 15,
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#6A6A6A',
    letterSpacing: 0,
    marginBottom: 5,
  },
  itemManufacturer: {
    fontSize: 14,
    color: '#707070',
    letterSpacing: 0,
    marginBottom: 10,
  },
  itemQuantitative: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  itemPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPriceLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#319800',
    letterSpacing: 0,
    marginRight: 10,
  },
  itemPriceValue: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#319800',
    letterSpacing: 0,
  },
  amountAdjust: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#707070',
    letterSpacing: 0,
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#707070',
    letterSpacing: 0,
    marginHorizontal: 15,
  },
  amountAdjustBtn: {
    paddingHorizontal: 10,
  },
  totalCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
    marginTop: 20,
  },
  totalCostLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  createBtnWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  gradientBtn: {
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 10,
  },
  gradientBtnBackground: {
    width: 265,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBtnLabel: {
    fontSize: 20,
    letterSpacing: 0,
    color: '#fff',
  },
  searchItem: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
    paddingVertical: 5,
  },
  interactableSearch: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  interactableSearchContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
});
