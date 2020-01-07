import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import GradientHeader from '../commons/GradientHeader';
import FormInput from '../commons/FormInput';
import GradientButton from '../commons/GradientButton';
import LocationManager from '../manager/LocationManager';
import UserManager from '../manager/UserManager';
import MapScreen from '../commons/MapScreen';
import Icons from '../utils/Icons';
import _ from 'lodash';
import APIClient from '../utils/APIClient';
import AsyncStorage from '@react-native-community/async-storage';

const locationManager = LocationManager.getInstance();
const userManager = UserManager.getInstance();

// const FormInput = props => {
//   const {label, value} = props;
//   return (
//     <View style={styles.formInput}>
//       <Text style={styles.inputLabel}>{label}:</Text>
//       <TextInput style={styles.inputField} value={value} {...props} />
//       <Image source={require('../resources/images/settings/edit.png')} />
//     </View>
//   );
// };

export default class DriveroffersDetailScreen extends Component {
  static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      headerTitleStyle: {color: '#fff'},
      headerStyle: {
        backgroundColor: 'transparent',
      },
      header: props => <GradientHeader {...props} />,
      headerTitle: <Text style={styles.headerTitle}>Driver</Text>,
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
      car: '',
      color: '',
      plate: '',
      price: '',
      isoffer: false,
    };
  }

  _startOffer = () => {
    this.setState({isoffer: true});
  };

  _stopOffer = () => {
    this.setState({isoffer: false});
  };

  _onChangeCar = text => {
    this.setState({car: text});
  };

  _onChangeColor = text => {
    this.setState({color: text});
  };
  
  _onChangePlate = text => {
    this.setState({plate: text});
  };
  
  _onChangePrice = text => {
    this.setState({price: text});
  };

  componentDidMount = async() => {
    let driver_id = await AsyncStorage.getItem('driver_id')
  }

  _startMakingOrder = async() => {
    const {
      car,
      color,
      plate,
      price,
    } = this.state;
    let params = this.props.navigation.state.params;
    let item = params.item;
    const user = userManager.getUser() || {};
    if (_.isEmpty(user)) return;
    if (
      _.isEmpty(params.deliveryFrom) ||
      _.isEmpty(params.deliveryTo) ||
      _.isEmpty(params.deliveryTime) ||
      _.isEmpty(params.number_people) ||
      _.isEmpty(params.radius)
    ) {
      Alert.alert(__APP_NAME__, 'All driver info must be not empty');
      return;
    }
    if (
      _.isEmpty(car) ||
      _.isEmpty(color) ||
      _.isEmpty(plate) ||
      _.isEmpty(price)
    ) {
      Alert.alert(__APP_NAME__, 'All fields must be not empty');
      return;
    }
    const currentPlace = params.deliveryFrom.split(',')[0].trim();
    const currentStreet = params.deliveryFrom.split(',')[1].trim();
    const currentCity = params.deliveryFrom.split(',')[2].trim();
    const currentCountry = params.deliveryFrom.split(',')[3].trim();

    const targetPlace = params.deliveryTo.split(',')[0].trim();
    const targetStreet = params.deliveryTo.split(',')[1].trim();
    const targetCity = params.deliveryTo.split(',')[2].trim();
    const targetCountry = params.deliveryTo.split(',')[3].trim();
    const goDate = params.deliveryTime.format('YYYY-MM-DD');
    const goTime = params.deliveryTime.format('HH:mm:ss');
    const number_people = params.number_people;
    const radius = params.radius;
    const car_model = car;
    const car_color = color;
    const car_plate = plate;
    const price_offer = price;
    console.log('passenger=====>', item.passenger_id)
    const path = '/api/v1/driver';
    const data = {
      user_id: user.user_id,
      // current_place: "currentPlace",
      // current_street: currentStreet,
      // current_city: currentCity,
      // current_country: currentCountry,
      current_place: currentPlace,
      current_street: currentStreet,
      current_city: currentCity,
      current_country: currentCountry,
      go_time: goTime,
      go_date: goDate,
      // current_geo_long: deliveryFromCoords.lng,
      // current_geo_lat: deliveryFromCoords.lat,
      target_place: targetPlace,
      target_street: targetStreet,
      target_city: targetCity,
      target_country: targetCountry,
      // target_geo_long: deliveryToCoords.lng,
      // target_geo_lat: deliveryToCoords.lat,
      number_people: number_people,
      radius: radius,
      car_model: car_model,
      car_color: car_color,
      car_plate: car_plate,
      price_offer: price_offer,
    };
   
    this.setState({loading: true});
    const {response, error} = await APIClient.getInstance().jsonPOST(
      path,
      data,
    );

    if (response){
      let {driver_id} = response
      const path1 = '/api/v1/carpooling/search/passenger/' + item.passenger_id
      const response1 = await APIClient.getInstance().jwtGET(path1);
      if (response1){
        const { carpooling_id } = response1.response
        const path2 = '/api/v1/carpooling/' + carpooling_id
        const data2 = {driver_id: driver_id}
        const response2 = await APIClient.getInstance().jsonPUT(
          path2,
          data2,
        );
        console.log("response2=====>", response2)
        if (response2.response){
          this.setState({isoffer: true})
        }
        // this.setState({ orderDetail: {...response2, carpooling_id} })
        Alert.alert(__APP_NAME__, 'Created successful')
      }
    }
    
  };

  _getCarpoolingInfo = async passenger_id => {
    const path = '/api/v1/carpooling/search/passenger/' + passenger_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    if (response && response.carpooling_id) {
      return response;
    }
    return false;
  };

  _updateCarpooling = async (driver_id, carpoolingInfo) => {
    console.log('carpoolingInfo', carpoolingInfo);
    const path = '/api/v1/carpooling/' + carpoolingInfo.carpooling_id;
    const data = {
      ...carpoolingInfo,
      driver_id,
    };
    const {response, error} = await APIClient.getInstance().jsonPUT(path, data);
    if (response && response.carpooling_id) {
      Alert.alert(
        __APP_NAME__,
        'Your order has been created and delivered to driver. Wait for driver response!',
      );
      this.props.navigation.navigate('MainTab');
      UserManager.getInstance()._getUserStatus();
      // this.props.navigation.navigate('OrderConfirmed')
    }
  };

  render() {
    const {
      isoffer,
      car,
      color,
      plate,
      price,
      suppliersNearby,
      tappedLocation
    } = this.state;
    let params = this.props.navigation.state.params;
    let item = params.item;
    return (
      <View style={styles.container}>
         <MapScreen
          mapViewProps={{
            onPress: this._getSuppliersNearby,
          }}
          supplierMarkers={suppliersNearby}
          tappedLocation={tappedLocation}
        />
        <View style={styles.popupPurpose}>
          <View style={styles.orderMainInfo}>
            <View style={styles.customerContainer}>
              <Image
                style={styles.customerAvatar}
                source={require('../resources/images/buyer/default-avatar.png')}
              />
              <Text style={styles.customerName}>{item.fullname || 'Unknow'}</Text>
            </View>
            <View style={styles.orderDetail}>
              <View style={styles.orderDetailRow}>
                <View style={styles.rowIcon}>
                  <Image
                    source={require('../resources/images/buyer/marker.png')}
                  />
                </View>
                <Text style={styles.rowLabel}>{item.from_place}, {item.from_street}, {item.from_city}, {item.from_country}</Text>
              </View>
              <View style={styles.orderDetailRow}>
                <View style={styles.rowIcon}>
                  <Image
                    source={require('../resources/images/buyer/corner-down-right.png')}
                  />
                </View>
                <Text style={styles.rowLabel}>{item.to_place}, {item.to_street}, {item.to_city}, {item.to_country}</Text>
              </View>
              <View
                style={[
                  styles.orderDetailRow,
                  {justifyContent: 'space-between'},
                ]}>
                <View style={{flexDirection: 'row'}}>
                  <View style={styles.rowIcon}>
                    <Image
                      source={require('../resources/images/driver/pickup.png')}
                    />
                  </View>
                  <Text style={styles.rowLabel}>Pick Up</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <View style={styles.rowIcon}>
                    <Icons.FontAwesome name="group" size={20} color="#707070"/>
                  </View>
                  <Text style={styles.rowLabel}>{item.number_people}</Text>
                </View>
                <View style={styles.rowIcon}>
                  <Image
                    source={require('../resources/images/driver/surface.png')}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
        {isoffer ? (
          <View style={styles.buyForm}>
            <View style={styles.orderInfo}>
              <View style={styles.progress}>
                <Text style={styles.progresstext}>In progress</Text>
              </View>
              <View style={styles.priceitem}>
                <Text style={styles.price1}>Price:</Text>
                <Text style={styles.price2}>5$</Text>
              </View>
              <View style={styles.buyBtnContainer}>
                <View style={{width: 15}} />
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate('DriverWrite')}
                  style={styles.commentBtn}>
                  <View style={styles.rowIcon}>
                    <Image
                      source={require('../resources/images/driver/envelope.png')}
                    />
                  </View>
                  <Text style={styles.button}>Write</Text>
                </TouchableOpacity>
                <View style={{width: 15}} />
                <TouchableOpacity style={styles.commentBtn}>
                  <View style={styles.rowIcon}>
                    <Image
                      source={require('../resources/images/driver/phone.png')}
                    />
                  </View>
                  <Text style={styles.button}>Call</Text>
                </TouchableOpacity>
              </View>
              <GradientButton
                label="Finish"
                // _onPress={this._startMakingOrder}
              />
            </View>
          </View>) 
        :
        (<View style={styles.buyForm}>
          <FormInput
            label="Car"
            placeholder="Enter your car name..."
            value={car}
            onChangeText={this._onChangeCar}
          />
          <FormInput
            label="Color"
            placeholder="Enter your car color name..."
            value={color}
            onChangeText={this._onChangeColor}
          />
          <FormInput
            label="Plate"
            placeholder="Enter your plate..."
            value={plate}
            onChangeText={this._onChangePlate}
          /> 
          <FormInput
            label="Price"
            placeholder="Enter your price..."
            value={price}
            onChangeText={this._onChangePrice}   
          />
          <GradientButton
            label="Offer"
            _onPress={this._startMakingOrder}
          />
        </View>)
      }
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
  textInputWrapper: {
    borderWidth: 1,
    borderColor: '#707070',
    borderRadius: 15,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  popupPurpose: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 5,
    position: 'absolute',
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
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 0,
    color: '#707070',
  },
  buyForm: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    position: 'absolute',
    bottom: 0,
    width: '100%',
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
    width: '75%',
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
  delivery: {
    flex: 1,
  },
  deliveryCost: {
    alignItems: 'center',
  },
  buyBtnContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderColor: '#707070',
  },
  shoppingListBtnLabel: {
    fontSize: 16,
    color: '#707070',
    marginRight: 8,
  },
  progress: {
    marginBottom: 10,
  },
  progresstext: {
    textAlign: 'center',
    fontSize: 29,
    fontWeight: 'bold',
    letterSpacing: 0,
    color: '#319800',
    opacity: 1,
  },
  cancelSearchBtnWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },
  price1: {
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0,
    color: '#707070',
    opacity: 1,
  },
  price2: {
    textAlign: 'left',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0,
    color: '#319800',
    marginLeft: 8,
    opacity: 1,
  },
  priceitem: {
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  button: {
    color: '#FFF',
  },
  textInput: {
    fontSize: 15,
    paddingHorizontal: 22,
    paddingVertical: 14,
    padding: Platform.select({
      android: 0,
    }),
    color: '#000',
    fontWeight: '400',
    fontFamily: 'Raleway-Regular',
  },
});
