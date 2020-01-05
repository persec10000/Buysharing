import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  AlertIOS,
  ToastAndroid,
} from 'react-native';
import GradientHeader from '../commons/GradientHeader';
import SafeAreaView from 'react-native-safe-area-view';
import LinearGradient from 'react-native-linear-gradient';
import Icons from '../utils/Icons';
import _ from 'lodash';
import ItemLibraryManager from '../manager/ItemLibraryManager';
import ShoppingListManager from '../manager/ShoppingListManager';

const itemLibraryManager = ItemLibraryManager.getInstance();
const shoppingListManager = ShoppingListManager.getInstance();

const ProductItem = props => {
  const {item, editItem, removeItem, addItemToShoppingList} = props;

  const {name, manufacturer, volume, price, currency, image} = item;

  return (
    <View style={styles.productItem}>
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
        <View style={{justifyContent: 'space-between'}}>
          <TouchableOpacity onPress={() => editItem(item)}>
            <Image source={require('../resources/images/buyer/edit.png')} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeItem(item)}>
            <Icons.Feather name="trash-2" size={20} color="#707070" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addItemToShoppingList(item)}>
            <Icons.Feather name="shopping-cart" size={20} color="#707070" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

class ItemLibraryScreen extends Component {
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
      itemList: itemLibraryManager.getItemList() || [],
      itemsFromShoppingList: shoppingListManager.getItemList() || [],
    };
  }

  componentDidMount() {
    itemLibraryManager.addScreen(this);
    shoppingListManager.addScreen(this);
    console.log('item library', itemLibraryManager.getItemList());
  }

  componentWillUnmount = () => {
    itemLibraryManager.removeScreen(this);
    shoppingListManager.removeScreen(this);
  };

  _getItemsFromLibrary = () => {
    const itemList = itemLibraryManager.getItemList() || [];
    this.setState({itemList});
  };

  _getItemsFromShoppingList = () => {
    const itemsFromShoppingList = shoppingListManager.getItemList() || [];
    this.setState({itemsFromShoppingList});
  };

  _removeItemFromLibrary = item => {
    const itemList = _.cloneDeep(this.state.itemList);
    _.remove(itemList, obj => {
      return _.isEqual(obj, item);
    });
    console.log(itemList);
    itemLibraryManager.updateItemLibrary(itemList);
  };

  _editItemFromLibrary = item => {
    this.props.navigation.navigate('EditItem', {itemDetail: item});
  };

  _addItemToShoppingList = item => {
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
      Platform.select({
        ios: () => {
          AlertIOS.alert('This item is already added');
        },
        android: () => {
          ToastAndroid.show('This item is already added', ToastAndroid.SHORT);
        },
      })();
      return;
    }
    item.amount = 1;
    itemsFromShoppingList.push(item);
    shoppingListManager.updateShoppingList(itemsFromShoppingList);
    Platform.select({
      ios: () => {
        AlertIOS.alert(`Added ${item.name} to shopping list`);
      },
      android: () => {
        ToastAndroid.show(
          `Added ${item.name} to shopping list`,
          ToastAndroid.SHORT,
        );
      },
    })();
  };

  _renderItem = ({item}) => {
    return (
      <ProductItem
        item={item}
        editItem={this._editItemFromLibrary}
        removeItem={this._removeItemFromLibrary}
        addItemToShoppingList={this._addItemToShoppingList}
      />
    );
  };

  _keyExtractor = (item, index) => {
    return index.toString();
  };

  render() {
    const {itemList} = this.state;

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
          <Text style={styles.screenTitle}>Item Library</Text>
        </View>
        <View style={styles.mainContainer}>
          <TouchableOpacity
            style={styles.newItem}
            onPress={() => this.props.navigation.navigate('NewItem')}>
            <Text style={styles.newItemText}>New Item</Text>
            <Image
              style={styles.newItemIcon}
              source={require('../resources/images/buyer/plus-outline.png')}
            />
          </TouchableOpacity>
          <FlatList
            data={itemList}
            renderItem={this._renderItem}
            keyExtractor={this._keyExtractor}
            style={{flex: 1}}
          />
        </View>
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
  newItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: '#888888',
    marginVertical: 10,
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
  },
  newItemText: {
    fontSize: 16,
    letterSpacing: 0,
    color: '#fff',
  },
  newItemIcon: {
    position: 'absolute',
    right: 13,
    top: 10,
    bottom: 10,
  },
  productItem: {
    marginBottom: 10,
  },
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
});

export default ItemLibraryScreen;
