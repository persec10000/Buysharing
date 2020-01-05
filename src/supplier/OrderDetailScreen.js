import React, {Component} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import GradientHeader from '../commons/GradientHeader';
import SafeAreaView from 'react-native-safe-area-view';
import LinearGradient from 'react-native-linear-gradient';
import Icons from '../utils/Icons';
import FastImage from 'react-native-fast-image';
import AbsoluteLoadingScreen from '../commons/AbsoluteLoadingScreen';
import _ from 'lodash';
import APIClient from '../utils/APIClient';

const SHOPPING_LIST = [
  {
    name: 'Banana Bread',
    manufacturer: '',
    quantitive: '',
  },
  {
    name: 'Milk 3.2%',
    manufacturer: 'Milkland',
    quantitive: '',
  },
  {
    name: 'Rice',
    manufacturer: '',
    quantitive: '0.5 kg',
  },
  {
    name: 'Water',
    manufacturer: '',
    quantitive: '1l',
  },
  {
    name: 'Napkins',
    manufacturer: '',
    quantitive: '',
  },
  {
    name: 'Eggs',
    manufacturer: '',
    quantitive: '10',
  },
  {
    name: 'Soy sauce',
    manufacturer: '',
    quantitive: '',
  },
];

export default class OrderDetailScreen extends Component {
  static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      headerTitleStyle: {color: '#fff'},
      headerStyle: {
        backgroundColor: 'transparent',
      },
      header: props => <GradientHeader {...props} />,
      headerTitle: <Text style={styles.headerTitle}>Supplier</Text>,
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

    const offerDetail = this.props.navigation.state.params
      ? this.props.navigation.state.params.offerDetail
      : {};
    const buyerInOrdering = this.props.navigation.state.params
      ? this.props.navigation.state.params.buyerInOrdering
      : {};

    this.state = {
      offerDetail: offerDetail || {},
      buyerInOrdering: buyerInOrdering || {},
      buyerShoppingList: {},
      loading: false,
    };
  }

  componentDidMount() {
    const {offerDetail} = this.state;
    if (!offerDetail.order_id) return;
    this._getBuyerShoppingList(offerDetail.order_id);
  }

  _getBuyerShoppingList = async order_id => {
    if (!order_id) return;

    this.setState({loading: true});
    const path = '/api/v1/order/product/order/' + order_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log('product list hehehe', response);
    if (response && !_.isEmpty(response))
      this.setState({buyerShoppingList: response});
    this.setState({loading: false});
  };

  _renderItem = ({item}) => {
    const {
      product_name,
      product_price,
      photo,
      volume,
      unit,
      amount,
      vendor_name,
    } = item;
    return (
      <Text style={styles.shoppingListItem}>
        - {product_name} {vendor_name} {amount}
      </Text>
    );
  };

  _keyExtractor = (item, index) => {
    return index.toString();
  };

  render() {
    const {
      offerDetail,
      buyerInOrdering,
      loading,
      buyerShoppingList,
    } = this.state;

    const shopping_cost = buyerInOrdering.shopping_cost || 0;
    const shipping_cost = offerDetail.shipping_cost || 0;

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
          <Text style={styles.screenTitle}>Order Details</Text>
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.orderMainInfo}>
            <View style={styles.customerContainer}>
              <FastImage
                style={styles.customerAvatar}
                resizeMode={FastImage.resizeMode.cover}
                source={
                  buyerInOrdering.avatar
                    ? {uri: `data:image/gif;base64,${buyerInOrdering.avatar}`}
                    : require('../resources/images/buyer/default-avatar.png')
                }
              />
              <Text style={styles.customerName}>
                {buyerInOrdering.fullname || 'Unknow'}
              </Text>
            </View>
            <View style={styles.orderDetail}>
              <View style={styles.orderDetailRow}>
                <View style={styles.rowIcon}>
                  <Image
                    source={require('../resources/images/buyer/marker.png')}
                  />
                </View>
                <Text style={styles.rowLabel}>
                  {buyerInOrdering.buying_place},{' '}
                  {buyerInOrdering.buying_street}, {buyerInOrdering.buying_city}
                  , {buyerInOrdering.buying_country}
                </Text>
              </View>
              <View style={styles.orderDetailRow}>
                <View style={styles.rowIcon}>
                  <Image
                    source={require('../resources/images/buyer/corner-down-right.png')}
                  />
                </View>
                <Text style={styles.rowLabel}>
                  {buyerInOrdering.ship_place}, {buyerInOrdering.ship_street},{' '}
                  {buyerInOrdering.ship_city}, {buyerInOrdering.ship_country}
                </Text>
              </View>
              <View style={styles.orderDetailRow}>
                <View style={styles.rowIcon}>
                  <Icons.FontAwesome name="clock-o" size={20} color="#707070" />
                </View>
                <Text style={styles.rowLabel}>
                  {buyerInOrdering.buying_date}, {buyerInOrdering.ship_date}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.orderDesContainer}>
            <Text style={styles.orderDescription}>
              Comment: {buyerInOrdering.comment || 'No comment'}
            </Text>
          </View>
          <View style={styles.shoppingListContainer}>
            <Text style={styles.shoppingListTitle}>Shopping list:</Text>
            {!_.isEmpty(buyerShoppingList) && (
              <FlatList
                style={styles.shoppingList}
                data={buyerShoppingList}
                renderItem={this._renderItem}
                keyExtractor={this._keyExtractor}
              />
            )}
            <View style={styles.orderCostContainer}>
              <View style={styles.orderCost}>
                <Text style={styles.orderCostLabel}>Shopping cost:</Text>
                <Text style={styles.orderShoppingCost}>
                  {shopping_cost.toLocaleString()}$
                </Text>
              </View>
              <View style={styles.orderCost}>
                <Text style={[styles.orderCostLabel, {color: '#319800'}]}>
                  Delivery cost:
                </Text>
                <Text style={styles.orderDeliveryCost}>
                  {shipping_cost.toLocaleString()}$
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.gradientBtnWrapper}>
            <TouchableOpacity style={styles.gradientBtn}>
              <LinearGradient
                style={styles.gradientBtnBackground}
                colors={['#E8222B', '#141414']}>
                <Text style={styles.gradientBtnLabel}>Accept</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gradientBtn}>
              <LinearGradient
                style={styles.gradientBtnBackground}
                colors={['#888888', '#888888']}>
                <Text style={styles.gradientBtnLabel}>Decline</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        {loading && <AbsoluteLoadingScreen />}
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
    paddingHorizontal: 28,
  },
  orderMainInfo: {
    flexDirection: 'row',
  },
  customerContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  customerAvatar: {
    width: 55,
    height: 55,
  },
  customerName: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#6A6A6A',
    maxWidth: 72,
    textAlign: 'center',
  },
  orderDetail: {
    flex: 1,
    justifyContent: 'space-between',
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  rowIcon: {
    width: 31,
  },
  rowLabel: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  orderDesContainer: {
    paddingVertical: 13,
  },
  orderDescription: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  shoppingListContainer: {
    flex: 1,
  },
  shoppingListTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#707070',
    letterSpacing: 0,
    marginTop: 21,
    marginBottom: 14,
  },
  shoppingList: {
    flex: 1,
  },
  shoppingListItem: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  orderCostContainer: {
    marginVertical: 15,
    paddingHorizontal: 38,
  },
  orderCost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  orderCostLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#707070',
    letterSpacing: 0,
  },
  orderShoppingCost: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  orderDeliveryCost: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#319800',
    letterSpacing: 0,
  },
  gradientBtnWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  gradientBtn: {
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
    marginBottom: 10,
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
});
