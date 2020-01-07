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
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import Icons from '../utils/Icons';
import SafeAreaView from 'react-native-safe-area-view';
import Interactable from 'react-native-interactable';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import APIClient from '../utils/APIClient';
import _ from 'lodash';
import {commonDatePickerProps} from '../commons/Constant';
import BottomSheet from '../commons/BottomSheet';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import FormInteractField from '../commons/FormInteractField';
import Dialog, {SlideAnimation} from 'react-native-popup-dialog';
import ModalLocation from '../commons/ModalLocation';
import AbsoluteLoadingScreen from '../commons/AbsoluteLoadingScreen';
import FastImage from 'react-native-fast-image';


const OfferItem = props => {
  const {item} = props;
  return (
  <TouchableOpacity onPress={props._PassengerDetail}>
    <View style={styles.offerItem}>
        <View style={styles.offerMainInfo}>
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
          </View>
          <View style={styles.offerDetail}>
            <View style={styles.offerDetailRow}>
              <View style={styles.rowIcon}>
                <Image source={require('../resources/images/buyer/marker.png')} />
              </View>
              <Text style={styles.rowLabel}>
                {item.current_place}, {item.current_street}, {item.current_city}, {item.current_country}
              </Text>
            </View>
            <View style={styles.offerDetailRow}>
              <View style={styles.rowIcon}>
                <Image
                  source={require('../resources/images/buyer/corner-down-right.png')}
                />
              </View>
              <Text style={styles.rowLabel}>
                {item.target_place}, {item.target_street}, {item.target_city}, {item.target_country}
              </Text>
            </View>
            <View style={styles.offerDetailRow}>
              <View style={{flexDirection: 'row', width: 130}}>
                <View style={styles.rowIcon}>
                  <Icons.FontAwesome name="clock-o" size={20} color="#707070" />
                </View>
                <Text style={styles.rowLabel}>
                  {item.go_time}
                </Text>
              </View>
              <View style={{flexDirection: 'row', width: 110}}>
                <View style={styles.rowIcon}>
                  <Icons.FontAwesome name="group" size={20} color="#707070" />
                </View>
                <Text style={styles.rowLabel}>
                  {item.number_people}
                </Text>
              </View>
              <View style={{flex: 1}}>
                <Image
                  source={require('../resources/images/driver/bookmark.png')}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default class PassengerNearbyScreen extends Component {
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
      currentLocation: '',
      targetLocation: '',
      currentPlace: '',
      currentStreet: '',
      currentCity: '',
      currentCountry: '',
      targetPlace: '',
      targetStreet: '',
      targetCity: '',
      targetCountry: '',
      radius: '',
      radiusUnit: 'km',
      currentdate: moment('10/11/2019', 'DD/MM/YYYY'),
      date: moment('10/11/2019', 'DD/MM/YYYY'),
      offerList: [],

      //modal visible
      visibleModalCurrentLocation: false,
      visibleModalTargetLocation: false,

      // state loading
      loading: false,
    };
  }

  _renderItem = ({item}) => {
    return <OfferItem item={item} _PassengerDetail={()=>this._PassengerDetail(item)}/>;
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
        Suggested offers nearby are empty. Use filter to find the most suitable
        offer.
      </Text>
    );
  };

  _makeOrder = item => {
    this.props.navigation.navigate('MakeOrder', {offerDetail: item});
  };

  _showSearch = () => {
    this.interactableSearch.snapTo({index: 0});
  };

  _hideSearch = () => {
    this.interactableSearch.snapTo({index: 1});
  };

  _onChangeCurrentLocation = (place, street, city, country) => {
    this.setState({
      currentPlace: place,
      currentStreet: street,
      currentCity: city,
      currentCountry: country,
    });
  };

  _onChangeTargetLocation = (place, street, city, country) => {
    this.setState({
      targetPlace: place,
      targetStreet: street,
      targetCity: city,
      targetCountry: country,
    });
  };

  _onChangeCurrentDate = value => {
    const currentdate = moment(value, 'DD/MM/YYYY');
    this.setState({currentdate});
  };

  _onChangeDate = value => {
    const date = moment(value, 'DD/MM/YYYY');
    this.setState({date});
  };

  _onChangeRadius = text => {
    this.setState({
      radius: text,
    });
  };

  _onChangeRadiusUnit = value => {
    this.setState({radiusUnit: value});
  };

  _search = async () => {
    const {
      currentStreet,
      currentCity,
      currentCountry,
      radius,
      date,
    } = this.state;

    const path = '/api/v1/driver/search';
    const params = {
      country: currentCountry,
      city: currentCity,
      street: currentStreet,
      max_distance: radius,
      mode: 'km'
    };
    this.setState({loading: true});
    const {response, error} = await APIClient.getInstance().GET(path, params);
    console.log(response);
    if (response && !_.isEmpty(response)) {
      this.setState({offerList: response});
    }
    this._hideSearch();
    this.setState({loading: false});
  };

  _onChooseOption = async value => {
    // console.log(value)
    this._onChangeRadiusUnit(value);

    this.RBSheet.close();
  };

  _openModalCurrentLocation = () => {
    this.setState({
      visibleModalCurrentLocation: true,
    });
  };

  _closeModalCurrentLocation = () => {
    this.setState({
      visibleModalCurrentLocation: false,
    });
  };

  _openModalTargetLocation = () => {
    this.setState({
      visibleModalTargetLocation: true,
    });
  };

  _closeModalTargetLocation = () => {
    this.setState({
      visibleModalTargetLocation: false,
    });
  };

  _PassengerDetail = (item) => {
    this.props.navigation.navigate('Passenger', {item: item})
  }

  render() {
    const {
      currentLocation,
      targetLocation,
      currentPlace,
      currentStreet,
      currentCity,
      currentCountry,    
      currentdate,
      date,
      radius,
      radiusUnit,
      offerList,
      visibleModalCurrentLocation,
      visibleModalTargetLocation,
      loading,
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
        <SafeAreaView style={styles.mainContainer}>
          <TouchableWithoutFeedback
            onPress={this._showSearch}
            style={[styles.commonInputContainer, styles.locationField]}>
            <Text style={styles.commonTextInput}>Filter</Text>
            <Image source={require('../resources/images/buyer/location.png')} />
          </TouchableWithoutFeedback>
          <FlatList
            data={offerList}
            extraData={this.state}
            renderItem={this._renderItem}
            keyExtractor={this._keyExtractor}
            showsVerticalScrollIndicator={false}
            style={{flex: 1}}
            ListHeaderComponent={offerList.length === 0 && this._renderHeader}
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
              <FormInteractField
                label="From"
                placeholder="Current location: Street, City..."
                iconSuffix={require('../resources/images/buyer/location.png')}
                value={`${currentPlace.trim()} ${currentStreet.trim()} ${currentCity.trim()} ${currentCountry.trim()}`}
                onPressTouchableWithoutFeedback={this._openModalCurrentLocation}
              />
              {/* <FormInteractField
                label="To"
                placeholder="Target location: Street, City..."
                iconSuffix={require('../resources/images/buyer/location.png')}
                value={`${targetPlace.trim()} ${targetStreet.trim()} ${targetCity.trim()} ${targetCountry.trim()}`}
                onPressTouchableWithoutFeedback={this._openModalTargetLocation}
              /> */}
              <TouchableWithoutFeedback
                onPress={() => this.shipDatePicker.onPressDate()}
                style={[styles.commonInputContainer, styles.timeDateField]}>
                <Text style={styles.commonTextInput}>
                  Date: {date.format('DD/MM/YYYY')}
                </Text>
                <Image
                  source={require('../resources/images/buyer/calendar.png')}
                />
              </TouchableWithoutFeedback>
              <View style={[styles.commonInputContainer]}>
                <TextInput
                  placeholder="Radius"
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
          visible={visibleModalCurrentLocation}
          onTouchOutside={this._closeModalCurrentLocation}>
          <ModalLocation
            title="Current location"
            onChangeLocation={this._onChangeCurrentLocation}
            closeModal={this._closeModalCurrentLocation}
            requiredStreet={true}
            requiredCity={true}
          />
        </Dialog>
        {/* <Dialog
          visible={visibleModalTargetLocation}
          onTouchOutside={this._closeModalTargetLocation}>
          <ModalLocation
            title="Target location"
            onChangeLocation={this._onChangeTargetLocation}
            closeModal={this._closeModalTargetLocation}
            requiredStreet={true}
            requiredCity={true}
          />
        </Dialog> */}
        <DatePicker
          style={{width: 0, height: 0}}
          ref={refs => (this.buyDatePicker = refs)}
          date={currentdate.format('DD/MM/YYYY')}
          onDateChange={this._onChangeCurrentDate}
          {...commonDatePickerProps}
        />
        <DatePicker
          style={{width: 0, height: 0}}
          ref={refs => (this.shipDatePicker = refs)}
          date={date.format('DD/MM/YYYY')}
          onDateChange={this._onChangeDate}
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
    // alignItems: 'center',
    // height: 40,
  },
  radiusFilter: {
    // width: 127,
    flex: 1,
    height: 45,
    marginRight: 17,
  },
  gradientButton: {
    height: 45,
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
  offerItem: {
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#C2C2C2',
    borderRadius: 15,
    marginBottom: 10,
  },
  offerMainInfo: {
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
  offerDetail: {
    flex: 1,
    justifyContent: 'space-between',
  },
  offerDetailRow: {
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
  offerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  offerDeliveryCost: {
    flex: 1,
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
