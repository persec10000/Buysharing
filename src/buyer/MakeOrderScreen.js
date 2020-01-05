import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import GradientHeader from '../commons/GradientHeader';
import MapView, {Marker} from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Icons from '../utils/Icons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ShoppingListManager from '../manager/ShoppingListManager';
import UserManager from '../manager/UserManager';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import APIClient from '../utils/APIClient';
import _ from 'lodash';
import AbsoluteLoadingScreen from '../commons/AbsoluteLoadingScreen';
import FastImage from 'react-native-fast-image';
import FormInteractField from '../commons/FormInteractField';
import ModalLocation from '../commons/ModalLocation';
import Dialog, {SlideAnimation} from 'react-native-popup-dialog';

const shoppingListManager = ShoppingListManager.getInstance();
const userManager = UserManager.getInstance();

const FormInput = props => {
  const {label, value, onPressTouchableWithoutFeedback} = props;
  return (
    <TouchableWithoutFeedback
      onPress={onPressTouchableWithoutFeedback}
      style={styles.formInput}>
      <Text style={styles.inputLabel}>{label}:</Text>
      <TextInput style={styles.inputField} value={value} {...props} />
      <Image source={require('../resources/images/settings/edit.png')} />
    </TouchableWithoutFeedback>
  );
};

export default class MakeOrderScreen extends Component {
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

    const offerDetail = this.props.navigation.state.params
      ? this.props.navigation.state.params.offerDetail
      : {};
    const {
      buying_place,
      buying_street,
      buying_city,
      buying_country,
      ship_place,
      ship_street,
      ship_city,
      ship_country,
    } = offerDetail;

    const deliveryFrom = `${buying_place}, ${buying_street}, ${buying_city}, ${buying_country}`;
    const deliveryTo = `${ship_place}, ${ship_street}, ${ship_city}, ${ship_country}`;

    this.state = {
      offerDetail: offerDetail || {},
      deliveryFrom: deliveryFrom,
      deliveryTo: deliveryTo,
      deliveryTime: moment(),
      loading: false,

      //modal visible
      visibleModalDeliveryFrom: false,
      visibleModalDeliveryTo: false,
    };
  }

  componentDidMount() {
    this._getSupplierInfo();
  }

  _getSupplierInfo = async () => {
    const {offerDetail} = this.state;
    if (!offerDetail.user_id) return;

    const path = '/api/v1/user/' + offerDetail.user_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    // console.log('_getSupplierInfo', response)
    if (response && response.status && !_.isEmpty(response.data)) {
      this.setState(prevState => ({
        offerDetail: {
          ...prevState.offerDetail,
          ...response.data,
        },
      }));
    }
  };

  _onChangeDeliveryFrom = text => {
    this.setState({deliveryFrom: text});
  };

  _onChangeDeliveryTo = text => {
    this.setState({deliveryTo: text});
  };

  _onChangeDeliveryTime = value => {
    const deliveryTime = moment(value, 'DD/MM/YYYY HH:mm');
    this.setState({deliveryTime});
  };

  _sendToSupplier = async () => {
    const {deliveryFrom, deliveryTo, deliveryTime, offerDetail} = this.state;
    // console.log('offerDetail', offerDetail)
    // return

    const itemsFromShoppingList = shoppingListManager.getItemList() || [];
    const totalCost = _.sumBy(itemsFromShoppingList, object => {
      return object.price * object.amount;
    });
    const user = userManager.getUser() || {};

    if (_.isEmpty(user)) return;

    // if(_.isEmpty(deliveryFrom) || _.isEmpty(deliveryTo) || _.isEmpty(deliveryTime)){
    //     Alert.alert(__APP_NAME__, 'All fields must be not empty');
    //     return
    // }

    if (_.isEmpty(itemsFromShoppingList)) {
      Alert.alert(
        __APP_NAME__,
        'Your shopping list are empty. Please add at least one item',
      );
      return;
    }

    this.setState({loading: true});
    const buyer_id = await this._createBuyer();
    const orderInfo = await this._getOrderInfo();
    await this._updateOrder(orderInfo, buyer_id, totalCost);
    // return
    await Promise.all(
      itemsFromShoppingList.map(item =>
        this._uploadShoppingList(item, orderInfo.order_id),
      ),
    );
    // await this._createOrder(buyer_id, totalCost)

    this.setState({loading: false});
    this.props.navigation.navigate('OrderConfirmed');
  };

  _getOrderInfo = async () => {
    const {offerDetail} = this.state;
    const path = '/api/v1/order/search/supplier/' + offerDetail.supplier_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log(response);
    if (response && response.order_id) {
      return response;
    }
    return false;
  };

  _updateOrder = async (orderInfo, buyer_id, price) => {
    const {offerDetail} = this.state;
    const ship_price_buyer = offerDetail.shipping_cost || 0;

    const path = '/api/v1/order/' + orderInfo.order_id;
    const data = {
      ...orderInfo,
      buyer_id: buyer_id,
      price: price,
      ship_price_buyer: ship_price_buyer,
    };
    const {response, error} = await APIClient.getInstance().jsonPUT(path, data);
    console.log(response, error);
    if (response && response.order_id) {
      Alert.alert(
        __APP_NAME__,
        'Your order has been created and delivered to supplier. Wait for supplier response!',
      );
      // this.props.navigation.navigate('OrderConfirmed')
    }
  };

  // _createOrder = async (buyer_id, price) => {
  //     const { offerDetail } = this.state
  //     if(!offerDetail.user_id) return
  //     const supplier_id = offerDetail.user_id
  //     const ship_price_buyer = offerDetail.shipping_cost
  //     const ship_price_supplier = offerDetail.shipping_cost

  //     const path = '/api/v1/order'
  //     const data = {
  //         buyer_id,
  //         supplier_id,
  //         date_created: moment().format('YYYY-MM-DD'),
  //         time_created: moment().format('HH:mm:ss'),
  //         price,
  //         ship_price_buyer,
  //         ship_price_supplier
  //     }
  //     const { response, error } = await APIClient.getInstance().jsonPOST(path, data)
  //     console.log(response, error)
  //     if(response && response.order_id) {
  //         Alert.alert(__APP_NAME__, 'Your order has been created and delivered to supplier. Wait for supplier response!');
  //         this.props.navigation.navigate('OrderConfirmed')
  //     }
  // }

  _uploadShoppingList = async (item, order_id) => {
    console.log(item);
    const path = '/api/v1/order/product';
    const data = {
      order_id,
      product_name: item.name,
      product_price: item.price,
      photo: item.image.data,
      vendor_name: item.manufacturer,
      volume: item.volume,
      amount: item.amount,
    };
    const {response, error} = await APIClient.getInstance().jsonPOST(
      path,
      data,
    );
    console.log(response, error);
    if (response) {
    } else {
      Alert.alert(
        __APP_NAME__,
        'Something happened with uploading shopping list. Abort this session!',
      );
    }
  };

  _createBuyer = async () => {
    const {deliveryFrom, deliveryTo, deliveryTime} = this.state;

    const itemsFromShoppingList = shoppingListManager.getItemList() || [];
    const totalCost = _.sumBy(itemsFromShoppingList, object => {
      return object.price * object.amount;
    });
    const user = userManager.getUser() || {};

    const buyingPlace = deliveryFrom.split(',')[0];
    const buyingStreet = deliveryFrom.split(',')[1];
    const buyingCity = deliveryFrom.split(',')[2];
    const buyingCountry = deliveryFrom.split(',')[3];
    const buyingDate = moment().format('YYYY-MM-DD');
    const buyingTime = moment().format('HH:mm:ss');

    const shipPlace = deliveryTo.split(',')[0];
    const shipStreet = deliveryTo.split(',')[1];
    const shipCity = deliveryTo.split(',')[2];
    const shipCountry = deliveryTo.split(',')[3];
    const shipDate = deliveryTime.format('YYYY-MM-DD');
    const shipTime = deliveryTime.format('HH:mm:ss');

    const path = '/api/v1/buyer';
    const data = {
      user_id: user.user_id,
      buying_place: buyingPlace,
      buying_street: buyingStreet,
      buying_city: buyingCity,
      buying_country: buyingCountry,
      buying_time: buyingTime,
      buying_date: buyingDate,
      ship_place: shipPlace,
      ship_street: shipStreet,
      ship_city: shipCity,
      ship_country: shipCountry,
      ship_time: shipTime,
      ship_date: shipDate,
      shopping_cost: totalCost,
    };

    const {response, error} = await APIClient.getInstance().jsonPOST(
      path,
      data,
    );
    console.log(response);
    if (response && response.buyer_id) return response.buyer_id;
    else {
      Alert.alert(
        __APP_NAME__,
        'Make order failed. Check your network then try again',
      );
      return;
    }
  };

  _openModalDeliveryFrom = () => {
    this.setState({
      visibleModalDeliveryFrom: true,
    });
  };

  _closeModalDeliveryFrom = () => {
    this.setState({
      visibleModalDeliveryFrom: false,
    });
  };

  _openModalDeliveryTo = () => {
    this.setState({
      visibleModalDeliveryTo: true,
    });
  };

  _closeModalDeliveryTo = () => {
    this.setState({
      visibleModalDeliveryTo: false,
    });
  };

  render() {
    const {
      offerDetail,
      deliveryFrom,
      deliveryTo,
      deliveryTime,
      loading,
      visibleModalDeliveryFrom,
      visibleModalDeliveryTo,
    } = this.state;

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
        <KeyboardAwareScrollView
          keyboardDismissMode="on-drag"
          contentContainerStyle={{paddingBottom: 30}}
          style={styles.mainContainer}>
          <View style={styles.offerMainInfo}>
            <View style={styles.supplierContainer}>
              <FastImage
                style={styles.supplierAvatar}
                resizeMode={FastImage.resizeMode.cover}
                source={
                  offerDetail.avatar
                    ? {uri: `data:image/gif;base64,${offerDetail.avatar}`}
                    : require('../resources/images/buyer/default-avatar.png')
                }
              />
              <Text style={styles.supplierName}>
                {offerDetail.fullname || 'Unknow'}
              </Text>
            </View>
            <View style={styles.offerDetail}>
              <View style={styles.offerDetailRow}>
                <View style={styles.rowIcon}>
                  <Image
                    source={require('../resources/images/buyer/vehicle.png')}
                  />
                </View>
                <Text style={styles.rowLabel}>Mercedes A300</Text>
              </View>
              <View style={styles.offerDetailRow}>
                <View style={styles.rowIcon}>
                  <Image
                    source={require('../resources/images/buyer/marker.png')}
                  />
                </View>
                <Text style={styles.rowLabel}>
                  {/* Sity mall, Green street, 4 */}
                  {offerDetail.buying_place}, {offerDetail.buying_street},{' '}
                  {offerDetail.buying_city}, {offerDetail.buying_country}
                </Text>
              </View>
              <View style={styles.offerDetailRow}>
                <View style={styles.rowIcon}>
                  <Image
                    source={require('../resources/images/buyer/corner-down-right.png')}
                  />
                </View>
                <Text style={styles.rowLabel}>
                  {/* Soborna street, 11, Sumy */}
                  {offerDetail.ship_place}, {offerDetail.ship_street},{' '}
                  {offerDetail.ship_city}, {offerDetail.ship_country}
                </Text>
              </View>
              <View style={styles.offerDetailRow}>
                <View style={styles.rowIcon}>
                  <Icons.FontAwesome name="clock-o" size={20} color="#707070" />
                </View>
                <Text style={styles.rowLabel}>
                  {offerDetail.buying_date}, {offerDetail.ship_date}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.deliveryCostContainer}>
            <Text style={[styles.deliveryCost, {width: 69}]}>
              Delivery (km):
            </Text>
            <Text style={[styles.deliveryCost, {fontSize: 24}]}>
              {' '}
              {offerDetail.shipping_cost} $
            </Text>
          </View>
          <View>
            <Text style={styles.yourOrderText}>Your order:</Text>
            <FormInteractField
              label="From"
              placeholder="Place, Street, City, Country..."
              value={deliveryFrom}
              onPressTouchableWithoutFeedback={this._openModalDeliveryFrom}
            />
            <FormInteractField
              label="To"
              placeholder="Place, Street, City, Country..."
              value={deliveryTo}
              onPressTouchableWithoutFeedback={this._openModalDeliveryTo}
            />
            <FormInteractField
              label="When"
              placeholder="When..."
              value={
                deliveryTime.format('DD/MM/YYYY HH:mm') ===
                moment().format('DD/MM/YYYY HH:mm')
                  ? 'Now'
                  : deliveryTime.format('DD/MM/YYYY HH:mm')
              }
              onPressTouchableWithoutFeedback={() => {
                this.datePicker.onPressDate();
              }}
            />
            <View style={styles.buyBtnContainer}>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate('ShoppingList')}
                style={styles.shoppingListBtn}>
                <Text style={styles.shoppingListBtnLabel}>Shopping List</Text>
                <Image
                  style={{tintColor: '#AC040C'}}
                  source={require('../resources/images/settings/edit.png')}
                />
              </TouchableOpacity>
              <View style={{width: 15}} />
              <TouchableOpacity style={styles.commentBtn}>
                <Text style={styles.commentBtnLabel}>Leave Comment</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.gradientBtnWrapper}>
              <TouchableOpacity
                style={styles.gradientBtn}
                onPress={this._sendToSupplier}>
                <LinearGradient
                  style={styles.gradientBtnBackground}
                  colors={['#E8222B', '#141414']}>
                  <Text style={styles.gradientBtnLabel}>Send to Supplier</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
        <DatePicker
          style={{width: 0, height: 0}}
          ref={refs => (this.datePicker = refs)}
          androidMode="spinner"
          showIcon={false}
          mode="datetime"
          placeholder="Time to delivery"
          format="DD/MM/YYYY HH:mm"
          minDate={moment().format('DD/MM/YYYY HH:mm')}
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          onDateChange={this._onChangeDeliveryTime}
          customStyles={{
            dateInput: {
              borderWidth: 0,
              height: 0,
            },
            btnTextConfirm: {
              color: '#AC040C',
              fontSize: 20,
            },
            btnTextCancel: {
              color: '#707070',
              fontSize: 20,
            },
          }}
        />
        <Dialog
          visible={visibleModalDeliveryFrom}
          onTouchOutside={this._closeModalDeliveryFrom}>
          <ModalLocation
            title="Delivery From"
            onChangeLocation={this._onChangeDeliveryFrom}
            closeModal={this._closeModalDeliveryFrom}
            requiredAll={true}
          />
        </Dialog>
        <Dialog
          visible={visibleModalDeliveryTo}
          onTouchOutside={this._closeModalDeliveryTo}>
          <ModalLocation
            title="Delivery To"
            onChangeLocation={this._onChangeDeliveryTo}
            closeModal={this._closeModalDeliveryTo}
            requiredAll={true}
          />
        </Dialog>
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
    paddingHorizontal: 27,
    paddingVertical: 24,
  },
  offerMainInfo: {
    flexDirection: 'row',
  },
  supplierContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  supplierAvatar: {
    width: 55,
    height: 55,
  },
  supplierName: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#6A6A6A',
    maxWidth: 72,
    textAlign: 'center',
  },
  offerDetail: {
    justifyContent: 'space-between',
    flex: 1,
  },
  offerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  rowIcon: {
    width: 31,
    alignItems: 'center',
    marginRight: 5,
  },
  rowLabel: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
    flex: 1,
  },
  deliveryCostContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryCost: {
    marginHorizontal: 5,
    fontWeight: 'bold',
    color: '#319800',
    letterSpacing: 0,
  },
  yourOrderText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#707070',
    letterSpacing: 0,
    marginTop: 21,
    marginBottom: 20,
  },
  formInput: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    borderColor: '#C2C2C2',
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 10,
  },
  inputLabel: {
    width: 57,
    fontSize: 16,
    fontWeight: '700',
    color: '#707070',
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#707070',
    padding: 0,
  },
  buyBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shoppingListBtn: {
    height: 40,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#AC040C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  shoppingListBtnLabel: {
    fontSize: 16,
    color: '#AC040C',
    marginRight: 8,
  },
  commentBtn: {
    height: 40,
    backgroundColor: '#888888',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#888888',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  commentBtnLabel: {
    fontSize: 16,
    color: '#fff',
  },
  gradientBtnWrapper: {
    alignItems: 'center',
    marginTop: 25,
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
