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
  Keyboard,
} from 'react-native';
import GradientHeader from '../commons/GradientHeader';
import LinearGradient from 'react-native-linear-gradient';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import Icons from '../utils/Icons';
import FastImage from 'react-native-fast-image';
import SafeAreaView from 'react-native-safe-area-view';
import Interactable from 'react-native-interactable';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import APIClient from '../utils/APIClient';
import _ from 'lodash';
import {commonDatePickerProps} from '../commons/Constant';
import UserManager from '../manager/UserManager';
import AbsoluteLoadingScreen from '../commons/AbsoluteLoadingScreen';
import FormInteractField from '../commons/FormInteractField';
import Dialog, {SlideAnimation} from 'react-native-popup-dialog';
import ModalLocation from '../commons/ModalLocation';
import BottomSheet from '../commons/BottomSheet';

const userManager = UserManager.getInstance();

const DATA = [
  {
    supplierName: 'Jane Dou',
    from: 'Sity mall, Green street, 4',
    to: 'Soborna street, 11, Sumy',
    time: '13:00 - 14:00',
    cost: '2',
    currency: '$',
  },
  {
    supplierName: 'Jone Dou',
    from: 'Sity mall, Green street, 4',
    to: 'Soborna street, 11, Sumy',
    time: '13:00 - 14:00',
    cost: '1',
    currency: '$',
  },
  {
    supplierName: 'Johe Dou',
    from: 'Sity mall, Green street, 4',
    to: 'Soborna street, 11, Sumy',
    time: '13:00 - 14:00',
    cost: '4',
    currency: '$',
  },
  {
    supplierName: 'Jae Dou',
    from: 'Sity mall, Green street, 4',
    to: 'Soborna street, 11, Sumy',
    time: '13:00 - 14:00',
    cost: '6',
    currency: '$',
  },
  {
    supplierName: 'Jeoh Dou',
    from: 'Sity mall, Green street, 4',
    to: 'Soborna street, 11, Sumy',
    time: '13:00 - 14:00',
    cost: '5',
    currency: '$',
  },
  {
    supplierName: 'Jane Dou',
    from: 'Sity mall, Green street, 4',
    to: 'Soborna street, 11, Sumy',
    time: '13:00 - 14:00',
    cost: '2',
    currency: '$',
  },
  {
    supplierName: 'Jane Dou',
    from: 'Sity mall, Green street, 4',
    to: 'Soborna street, 11, Sumy',
    time: '13:00 - 14:00',
    cost: '2',
    currency: '$',
  },
];

const OrderItem = props => {
  const {item, _viewBuyerOrder, _takeOrder} = props;
  return (
    <View style={styles.orderItem}>
      <View style={styles.orderMainInfo}>
        <View style={styles.supplierContainer}>
          <FastImage
            style={styles.supplierAvatar}
            source={
              item.avatar
                ? {uri: `data:image/gif;base64,${item.avatar}`}
                : require('../resources/images/buyer/default-avatar.png')
            }
          />
          <Text style={styles.supplierName}>{item.fullname || 'Unknow'}</Text>
          <Text style={styles.supplierName}>{item.distance || '...'} km</Text>
        </View>
        <View style={{flex: 1}}>
          <View style={{flex: 1, flexDirection: 'row', marginTop: 8}}>
            <TouchableOpacity
              onPress={() => _viewBuyerOrder(item)}
              style={styles.viewOrderDetail}>
              <Text style={styles.viewOrderDetailText}>View Order Details</Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.orderDeliveryCost,
                {fontSize: 24, textAlign: 'center'},
              ]}>
              {item.shopping_cost.toLocaleString()} $
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => _takeOrder(item)}
            style={styles.gradientButton}>
            <LinearGradient
              colors={['#E8222B', '#141414']}
              style={styles.gradienButtonBackground}>
              <Text style={styles.gradienButtonLabel}>Take Order</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default class OrdersNearbyScreen extends Component {
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

    this.state = {
      // buyLocation: 'Hoang Quoc Viet, Ha Noi',
      // shipLocation: 'Tran Cung, Ha Noi',
      buyLocation: '',
      shipLocation: '',
      buyPlace: '',
      buyStreet: '',
      buyCity: '',
      buyCountry: '',
      shipPlace: '',
      shipStreet: '',
      shipCity: '',
      shipCountry: '',
      radius: '0',
      radiusUnit: 'km',
      buyDate: moment('10/11/2019', 'DD/MM/YYYY'),
      shipDate: moment('10/11/2019', 'DD/MM/YYYY'),
      orderList: [],
      loading: false,

      //modal visible
      visibleModalBuyLocation: false,
      visibleModalShipLocation: false,
      visibleModalShipCost: false,
    };
  }

  _renderItem = ({item}) => {
    return (
      <OrderItem
        item={item}
        _viewBuyerOrder={this._viewBuyerOrder}
        _takeOrder={this._takeOrder}
      />
    );
  };

  _keyExtractor = (item, index) => {
    return index.toString();
  };

  _renderHeader = () => {
    return (
      <Text
        style={{
          textAlign: 'center',
          paddingVertical: 20,
          fontSize: 16,
          color: '#707070',
        }}>
        Suggested orders nearby are empty. Use filter to find the most suitable
        order.
      </Text>
    );
  };

  _viewBuyerOrder = item => {
    const params = {
      orderDetails: item,
    };
    this.props.navigation.navigate('BuyerOrderDetail', params);
  };

  _takeOrder = async item => {
    console.log(item);
    const user = userManager.getUser() || {};
    if (_.isEmpty(user)) return;

    this.setState({loading: true});
    const supplier_id = await this._createSupplier(item);
    const orderInfo = await this._getOrderInfo(item.buyer_id);
    // await this._createOrder(supplier_id, item)
    await this._updateOrder(supplier_id, orderInfo);
    this.setState({loading: false});
  };

  _updateOrder = async (supplier_id, orderInfo) => {
    console.log('orderInfo', orderInfo);
    const path = '/api/v1/order/' + orderInfo.order_id;
    const data = {
      ...orderInfo,
      supplier_id,
      ship_price_supplier: '10', // fake la 10
    };
    const {response, error} = await APIClient.getInstance().jsonPUT(path, data);
    console.log(response, error);
    if (response && response.order_id) {
      Alert.alert(
        __APP_NAME__,
        'Your order has been created and delivered to supplier. Wait for supplier response!',
      );
      this.props.navigation.navigate('MainTab');
      UserManager.getInstance()._getUserStatus();
      // this.props.navigation.navigate('OrderConfirmed')
    }
  };

  _getOrderInfo = async buyer_id => {
    const path = '/api/v1/order/search/buyer/' + buyer_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log(response);
    if (response && response.order_id) {
      return response;
    }
    return false;
  };

  _createOrder = async (supplier_id, item) => {
    const {buyer_id, shopping_cost, shipping_cost} = item;
    const path = '/api/v1/order';
    const data = {
      buyer_id,
      supplier_id,
      date_created: moment().format('YYYY-MM-DD'),
      time_created: moment().format('HH:mm:ss'),
      price: shopping_cost,
      ship_price_buyer: shipping_cost,
      ship_price_supplier: shipping_cost,
    };

    const {response, error} = await APIClient.getInstance().jsonPOST(
      path,
      data,
    );
    console.log(response, error);
    if (response && response.order_id) {
      Alert.alert(
        __APP_NAME__,
        'Your offer has been created and delivered to buyer. Wait for buyer response!',
      );
    }
  };

  _createSupplier = async item => {
    const user = userManager.getUser() || {};
    if (_.isEmpty(user)) return;

    const {
      buying_place,
      buying_street,
      buying_city,
      buying_country,
      buying_time,
      buying_date,
      ship_place,
      ship_street,
      ship_city,
      ship_country,
      ship_time,
      ship_date,
    } = item;

    const path = '/api/v1/supplier';
    const data = {
      user_id: user.user_id,
      buying_place,
      buying_street,
      buying_city,
      buying_country,
      buying_time,
      buying_date,
      ship_place,
      ship_street,
      ship_city,
      ship_country,
      ship_time,
      ship_date,
    };

    const {response, error} = await APIClient.getInstance().jsonPOST(
      path,
      data,
    );
    if (response && response.supplier_id) return response.supplier_id;
    else {
      Alert.alert(
        __APP_NAME__,
        'Take order failed. Check your network then try again',
      );
      return;
    }
  };

  _showSearch = () => {
    this.interactableSearch.snapTo({index: 0});
  };

  _hideSearch = () => {
    this.interactableSearch.snapTo({index: 1});
  };

  // _onChangeBuyLocation = (text) => {
  //     this.setState({
  //         buyLocation: text
  //     })
  // }

  // _onChangeShipLocation = (text) => {
  //     this.setState({
  //         shipLocation: text
  //     })
  // }

  _onChangeBuyLocation = (place, street, city, country) => {
    this.setState({
      buyPlace: place,
      buyStreet: street,
      buyCity: city,
      buyCountry: country,
    });
  };

  _onChangeShipLocation = (place, street, city, country) => {
    this.setState({
      shipPlace: place,
      shipStreet: street,
      shipCity: city,
      shipCountry: country,
    });
  };

  _onChangeBuyDate = value => {
    const buyDate = moment(value, 'DD/MM/YYYY');
    this.setState({buyDate});
  };

  _onChangeShipDate = value => {
    const shipDate = moment(value, 'DD/MM/YYYY');
    this.setState({shipDate});
  };

  _search = async () => {
    Keyboard.dismiss();
    const {
      buyLocation,
      shipLocation,
      buyPlace,
      buyStreet,
      buyCity,
      buyCountry,
      shipPlace,
      shipStreet,
      shipCity,
      shipCountry,
      buyDate,
      shipDate,
    } = this.state;

    if (
      _.isEmpty(buyStreet) &&
      _.isEmpty(buyCity) &&
      _.isEmpty(shipStreet) &&
      _.isEmpty(shipCity)
    ) {
      Alert.alert(
        __APP_NAME__,
        'Buy street, buy city, ship street and ship city fields must be not empty',
      );
      return;
    }

    // const buyingStreet = buyLocation.split(',')[1].trim()
    // const buyingCity = buyLocation.split(',')[2].trim()

    // const shipStreet = shipLocation.split(',')[1].trim()
    // const shipCity = shipLocation.split(',')[2].trim()

    const path = '/api/v1/buyer/search';
    const params = {
      buying_city: buyCity,
      buying_street: buyStreet,
      buying_date: buyDate.format('YYYY-MM-DD'),
      ship_city: shipCity,
      ship_street: shipStreet,
      ship_date: shipDate.format('YYYY-MM-DD'),
    };
    this.setState({loading: true});
    const {response, error} = await APIClient.getInstance().GET(path, params);
    console.log(response);
    if (response) {
      this.setState({orderList: response});
    }
    this._hideSearch();
    this.setState({loading: false});
  };

  _onChangeRadius = text => {
    this.setState({
      radius: text,
    });
  };

  _onChangeRadiusUnit = value => {
    this.setState({radiusUnit: value});
  };

  _onChooseOption = async value => {
    this._onChangeRadiusUnit(value);

    this.RBSheet.close();
  };

  _openModalBuyLocation = () => {
    this.setState({
      visibleModalBuyLocation: true,
    });
  };

  _closeModalBuyLocation = () => {
    this.setState({
      visibleModalBuyLocation: false,
    });
  };

  _openModalShipLocation = () => {
    this.setState({
      visibleModalShipLocation: true,
    });
  };

  _closeModalShipLocation = () => {
    this.setState({
      visibleModalShipLocation: false,
    });
  };

  _openModalShipCost = () => {
    this.setState({
      visibleModalShipCost: true,
    });
  };

  _closeModalShipCost = () => {
    this.setState({
      visibleModalShipCost: false,
    });
  };

  render() {
    const {
      buyLocation,
      shipLocation,
      buyPlace,
      buyStreet,
      buyCity,
      buyCountry,
      shipPlace,
      shipStreet,
      shipCity,
      shipCountry,
      buyDate,
      shipDate,
      radius,
      radiusUnit,
      orderList,
      loading,
      visibleModalBuyLocation,
      visibleModalShipLocation,
      visibleModalShipCost,
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
          <Text style={styles.screenTitle}>Orders Nearby</Text>
        </View>
        <SafeAreaView style={styles.mainContainer}>
          <TouchableWithoutFeedback
            onPress={this._showSearch}
            style={[styles.commonInputContainer, styles.locationField]}>
            <Text style={styles.commonTextInput}>Filter</Text>
            <Image source={require('../resources/images/buyer/location.png')} />
          </TouchableWithoutFeedback>
          <FlatList
            data={orderList}
            renderItem={this._renderItem}
            keyExtractor={this._keyExtractor}
            showsVerticalScrollIndicator={false}
            style={{flex: 1}}
            ListHeaderComponent={orderList.length === 0 && this._renderHeader}
          />
        </SafeAreaView>
        <Interactable.View
          ref={refs => (this.interactableSearch = refs)}
          verticalOnly={true}
          initialPosition={{y: __SCREEN_HEIGHT__}}
          snapPoints={[{y: 50}, {y: __SCREEN_HEIGHT__}]}
          style={[styles.interactableSearch, {elevation: 12}]}>
          <View
            style={[
              styles.interactableSearchContainer,
              styles.shadowStyle,
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
            <View style={{paddingHorizontal: 14, flex: 1}}>
              {/* <View style={[styles.commonInputContainer, styles.locationField]}>
                                <TextInput
                                    placeholder="Buy location: Street, City..."
                                    style={styles.commonTextInput}
                                    value={buyLocation}
                                    onChangeText={this._onChangeBuyLocation}
                                    />
                                <Image 
                                    source={require('../resources/images/buyer/location.png')}
                                    />
                            </View>
                            <View style={[styles.commonInputContainer, styles.locationField]}>
                                <TextInput
                                    placeholder="Ship location: Street, City..."
                                    style={styles.commonTextInput}
                                    value={shipLocation}
                                    onChangeText={this._onChangeShipLocation}
                                    />
                                <Image 
                                    source={require('../resources/images/buyer/location.png')}
                                    />
                            </View> */}
              <FormInteractField
                label="From"
                placeholder="Buy location: Street, City..."
                iconSuffix={require('../resources/images/buyer/location.png')}
                value={`${buyPlace.trim()} ${buyStreet.trim()} ${buyCity.trim()} ${buyCountry.trim()}`}
                onPressTouchableWithoutFeedback={this._openModalBuyLocation}
              />
              <FormInteractField
                label="To"
                placeholder="Ship location: Street, City..."
                iconSuffix={require('../resources/images/buyer/location.png')}
                value={`${shipPlace.trim()} ${shipStreet.trim()} ${shipCity.trim()} ${shipCountry.trim()}`}
                onPressTouchableWithoutFeedback={this._openModalShipLocation}
              />
              <TouchableWithoutFeedback
                onPress={() => this.buyDatePicker.onPressDate()}
                style={[styles.commonInputContainer, styles.timeDateField]}>
                <Text style={styles.commonTextInput}>
                  Buy date: {buyDate.format('DD/MM/YYYY')}
                </Text>
                <Image
                  source={require('../resources/images/buyer/calendar.png')}
                />
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback
                onPress={() => this.shipDatePicker.onPressDate()}
                style={[styles.commonInputContainer, styles.timeDateField]}>
                <Text style={styles.commonTextInput}>
                  Ship date: {shipDate.format('DD/MM/YYYY')}
                </Text>
                <Image
                  source={require('../resources/images/buyer/calendar.png')}
                />
              </TouchableWithoutFeedback>
              <View style={[styles.commonInputContainer, styles.radiusFilter]}>
                <TextInput
                  placeholder="Radius ..."
                  value={radius}
                  style={styles.commonTextInput}
                  onChangeText={this._onChangeRadius}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
                <TouchableWithoutFeedback
                  onPress={() => this.RBSheet.open()}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={[styles.commonTextInput, {width: 50, flex: 0}]}>
                    {radiusUnit}
                  </Text>
                  <Image
                    source={require('../resources/images/settings/caret-down.png')}
                  />
                </TouchableWithoutFeedback>
              </View>
              <View style={styles.searchRow}>
                <TouchableOpacity
                  onPress={this._search}
                  style={[styles.gradientButton, {flex: 2}]}>
                  <LinearGradient
                    colors={['#E8222B', '#141414']}
                    style={styles.gradienButtonBackground}>
                    <Text style={styles.gradienButtonLabel}>Search</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Interactable.View>
        <Dialog
          visible={visibleModalBuyLocation}
          onTouchOutside={this._closeModalBuyLocation}>
          <ModalLocation
            title="Buy location"
            onChangeLocation={this._onChangeBuyLocation}
            closeModal={this._closeModalBuyLocation}
            requiredStreet={true}
            requiredCity={true}
          />
        </Dialog>
        <Dialog
          visible={visibleModalShipLocation}
          onTouchOutside={this._closeModalShipLocation}>
          <ModalLocation
            title="Ship location"
            onChangeLocation={this._onChangeShipLocation}
            closeModal={this._closeModalShipLocation}
            requiredStreet={true}
            requiredCity={true}
          />
        </Dialog>
        {/* <Dialog 
                    visible={visibleModalShipLocation}
                    onTouchOutside={this._closeModalShipLocation}
                >
                    <ModalLocation 
                        title="Ship location"
                        onChangeLocation={this._onChangeShipLocation}
                        closeModal={this._closeModalShipLocation}
                        requiredStreet={true}
                        requiredCity={true}
                        />
                </Dialog> */}
        <DatePicker
          style={{width: 0, height: 0}}
          ref={refs => (this.buyDatePicker = refs)}
          onDateChange={this._onChangeBuyDate}
          {...commonDatePickerProps}
        />
        <DatePicker
          style={{width: 0, height: 0}}
          ref={refs => (this.shipDatePicker = refs)}
          onDateChange={this._onChangeShipDate}
          {...commonDatePickerProps}
        />
        <BottomSheet
          ref={refs => (this.RBSheet = refs)}
          options={[
            {label: 'Km', value: 'km'},
            {label: 'Miles', value: 'miles'},
          ]}
          onChooseOption={this._onChooseOption}
        />
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
    paddingHorizontal: 14,
  },
  commonInputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C2C2C2',
    borderStyle: 'solid',
    borderRadius: 15,
    marginBottom: 10,
  },
  commonTextInput: {
    padding: 0,
    flex: 1,
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  searchRow: {
    flexDirection: 'row',
  },
  radiusFilter: {
    // flex: 1,
    height: 40,
    // marginRight: 17
  },
  gradientButton: {
    height: 40,
    borderRadius: 15,
    overflow: 'hidden',
  },
  gradienButtonBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradienButtonLabel: {
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0,
  },
  orderItem: {
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#C2C2C2',
    borderRadius: 15,
    marginBottom: 10,
  },
  orderMainInfo: {
    flexDirection: 'row',
  },
  supplierContainer: {
    alignItems: 'center',
    marginRight: 20,
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
  viewOrderDetail: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#AC040C',
  },
  viewOrderDetailText: {
    fontSize: 15,
    color: '#AC040C',
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
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  orderDeliveryCost: {
    paddingLeft: 16,
    fontSize: 14,
    color: '#319800',
    fontWeight: 'bold',
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
  shadowStyle: {
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 10,
  },
});
