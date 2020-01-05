import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import LocationManager from '../manager/LocationManager';
import ShoppingListManager from '../manager/ShoppingListManager';
import UserManager from '../manager/UserManager';
import GradientHeader from '../commons/GradientHeader';
import MapScreen from '../commons/MapScreen';
import OfferPopup from './OfferPopup';
import MapView, {Marker} from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Icons from '../utils/Icons';
import Dialog, {SlideAnimation} from 'react-native-popup-dialog';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import _ from 'lodash';
import APIClient from '../utils/APIClient';
import ModalPickup from '../commons/ModalPickup';
import AbsoluteLoadingScreen from '../commons/AbsoluteLoadingScreen';
import FormInteractField from '../commons/FormInteractField';
import GradientButton from '../commons/GradientButton';
import ModalLocation from '../commons/ModalLocation';
import FastImage from 'react-native-fast-image';
import GeolocationUtils from '../utils/GeolocationUtils';
// import ShoppingListContent from './ShoppingListContent'

const locationManager = LocationManager.getInstance();
const shoppingListManager = ShoppingListManager.getInstance();
const userManager = UserManager.getInstance();

export default class PassengerScreen extends Component {
  static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      headerTitleStyle: {color: '#fff'},
      headerStyle: {
        backgroundColor: 'transparent',
      },
      header: props => <GradientHeader {...props} />,
      headerTitle: <Text style={styles.headerTitle}>Passenger</Text>,
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
      isMakingOrder: false,
      deliveryFrom: '',
      deliveryFromCoords: {},
      deliveryTo: '',
      deliveryToCoords: {},
      deliveryTime: moment(),
      loading: false,
      visibleShoppingList: false,
      visibleModalDeliveryFrom: false,
      visibleModalDeliveryTo: false,
      visibleModalPickup: false,
      orderDetail: {},
      suppliersNearby: [],
      visibleShoppingList: false,
      number_people: '',
      radius: '',
    };
  }

  _showShoppingList = () => {
    this.setState({visibleShoppingList: true});
  };

  _hideShoppingList = () => {
    this.setState({visibleShoppingList: false});
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

  _openModalPickup = () => {
    this.setState({
      visibleModalPickup: true,
    });
  };

  _closeModalPickup = () => {
    this.setState({
      visibleModalPickup: false,
    });
  };

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
    await this._deletePassenger();
    await this._deleteCarpooling();
    this.setState({
      isMakingOrder: false,
      orderDetail: {},
      loading: false,
    });
  };

  _accept = () => {
    this.setState({isMakingOrder: false})
    this._openModalPickup();
  }

  _deletePassenger = async () => {
    const {orderDetail} = this.state;
    console.log(orderDetail);
    const path = '/api/v1/passenger/' + orderDetail.passenger_id;
    const {response, error} = await APIClient.getInstance().DELETE(path);
    console.log(response, error);
  };

  _deleteCarpooling = async () => {
    const {orderDetail} = this.state;
    const path = '/api/v1/carpooling/' + orderDetail.carpooling_id;
    const {response, error} = await APIClient.getInstance().DELETE(path);
    console.log(response, error);
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

  _onChangePickup = async text => {
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

  _startMakingOrder = async () => {
    const {
      deliveryFrom,
      deliveryFromCoords,
      deliveryTo,
      deliveryTime,
      deliveryToCoords,
      number_people,
      radius,
    } = this.state;
    const user = userManager.getUser() || {};

    if (_.isEmpty(user)) return;

    if (
      _.isEmpty(deliveryFrom) ||
      _.isEmpty(deliveryTo) ||
      _.isEmpty(deliveryTime) ||
      _.isEmpty(number_people)
    ) {
      Alert.alert(__APP_NAME__, 'All fields must be not empty');
      return;
    }

    const fromPlace = deliveryFrom.split(',')[0].trim();
    const fromStreet = deliveryFrom.split(',')[1].trim();
    const fromCity = deliveryFrom.split(',')[2].trim();
    const fromCountry = deliveryFrom.split(',')[3].trim();

    const toPlace = deliveryTo.split(',')[0].trim();
    const toStreet = deliveryTo.split(',')[1].trim();
    const toCity = deliveryTo.split(',')[2].trim();
    const toCountry = deliveryTo.split(',')[3].trim();
    const goDate = deliveryTime.format('YYYY-MM-DD');
    const goTime = deliveryTime.format('HH:mm:ss');
    console.log('goDate', deliveryTime.format('YYYY-MM-DD'))
    const path = '/api/v1/passenger';
    const data = {
      user_id: user.user_id,
      // current_place: "currentPlace",
      // current_street: currentStreet,
      // current_city: currentCity,
      // current_country: currentCountry,
      from_place: fromPlace,
      from_street: fromStreet,
      from_city: fromCity,
      from_country: fromCountry,
      go_time: goTime,
      go_date: goDate,
      current_geo_long: deliveryFromCoords.lng,
      current_geo_lat: deliveryFromCoords.lat,
      to_place: toPlace,
      to_street: toStreet,
      to_city: toCity,
      to_country: toCountry,
      to_geo_long: deliveryToCoords.lng,
      to_geo_lat: deliveryToCoords.lat,
      number_people: number_people,
      radius: radius,
    };


    this.setState({loading: true});
    const {response, error} = await APIClient.getInstance().jsonPOST(
      path,
      data,
    );
    console.log('response===>', response);
    if(response){
        const { passenger_id } = response
        const carpooling_id = await this._createOrder(passenger_id)
        if(carpooling_id) {
          this.setState({ orderDetail: {...response, carpooling_id} })
          Alert.alert(__APP_NAME__, 'Created successful')
          this._startSearching();
        }
        else {
          Alert.alert(__APP_NAME__, 'Errors occured!')
        }
    }
    else {
      Alert.alert(__APP_NAME__, 'Errors occured, create order failed!')
    }
    this.setState({loading: false});
  };

  _createOrder = async (passenger_id) => {
    const path = '/api/v1/carpooling';
    const data = {
      passenger_id,
      date_created: moment().format('YYYY-MM-DD'),
      time_created: moment().format('HH:mm:ss'),
    };
    const {response, error} = await APIClient.getInstance().jsonPOST(
      path,
      data,
    );
    console.log(response, error);
    if (response && response.carpooling_id) {
      return response.carpooling_id;
    }
    return false;
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
      deliveryFrom,
      deliveryTo,
      deliveryTime,
      loading,
      visibleModalDeliveryFrom,
      visibleModalDeliveryTo,
      visibleShoppingList,
      visibleModalPickup,
      number_people,
      radius,
      orderDetail,
      suppliersNearby,
      tappedLocation
    } = this.state;
    console.log("orderdetail====>",this.state.orderDetail)
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
          onPress={() => this.props.navigation.navigate('PassengerNearby')}
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
          _accept={this._accept}
        />
      )}
        <View style={styles.buyForm}>
          {isMakingOrder ? (
            <View style={styles.orderInfo}>
              <View style={styles.orderMainInfo}>
                <View style={styles.customerContainer}>
                  <FastImage
                    style={styles.customerAvatar}
                    resizeMode={FastImage.resizeMode.cover}
                    source={
                      require('../resources/images/buyer/default-avatar.png')
                    }
                  />
                  <Text style={styles.customerName}>
                    {orderDetail.fullname || 'Unknow'}
                  </Text>
                </View>
                <View style={[styles.orderDetail, {width:'100%'}]}>
                  <View style={styles.orderDetailRow}>
                    <View style={styles.rowIcon}>
                      <Image
                        source={require('../resources/images/buyer/marker.png')}
                      />
                    </View>
                    <Text style={styles.rowLabel}>
                      {orderDetail.from_place}, {orderDetail.from_street},{' '}
                      {orderDetail.from_city}, {orderDetail.from_country}
                    </Text>
                  </View>
                  <View style={styles.orderDetailRow}>
                    <View style={styles.rowIcon}>
                      <Image
                        source={require('../resources/images/buyer/corner-down-right.png')}
                      />
                    </View>
                    <Text style={styles.rowLabel}>
                      {orderDetail.to_place}, {orderDetail.to_street},{' '}
                      {orderDetail.to_city}, {orderDetail.to_country}
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
                    {orderDetail.go_date}, {orderDetail.go_time}
                    </Text>
                    <View style={[styles.rowIcon, {marginLeft: 30}]}>
                      <Icons.FontAwesome
                        name="group"
                        size={20}
                        color="#707070"
                      />
                    </View>
                    <Text style={styles.rowLabel}>
                      {orderDetail.number_people}
                    </Text>
                    <View style={[styles.rowIcon, {marginLeft: 30}]}>
                      <Image
                        source={require('../resources/images/driver/bookmark.png')}
                      />
                    </View>
                  </View>
                  <Dialog
                    visible={visibleShoppingList}
                    onTouchOutside={this._hideShoppingList}
                    dialogAnimation={
                      new SlideAnimation({
                        slideFrom: 'bottom',
                      })
                    }></Dialog>
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
                <TouchableOpacity style={[styles.shoppingListBtn, {flex: 1}]}>
                  <Icons.FontAwesome
                    style={{marginLeft: 10}}
                    name="group"
                    size={20}
                    color="#707070"
                  />
                  <TextInput
                    placeholder="0"
                    editable={true}
                    value={number_people}
                    onChangeText={text => this.setState({number_people: text})}
                    style={[
                      styles.commonTextInput,
                      {fontSize: 15, marginLeft: 10},
                    ]}
                  />
                  <Image
                    style={{marginRight: 10}}
                    source={require('../resources/images/settings/edit.png')}
                  />
                </TouchableOpacity>
                <View style={{width: 10}} />
                <View
                  style={[
                    styles.commonInputContainer,
                    styles.radiusFilter,
                    {flex: 1},
                  ]}>
                  <TextInput
                    placeholder="Radius"
                    editable={true}
                    value={radius}
                    onChangeText={text => this.setState({radius: text})}
                    style={{marginLeft: 10, fontSize: 15}}
                  />
                  <Text
                    style={{
                      position: 'absolute',
                      right: 10,
                      fontSize: 19,
                      fontFamily: 'bold',
                      color: '#319800',
                    }}>
                    km
                  </Text>
                </View>
                <View style={{width: 10}} />
                <TouchableOpacity style={[styles.commentBtn, {flex: 1}]}>
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
        <Dialog
          visible={visibleModalPickup}
          onTouchOutside={this._closeModalPickup}>
          <ModalPickup
            onChangeLocation={this._onChangePickup}
            closeModal={this._closeModalPickup}
            carpooling_id={orderDetail.carpooling_id}
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
  commonInputContainer: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C2C2C2',
    borderStyle: 'solid',
    borderRadius: 15,
  },
  radiusFilter: {
    // width: 127,
    flex: 1,
    height: 40,
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
    height: 53,
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
    paddingVertical: 15,
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
  },
  buyBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderColor: '#707070',
  },
  shoppingListBtn: {
    height: 40,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#707070',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  shoppingListBtnLabel: {
    fontSize: 16,
    color: '#707070',
    marginLeft: 8,
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
    fontSize: 12,
    color: '#fff',
  },
  gradientBtnWrapper: {
    alignItems: 'center',
    marginTop: 10,
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
  orderInfo: {
    width: '100%',
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
  },
  orderDetail: {
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
    textAlign: 'center',
    letterSpacing: 0,
  },
  cancelSearchBtnWrapper: {
    marginTop: 4,
    alignItems: 'center',
  },
  popupPurpose: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 15,
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
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
  reviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviews: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  reviewText: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
    fontWeight: '700',
  },
  deliveryContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  delivery: {
    flex: 1,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  deliveryCost: {
    alignItems: 'center',
  },
  deliveryCostText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#319800',
  },
  deliveryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryActionBtn: {
    width: 120,
    borderRadius: 15,
    overflow: 'hidden',
  },
  deliveryActionBackground: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  deliveryActionText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0,
  },
});
