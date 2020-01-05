import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import GradientHeader from '../commons/GradientHeader';
import LocationManager from '../manager/LocationManager';
import ShoppingListManager from '../manager/ShoppingListManager';
import UserManager from '../manager/UserManager';
import Utils from '../utils/Utils';
import MapView, {Marker} from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Icons from '../utils/Icons';
import Dialog, {SlideAnimation} from 'react-native-popup-dialog';
import ShoppingListContent from '../shoping/ShoppingListContent';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import _ from 'lodash';
import APIClient from '../utils/APIClient';
import AbsoluteLoadingScreen from '../commons/AbsoluteLoadingScreen';
import MapScreen from '../commons/MapScreen';
import OfferPopup from './OfferPopup';
import FormInteractField from '../commons/FormInteractField';
import FormInput from '../commons/FormInput';
import GradientButton from '../commons/GradientButton';
import ModalLocation from '../commons/ModalLocation';
import FastImage from 'react-native-fast-image';
import Axios from 'axios';
import GeolocationUtils from '../utils/GeolocationUtils';

const locationManager = LocationManager.getInstance();
const shoppingListManager = ShoppingListManager.getInstance();
const userManager = UserManager.getInstance();

export default class BuyerScreen extends Component {
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
          onPress={() => navigation.state.params._goBack()}
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

    const isMakingOrder = this.props.navigation.state.params
      ? this.props.navigation.state.params.isMakingOrder
      : null;
    const orderDetail = this.props.navigation.state.params
      ? this.props.navigation.state.params.orderDetail
      : null;

    this.state = {
      isMakingOrder: isMakingOrder || false,
      // deliveryFrom: '102, Thai Thinh, Ha Noi, Viet Nam',
      // deliveryTo: 'Soborna street, 11, Sumy...',
      deliveryFrom: '',
      deliveryFromCoords: {},
      deliveryTo: '',
      deliveryToCoords: {},
      deliveryTime: moment(),
      loading: false,

      //modal visible
      visibleShoppingList: false,
      visibleModalDeliveryFrom: false,
      visibleModalDeliveryTo: false,

      // state lưu thông tin đơn sau khi tạo order
      orderDetail: orderDetail || {},

      // những người supplier ở gần điểm được chọn
      suppliersNearby: [],
    };
  }

  componentDidMount = async () => {
    this.props.navigation.setParams({_goBack: this._goBack});

    const currentLocation = await LocationManager.getInstance().getCurrentLocation();

    if (!_.isEmpty(currentLocation)) {
      const inititalCoords = {
        coordinate: {
          latitude: currentLocation[0],
          longitude: currentLocation[1],
        },
      };
      this._getSuppliersNearby(inititalCoords);
    }
  };

  _goBack = () => {
    const {orderDetail} = this.state;
    if (_.isEmpty(orderDetail)) this.props.navigation.navigate('MainTab');
    else {
      Alert.alert(global.__APP_NAME__, 'Are you sure want to cancel order?', [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: async () => {
            await this._cancel();
            this.props.navigation.navigate('MainTab');
          },
        },
      ]);
    }
  };

  _startSearching = () => {
    this.setState({isMakingOrder: true});
  };

  _stopSearching = async () => {
    // trước khi stop thì xóa products, xóa order, xóa buyer
    Alert.alert(global.__APP_NAME__, 'Are you sure want to cancel order?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Confirm', onPress: () => this._cancel()},
    ]);
  };

  _cancel = async () => {
    this.setState({
      loading: true,
    });
    await this._deleteBuyer();
    await this._deleteProducts();
    await this._deleteOrder();
    this.setState({
      isMakingOrder: false,
      orderDetail: {},
      loading: false,
    });
  };

  _deleteBuyer = async () => {
    const {orderDetail} = this.state;
    console.log(orderDetail);
    const path = '/api/v1/buyer/' + orderDetail.buyer_id;
    const {response, error} = await APIClient.getInstance().DELETE(path);
    console.log(response, error);
  };

  _deleteOrder = async () => {
    const {orderDetail} = this.state;

    const path = '/api/v1/order/' + orderDetail.order_id;
    const {response, error} = await APIClient.getInstance().DELETE(path);
    console.log(response, error);
  };

  _deleteProducts = async () => {
    const {orderDetail} = this.state;

    const path = '/api/v1/order/product/order/' + orderDetail.order_id;
    const {response, error} = await APIClient.getInstance().DELETE(path);
    console.log(response, error);
  };

  _showShoppingList = () => {
    this.setState({visibleShoppingList: true});
  };

  _hideShoppingList = () => {
    this.setState({visibleShoppingList: false});
  };

  _onChangeDeliveryFrom = async text => {
    console.log(text);
    const deliveryFromCoords = {
      lat: 0,
      lng: 0,
    };
    const {
      response,
      error,
    } = await GeolocationUtils.getInstance().getCoordinates(text);
    console.log(response, error);
    if (!_.isEmpty(response) && !_.isEmpty(response.results)) {
      deliveryFromCoords.lat = response.results[0].geometry.location.lat;
      deliveryFromCoords.lng = response.results[0].geometry.location.lng;
    }

    this.setState({
      deliveryFrom: text,
      deliveryFromCoords,
    });
  };

  _onChangeDeliveryTo = async text => {
    const deliveryToCoords = {
      lat: 0,
      lng: 0,
    };
    const {
      response,
      error,
    } = await GeolocationUtils.getInstance().getCoordinates(text);
    console.log(response, error);
    if (!_.isEmpty(response) && !_.isEmpty(response.results)) {
      deliveryToCoords.lat = response.results[0].geometry.location.lat;
      deliveryToCoords.lng = response.results[0].geometry.location.lng;
    }

    this.setState({
      deliveryTo: text,
      deliveryToCoords,
    });
  };

  _onChangeDeliveryTime = value => {
    const deliveryTime = moment(value, 'DD/MM/YYYY HH:mm');
    this.setState({deliveryTime});
  };

  _startMakingOrder = async () => {
    const {
      deliveryFrom,
      deliveryFromCoords,
      deliveryTo,
      deliveryTime,
      deliveryToCoords,
    } = this.state;

    const itemsFromShoppingList = shoppingListManager.getItemList() || [];
    const totalCost = _.sumBy(itemsFromShoppingList, object => {
      return object.price * object.amount;
    });
    const user = userManager.getUser() || {};

    if (_.isEmpty(user)) return;

    if (
      _.isEmpty(deliveryFrom) ||
      _.isEmpty(deliveryTo) ||
      _.isEmpty(deliveryTime)
    ) {
      Alert.alert(__APP_NAME__, 'All fields must be not empty');
      return;
    }

    if (_.isEmpty(itemsFromShoppingList)) {
      Alert.alert(
        __APP_NAME__,
        'Your shopping list are empty. Please add at least one item',
      );
      return;
    }

    const buyingPlace = deliveryFrom.split(',')[0].trim();
    const buyingStreet = deliveryFrom.split(',')[1].trim();
    const buyingCity = deliveryFrom.split(',')[2].trim();
    const buyingCountry = deliveryFrom.split(',')[3].trim();
    const buyingDate = moment().format('YYYY-MM-DD');
    const buyingTime = moment().format('HH:mm:ss');

    const shipPlace = deliveryTo.split(',')[0].trim();
    const shipStreet = deliveryTo.split(',')[1].trim();
    const shipCity = deliveryTo.split(',')[2].trim();
    const shipCountry = deliveryTo.split(',')[3].trim();
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
      buying_geo_long: deliveryFromCoords.lng,
      buying_geo_lat: deliveryFromCoords.lat,
      ship_place: shipPlace,
      ship_street: shipStreet,
      ship_city: shipCity,
      ship_country: shipCountry,
      ship_time: shipTime,
      ship_date: shipDate,
      ship_geo_long: deliveryToCoords.lng,
      ship_geo_lat: deliveryToCoords.lat,
      shopping_cost: totalCost,
    };

    this.setState({loading: true});
    const {response, error} = await APIClient.getInstance().jsonPOST(
      path,
      data,
    );
    console.log('response===>', response);
    if (response) {
      const {buyer_id} = response;
      const order_id = await this._createOrder(buyer_id, totalCost);
      console.log('order_id', itemsFromShoppingList);
      if (order_id) {
        await Promise.all(
          itemsFromShoppingList.map(item =>
            this._uploadShoppingList(item, order_id),
          ),
        );
        this.setState({orderDetail: {...response, order_id}});
        Alert.alert(__APP_NAME__, 'Created successful');
        this._startSearching();
      } else {
        Alert.alert(__APP_NAME__, 'Errors occured!');
      }
    } else {
      Alert.alert(__APP_NAME__, 'Errors occured, create order failed!');
    }
    this.setState({loading: false});
  };

  _createOrder = async (buyer_id, price) => {
    const path = '/api/v1/order';
    const data = {
      buyer_id,
      date_created: moment().format('YYYY-MM-DD'),
      time_created: moment().format('HH:mm:ss'),
      price,
    };
    const {response, error} = await APIClient.getInstance().jsonPOST(
      path,
      data,
    );
    console.log(response, error);
    if (response && response.order_id) {
      return response.order_id;
    }
    return false;
  };

  _uploadShoppingList = async (item, order_id) => {
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
      console.log('create successfu');
    } else {
      Alert.alert(
        __APP_NAME__,
        'Something happened with uploading shopping list. Abort this session!',
      );
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

  _getSuppliersNearby = async event => {
    console.log(event.nativeEvent);
    const {coordinate} = event.nativeEvent ? event.nativeEvent : event;

    this.setState({tappedLocation: coordinate});
    const {response, error} = await GeolocationUtils.getInstance().getAddress(
      coordinate,
    );
    console.log(response, error);

    let address = {};

    if (!_.isEmpty(response) && !_.isEmpty(response.results)) {
      address = response.results[0];
    }

    if (_.isEmpty(address)) return;

    const {address_components} = address;
    const searchCountry =
      _.find(address_components, item => {
        return _.find(item.types, o => {
          return o === 'country';
        });
      }) || '';
    const searchCity =
      _.find(address_components, item => {
        return _.find(item.types, o => {
          return o === 'administrative_area_level_1';
        });
      }) || '';
    // const searchDistrict = _.find(address_components, (item) => { return _.find(item.types, (o) => { return o === 'administrative_area_level_2'})}) || ''
    const searchStreet =
      _.find(address_components, item => {
        return _.find(item.types, o => {
          return o === 'route';
        });
      }) || '';

    this._searchOfferNearby('', searchCity);
  };

  _searchOfferNearby = async (searchStreet, searchCity) => {
    const buying_street = searchStreet.long_name;
    const buying_city = searchCity.long_name;
    const path = '/api/v1/supplier/search';
    const params = {
      buying_city,
      buying_street,
    };
    // this.setState({ loading: true })
    const {response, error} = await APIClient.getInstance().GET(path, params);
    console.log(response);
    if (response && !_.isEmpty(response)) {
      this.setState({suppliersNearby: response});
    }
  };

  render() {
    const {
      isMakingOrder,
      visibleShoppingList,
      deliveryFrom,
      deliveryTo,
      deliveryTime,
      loading,
      visibleModalDeliveryFrom,
      visibleModalDeliveryTo,
      orderDetail,
      suppliersNearby,
      tappedLocation,
    } = this.state;
    return (
      <View style={styles.container}>
        <MapScreen
          mapViewProps={{
            onPress: this._getSuppliersNearby,
          }}
          supplierMarkers={suppliersNearby}
          tappedLocation={tappedLocation}
        />
        <View style={styles.screenTitleContainer}>
          <Text style={styles.screenTitle}>Offers nearby</Text>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('OffersNearby')}
            style={styles.screenTitleBtn}>
            <Image
              source={require('../resources/images/buyer/caret-right.png')}
            />
          </TouchableOpacity>
        </View>
        {isMakingOrder && !_.isEmpty(orderDetail) && (
          <OfferPopup
            navigation={this.props.navigation}
            orderDetail={orderDetail}
          />
        )}
        <View style={styles.buyForm}>
          {isMakingOrder && !_.isEmpty(orderDetail) ? (
            <View style={styles.orderInfo}>
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
                  <View style={styles.orderDetailRow}>
                    <View style={styles.rowIcon}>
                      <Image
                        source={require('../resources/images/buyer/marker.png')}
                      />
                    </View>
                    <Text style={styles.rowLabel}>
                      {orderDetail.buying_place}, {orderDetail.buying_street},{' '}
                      {orderDetail.buying_city}, {orderDetail.buying_country}
                    </Text>
                  </View>
                  <View style={styles.orderDetailRow}>
                    <View style={styles.rowIcon}>
                      <Image
                        source={require('../resources/images/buyer/corner-down-right.png')}
                      />
                    </View>
                    <Text style={styles.rowLabel}>
                      {orderDetail.ship_place}, {orderDetail.ship_street},{' '}
                      {orderDetail.ship_city}, {orderDetail.ship_country}
                    </Text>
                  </View>
                  <View style={styles.orderDetailRow}>
                    <View style={styles.rowIcon}>
                      <Icons.FontAwesome
                        name="clock-o"
                        size={20}
                        color="#707070"
                      />
                    </View>
                    <Text style={styles.rowLabel}>
                      {orderDetail.buying_date}, {orderDetail.ship_date}
                    </Text>
                  </View>
                  <View style={styles.orderDetailRow}>
                    <View style={styles.rowIcon}>
                      <Image
                        source={require('../resources/images/buyer/shopping-cart.png')}
                      />
                    </View>
                    <TouchableOpacity onPress={this._showShoppingList}>
                      <Text
                        style={[
                          styles.rowLabel,
                          {textDecorationLine: 'underline'},
                        ]}>
                        Shopping List
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Dialog
                    visible={visibleShoppingList}
                    onTouchOutside={this._hideShoppingList}
                    dialogAnimation={
                      new SlideAnimation({
                        slideFrom: 'bottom',
                      })
                    }>
                    <ShoppingListContent
                      orderDetail={orderDetail}
                      _hideShoppingList={this._hideShoppingList}
                    />
                  </Dialog>
                </View>
              </View>
              <View style={styles.orderDesContainer}>
                <Text style={styles.orderDescription}>
                  Comment: Lorem ipsum dolor sit amet
                </Text>
              </View>
              <GradientButton label="Cancel" _onPress={this._stopSearching} />
            </View>
          ) : (
            <View>
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
              <GradientButton
                label="Make Order"
                _onPress={this._startMakingOrder}
              />
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
            </View>
          )}
        </View>
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
        {/* <KeyboardSpacer /> */}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 67,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 0,
    color: '#707070',
  },
  screenTitleBtn: {
    padding: 25,
    position: 'absolute',
    right: 0,
  },
  buyForm: {
    paddingHorizontal: 27,
    paddingVertical: 22,
    backgroundColor: '#fff',
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
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
  orderInfo: {},
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
    flex: 1,
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  orderDesContainer: {
    paddingTop: 13,
  },
  orderDescription: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  cancelSearchBtnWrapper: {
    marginTop: 4,
    alignItems: 'center',
  },
});
