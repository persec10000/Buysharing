import React, {Component} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  ImageBackground,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import GradientHeader from '../commons/GradientHeader';
import Icons from '../utils/Icons';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
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

const OrderDetailRow = props => {
  const {icon, label, iconComponent, rowStyle} = props;
  return (
    <View style={[styles.orderDetailRow, rowStyle]}>
      <View style={styles.rowIcon}>
        {icon && <Image source={icon} />}
        {iconComponent && iconComponent}
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  );
};

const GradientButton = props => {
  const {label} = props;
  return (
    <TouchableOpacity style={styles.gradientBtn}>
      <LinearGradient
        style={styles.gradientBtnBackground}
        colors={['#E8222B', '#141414']}>
        <Text style={styles.gradientBtnLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default class SupplierOrderDetailScreen extends Component {
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

    const orderDetail = this.props.navigation.state.params
      ? this.props.navigation.state.params.orderDetail
      : {};
    const supplierInOffering = this.props.navigation.state.params
      ? this.props.navigation.state.params.supplierInOffering
      : {};

    this.state = {
      isChecked: false,
      orderDetail: orderDetail || {},
      supplierInOffering: supplierInOffering || {},
      buyerShoppingList: {},
      loading: false,
    };
  }

  componentDidMount = () => {
    const {orderDetail} = this.state;
    if (!orderDetail.order_id) return;
    this._getBuyerShoppingList(orderDetail.order_id);
  };

  _getBuyerShoppingList = async order_id => {
    if (!order_id) return;

    this.setState({loading: true});
    const path = '/api/v1/order/product/order/' + order_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log('product list', response);
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
    return index;
  };

  _onPressCheckbox = () => {
    this.setState(prevState => ({
      ...prevState,
      isChecked: !prevState.isChecked,
    }));
  };

  render() {
    const {
      isChecked,
      orderDetail,
      supplierInOffering,
      loading,
      buyerShoppingList,
    } = this.state;

    const shopping_cost = orderDetail.shopping_cost || 0;
    const shipping_cost = orderDetail.shipping_cost || 0;

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
          <Text style={styles.screenTitle}>Offers Nearby</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.mainContainer}>
          <View style={styles.orderMainInfo}>
            <View style={styles.customerContainer}>
              <FastImage
                style={styles.customerAvatar}
                resizeMode={FastImage.resizeMode.cover}
                source={
                  supplierInOffering.avatar
                    ? {
                        uri: `data:image/gif;base64,${supplierInOffering.avatar}`,
                      }
                    : require('../resources/images/buyer/default-avatar.png')
                }
              />
              <Text style={styles.customerName}>
                {supplierInOffering.fullname || 'Unknow'}
              </Text>
            </View>
            <View style={styles.orderDetail}>
              <OrderDetailRow
                icon={require('../resources/images/buyer/vehicle.png')}
                label="Mercedes abc"
              />
              <OrderDetailRow
                icon={require('../resources/images/buyer/corner-down-right.png')}
                label={`${supplierInOffering.buying_place}, ${supplierInOffering.buying_street}, ${supplierInOffering.buying_city}, ${supplierInOffering.buying_country}`}
              />
              <OrderDetailRow
                icon={require('../resources/images/buyer/marker.png')}
                label={`${supplierInOffering.ship_place}, ${supplierInOffering.ship_street}, ${supplierInOffering.ship_city}, ${supplierInOffering.ship_country}`}
              />
              <OrderDetailRow
                rowStyle={{marginBottom: 0}}
                iconComponent={
                  <Icons.FontAwesome name="clock-o" size={20} color="#707070" />
                }
                label={`${supplierInOffering.buying_date}, ${supplierInOffering.ship_date}`}
              />
            </View>
          </View>
          <View style={styles.orderCostContainer}>
            <View style={[styles.orderCost, {justifyContent: 'center'}]}>
              <Text
                style={[
                  styles.orderCostLabel,
                  {color: '#319800', marginRight: 10},
                ]}>
                Delivery cost:
              </Text>
              <Text style={styles.orderDeliveryCost}>
                {supplierInOffering.shipping_cost || 0}$
              </Text>
            </View>
          </View>
          <Text style={[styles.shoppingListTitle, {marginTop: 15}]}>
            Your order:
          </Text>
          <View style={styles.orderMainInfo}>
            <View style={styles.customerContainer}>
              <FastImage
                style={styles.customerAvatar}
                resizeMode={FastImage.resizeMode.cover}
                source={
                  orderDetail.avatar
                    ? {uri: `data:image/gif;base64,${orderDetail.avatar}`}
                    : require('../resources/images/buyer/default-avatar.png')
                }
              />
              <Text style={styles.customerName}>
                {orderDetail.fullname || 'Unknow'}
              </Text>
            </View>
            <View style={styles.orderDetail}>
              <OrderDetailRow
                icon={require('../resources/images/buyer/corner-down-right.png')}
                label={`${orderDetail.buying_place}, ${orderDetail.buying_street}, ${orderDetail.buying_city}, ${orderDetail.buying_country}`}
              />
              <OrderDetailRow
                icon={require('../resources/images/buyer/marker.png')}
                label={`${orderDetail.ship_place}, ${orderDetail.ship_street}, ${orderDetail.ship_city}, ${orderDetail.ship_country}`}
              />
              <OrderDetailRow
                rowStyle={{marginBottom: 0}}
                iconComponent={
                  <Icons.FontAwesome name="clock-o" size={20} color="#707070" />
                }
                label={`${orderDetail.buying_date}, ${orderDetail.ship_date}`}
              />
            </View>
          </View>
          <View style={styles.orderDesContainer}>
            <Text style={styles.orderDescription}>
              Comment: {orderDetail.comment || 'No comment'}
            </Text>
          </View>
          <View style={styles.shoppingListContainer}>
            <Text style={styles.shoppingListTitle}>Shopping list:</Text>
            <FlatList
              style={styles.shoppingList}
              data={buyerShoppingList}
              renderItem={this._renderItem}
              keyExtractor={this._keyExtractor}
            />
            <View style={styles.shoppingCostDetail}>
              <View style={styles.costRow}>
                <Text style={[styles.costText, {fontWeight: 'bold'}]}>
                  Shopping cost:
                </Text>
                <Text style={styles.costText}>
                  {shopping_cost.toLocaleString()}$
                </Text>
              </View>
              <View style={styles.costRow}>
                <View style={styles.checkboxContainer}>
                  <TouchableWithoutFeedback onPress={this._onPressCheckbox}>
                    <ImageBackground
                      source={require('../resources/images/checkbox-uncheck.png')}
                      style={{
                        width: 30,
                        height: 30,
                        marginRight: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {isChecked && <View style={styles.checkedDot} />}
                    </ImageBackground>
                  </TouchableWithoutFeedback>
                  <Text style={[styles.costText, {fontSize: 12}]}>
                    Include shipping cost:
                  </Text>
                </View>
                <Text style={styles.costText}>
                  {shipping_cost.toLocaleString()}$
                </Text>
              </View>
              <View style={[styles.costRow, {marginBottom: 0}]}>
                <Text style={[styles.costText, {fontWeight: 'bold'}]}>
                  Total cost:
                </Text>
                <Text style={styles.totalCost}>
                  {(shopping_cost + shipping_cost).toLocaleString()}$
                </Text>
              </View>
            </View>
            <View style={styles.gradientBtnWrapper}>
              <GradientButton label="Go to Payment" />
            </View>
          </View>
          <View style={{height: 50}} />
        </ScrollView>
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
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
  },
  screenTitle: {
    fontSize: 20,
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
    paddingVertical: 25,
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
    justifyContent: 'space-between',
    flex: 1,
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  rowIcon: {
    width: 31,
    alignItems: 'center',
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
  shoppingCostDetail: {
    paddingHorizontal: 23,
    paddingVertical: 18,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  costText: {
    fontSize: 16,
    letterSpacing: 0,
    color: '#707070',
  },
  totalCost: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#319800',
    letterSpacing: 0,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedDot: {
    width: 19,
    height: 19,
    backgroundColor: '#E8222B',
    borderRadius: 10,
  },
  gradientBtnWrapper: {
    alignItems: 'center',
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
