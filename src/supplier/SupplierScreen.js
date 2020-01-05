import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import GradientHeader from '../commons/GradientHeader';
import MapView, {Marker} from 'react-native-maps';
import SafeAreaView from 'react-native-safe-area-view';
import LinearGradient from 'react-native-linear-gradient';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Icons from '../utils/Icons';
import Dialog, {SlideAnimation} from 'react-native-popup-dialog';
import moment from 'moment';
import _ from 'lodash';
import APIClient from '../utils/APIClient';
import LocationManager from '../manager/LocationManager';
import UserManager from '../manager/UserManager';
import Utils from '../utils/Utils';
import DatePicker from 'react-native-datepicker';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import MapScreen from '../commons/MapScreen';
import FormInteractField from '../commons/FormInteractField';
import FormInput from '../commons/FormInput';
import ModalLocation from '../commons/ModalLocation';
import OrderPopup from './OrderPopup';
import AbsoluteLoadingScreen from '../commons/AbsoluteLoadingScreen';
import FastImage from 'react-native-fast-image';
import GeolocationUtils from '../utils/GeolocationUtils';

const locationManager = LocationManager.getInstance();
const userManager = UserManager.getInstance();

export default class SupplierScreen extends Component {
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

    // console.log('this.props.navigation.state.params', this.props.navigation.state.params.offerDetail)
    const isMakingOffer = this.props.navigation.state.params
      ? this.props.navigation.state.params.isMakingOffer
      : null;
    const offerDetail = this.props.navigation.state.params
      ? this.props.navigation.state.params.offerDetail
      : null;

    this.state = {
      isMakingOffer: isMakingOffer || false,
      // deliveryFrom: 'Sity mall, Green street, 4',
      // deliveryTo: 'Soborna street, 11, Sumy...',
      deliveryFrom: '',
      deliveryFromCoords: {},
      deliveryTo: '',
      deliveryToCoords: {},
      deliveryTime: moment(),
      deliveryDistance: '0',
      deliveryCost: '0',

      //modal visible
      visibleModalDeliveryFrom: false,
      visibleModalDeliveryTo: false,

      // state loading
      loading: false,

      // state lưu thông tin đơn sau khi tạo offer
      offerDetail: offerDetail || {},

      // những người buyer ở gần điểm được chọn
      buyersNearby: [],
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
      this._getBuyersNearby(inititalCoords);
    }
  };

  _goBack = () => {
    const {offerDetail} = this.state;
    if (_.isEmpty(offerDetail)) this.props.navigation.navigate('MainTab');
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

  _onChangeDeliveryFrom = async text => {
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

  _onChangeDeliveryDistance = text => {
    this.setState({deliveryDistance: text});
  };

  _onChangeDeliveryCost = text => {
    this.setState({deliveryCost: text});
  };

  _makeOffer = async () => {
    Keyboard.dismiss();
    const {
      deliveryFrom,
      deliveryFromCoords,
      deliveryTo,
      deliveryToCoords,
      deliveryTime,
      deliveryDistance,
      deliveryCost,
    } = this.state;
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

    // if(deliveryDistance === '0') {
    //     Alert.alert(__APP_NAME__, 'The distance cannot be zero');
    //     return
    // }

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

    const path = '/api/v1/supplier';
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
      shipping_cost: deliveryCost,
    };

    // console.log('data', data)
    // return

    this.setState({loading: true});
    const {response, error} = await APIClient.getInstance().jsonPOST(
      path,
      data,
    );
    console.log(response);
    if (response && response.supplier_id) {
      const {supplier_id} = response;
      const order_id = await this._createOrder(supplier_id, deliveryCost);
      console.log('order_id', order_id);
      if (order_id) {
        this.setState({offerDetail: {...response, order_id}});
        Alert.alert(__APP_NAME__, 'Created offer successful');
        this.setState({isMakingOffer: true});
      } else {
        Alert.alert(__APP_NAME__, 'Errors occured!');
      }
    } else {
      Alert.alert(__APP_NAME__, 'Errors occured, create order failed!');
    }
    this.setState({loading: false});
  };

  _createOrder = async (supplier_id, shipping_cost) => {
    const path = '/api/v1/order';
    const data = {
      supplier_id,
      ship_price_supplier: shipping_cost,
      date_created: moment().format('YYYY-MM-DD'),
      time_created: moment().format('HH:mm:ss'),
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

  _confirmCancel = async () => {
    // trước khi stop thì xóa products, xóa order, xóa buyer
    Alert.alert(global.__APP_NAME__, 'Are you sure want to delete offer?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Confirm', onPress: () => this._cancel()},
    ]);
  };

  _cancel = async () => {
    this.setState({loading: true});
    await this._deleteSupplier();
    await this._deleteOrder();
    this.setState({
      isMakingOffer: false,
      offerDetail: {},
      loading: false,
    });
  };

  _deleteSupplier = async () => {
    const {offerDetail} = this.state;
    console.log(offerDetail);
    const path = '/api/v1/supplier/' + offerDetail.supplier_id;
    const {response, error} = await APIClient.getInstance().DELETE(path);
    console.log(response, error);
  };

  _deleteOrder = async () => {
    const {offerDetail} = this.state;

    const path = '/api/v1/order/' + offerDetail.order_id;
    const {response, error} = await APIClient.getInstance().DELETE(path);
    console.log(response, error);
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

  _getBuyersNearby = async event => {
    console.log(event.nativeEvent);
    const {coordinate} = event.nativeEvent ? event.nativeEvent : event;

    this.setState({tappedLocation: coordinate});
    const {response, error} = await GeolocationUtils.getInstance().getAddress(
      coordinate,
    );
    // console.log(response, error)
    // return

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

    this._searchOrdersNearby('', searchCity);
  };

  _searchOrdersNearby = async (searchStreet, searchCity) => {
    const buying_street = searchStreet.long_name;
    const buying_city = searchCity.long_name;
    const path = '/api/v1/buyer/search';
    const params = {
      buying_city,
      buying_street,
    };
    // this.setState({ loading: true })
    const {response, error} = await APIClient.getInstance().GET(path, params);
    console.log(response);
    if (response && !_.isEmpty(response)) {
      this.setState({buyersNearby: response});
    }
  };

  render() {
    const {
      isMakingOffer,
      visibleShoppingList,
      deliveryFrom,
      deliveryTo,
      deliveryTime,
      deliveryDistance,
      deliveryCost,
      visibleModalDeliveryFrom,
      visibleModalDeliveryTo,
      loading,
      offerDetail,
      buyersNearby,
      tappedLocation,
    } = this.state;
    console.log('offerDetail', offerDetail);
    return (
      <View style={styles.container}>
        <MapScreen
          mapViewProps={{
            onPress: this._getBuyersNearby,
          }}
          buyerMarkers={buyersNearby}
          tappedLocation={tappedLocation}
        />
        <View style={styles.screenTitleContainer}>
          <Text style={styles.screenTitle}>Orders nearby</Text>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('OrdersNearby')}
            style={styles.screenTitleBtn}>
            <Image
              source={require('../resources/images/buyer/caret-right.png')}
            />
          </TouchableOpacity>
        </View>
        {isMakingOffer && !_.isEmpty(offerDetail) && (
          <OrderPopup
            navigation={this.props.navigation}
            offerDetail={offerDetail}
          />
        )}
        <View style={styles.buyForm}>
          {isMakingOffer && !_.isEmpty(offerDetail) ? (
            <View style={styles.orderInfo}>
              <View style={styles.orderMainInfo}>
                <View style={styles.customerContainer}>
                  <FastImage
                    style={styles.customerAvatar}
                    resizeMode={FastImage.resizeMode.cover}
                    source={
                      offerDetail.avatar
                        ? {uri: `data:image/gif;base64,${offerDetail.avatar}`}
                        : require('../resources/images/buyer/default-avatar.png')
                    }
                  />
                  <Text style={styles.customerName}>
                    {offerDetail.fullname || 'Unknow'}
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
                      {/* Sity mall, Green street, 4 */}
                      {offerDetail.buying_place}, {offerDetail.buying_street},{' '}
                      {offerDetail.buying_city}, {offerDetail.buying_country}
                    </Text>
                  </View>
                  <View style={styles.orderDetailRow}>
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
                  <View style={styles.orderDetailRow}>
                    <View style={styles.rowIcon}>
                      <Icons.FontAwesome
                        name="clock-o"
                        size={20}
                        color="#707070"
                      />
                    </View>
                    <Text style={styles.rowLabel}>
                      {/* 12.05, 13:00 */}
                      {offerDetail.buying_date}, {offerDetail.ship_date}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.deliveryCostContainer}>
                <Text style={styles.deliveryCost}>Delivery cost (km)</Text>
                <Text style={[styles.deliveryCost, {fontSize: 24}]}>
                  {offerDetail.shipping_cost || 0} $
                </Text>
              </View>
              <View style={styles.cancelSearchBtnWrapper}>
                <TouchableOpacity
                  onPress={this._confirmCancel}
                  style={styles.gradientBtn}>
                  <LinearGradient
                    style={styles.gradientBtnBackground}
                    colors={['#E8222B', '#141414']}>
                    <Text style={styles.gradientBtnLabel}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
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
              <FormInput
                label="Delivery cost ($)"
                labelStyle={{width: 175}}
                value={deliveryCost}
                onChangeText={this._onChangeDeliveryCost}
                keyboardType="numeric"
                returnKeyType="done"
              />
              <View style={styles.gradientBtnWrapper}>
                <TouchableOpacity
                  onPress={this._makeOffer}
                  style={styles.gradientBtn}>
                  <LinearGradient
                    style={styles.gradientBtnBackground}
                    colors={['#E8222B', '#141414']}>
                    <Text style={styles.gradientBtnLabel}>Make Offer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <KeyboardSpacer />
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
    // position: 'absolute',
    // bottom: 0,
    // left: 0,
    // right: 0,
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
  gradientBtnWrapper: {
    alignItems: 'center',
    marginTop: 25,
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
  deliveryCostContainer: {
    marginVertical: 24,
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
  cancelSearchBtnWrapper: {
    marginTop: 4,
    alignItems: 'center',
  },
});
