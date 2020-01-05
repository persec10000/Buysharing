import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
import GradientHeader from '../commons/GradientHeader';
import MapView, {Marker} from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Icons from '../utils/Icons';
import Dialog, {SlideAnimation} from 'react-native-popup-dialog';
import {bold} from 'ansi-colors';
// import ShoppingListContent from './ShoppingListContent'

const FormInput = props => {
  const {label, value} = props;
  return (
    <View style={styles.formInput}>
      <Text style={styles.inputLabel}>{label}:</Text>
      <TextInput style={styles.inputField} value={value} {...props} />
      <Image source={require('../resources/images/settings/edit.png')} />
    </View>
  );
};

export default class TripScreen extends Component {
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
      isoffer: false,
    };
  }

  _startOffer = () => {
    this.setState({isoffer: true});
  };

  _stopOffer = () => {
    this.setState({isoffer: false});
  };

  render() {
    const {isoffer} = this.state;
    return (
      <View style={styles.container}>
        <MapView
          style={{flex: 1}}
          initialRegion={{
            latitude: 21.00992,
            longitude: 105.814728,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          // provider="google"
        >
          <Marker
            coordinate={{
              latitude: 21.00992,
              longitude: 105.814728,
            }}
            // image={<Image source={require('../resources/images/marker.png')}/>}
          >
            <View>
              <Image
                style={{width: 46, height: 60}}
                source={require('../resources/images/marker.png')}
              />
              <Image
                style={{
                  position: 'absolute',
                  width: 35,
                  height: 35,
                  borderRadius: 23,
                  top: 5,
                  right: 5.5,
                  left: 5.2,
                }}
                source={{
                  uri:
                    'https://scontent.fhan2-4.fna.fbcdn.net/v/t1.0-9/64685728_2210866278961289_9156587425705754624_o.jpg?_nc_cat=105&_nc_oc=AQlg0L9knkRrKy-dlTtnEY_H3Bh7QGOXhj9GuM5d-2957iRFpy9Rs1x6fWD0jd6JmFI&_nc_ht=scontent.fhan2-4.fna&oh=25a888b92f75c3d70fecfa6d924c8708&oe=5E20777D',
                }}
              />
            </View>
          </Marker>
        </MapView>
        <View style={styles.popupPurpose}>
          <View style={styles.orderMainInfo}>
            <View style={styles.customerContainer}>
              <Image
                style={styles.customerAvatar}
                source={require('../resources/images/buyer/default-avatar.png')}
              />
              <Text style={styles.customerName}>John Dou</Text>
            </View>
            <View style={styles.orderDetail}>
              <View style={styles.orderDetailRow}>
                <View style={styles.rowIcon}>
                  <Image
                    source={require('../resources/images/buyer/marker.png')}
                  />
                </View>
                <Text style={styles.rowLabel}>Sity mall, Green street, 4</Text>
              </View>
              <View style={styles.orderDetailRow}>
                <View style={styles.rowIcon}>
                  <Image
                    source={require('../resources/images/buyer/corner-down-right.png')}
                  />
                </View>
                <Text style={styles.rowLabel}>Soborna street, 11, Sumy</Text>
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
                  <Text style={styles.rowLabel}>Adholen</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <View style={styles.rowIcon}>
                    <Image
                      source={require('../resources/images/driver/pickup.png')}
                    />
                  </View>
                  <Text style={styles.rowLabel}>2</Text>
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
              <View style={styles.cancelSearchBtnWrapper}>
                <TouchableOpacity
                  style={styles.gradientBtn}
                  onPress={this._stopOffer}>
                  <LinearGradient
                    style={styles.gradientBtnBackground}
                    colors={['#E8222B', '#141414']}>
                    <Text style={styles.gradientBtnLabel}>Finish</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.buyForm}>
            <View style={styles.orderInfo}>
              <FormInput label="Car" value="Mersedes Abcdef" />
              <FormInput label="Color" value="Black" />
              <FormInput label="Plate" value="DY0876PTR" />
              <FormInput label="Price" value="8$" />
              <View style={styles.gradientBtnWrapper}>
                <TouchableOpacity
                  style={styles.gradientBtn}
                  onPress={this._startOffer}>
                  <LinearGradient
                    style={styles.gradientBtnBackground}
                    colors={['#E8222B', '#141414']}>
                    <Text style={styles.gradientBtnLabel}>Offer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
});
