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
import CustomTextInput from '../auth/CustomTextInput';
import Icons from '../utils/Icons';
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

export default class DriverWriteScreen extends Component {
  static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      headerTitleStyle: {color: '#fff'},
      headerStyle: {
        backgroundColor: 'transparent',
      },
      header: props => <GradientHeader {...props} />,
      headerTitle: <Text style={styles.headerTitle}>Messages</Text>,
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
        <View style={styles.buyForm}>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Message"
              placeholderTextColor="#707070"
              {...this.props}
            />
          </View>
        </View>
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
    paddingVertical: 25,
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
