import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import GradientHeader from '../commons/GradientHeader';
import LinearGradient from 'react-native-linear-gradient';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import Icons from '../utils/Icons';
import SafeAreaView from 'react-native-safe-area-view';
import UserManager from '../manager/UserManager';

export default class OrderConfirmedScreen extends Component {
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

  _continue = () => {
    this.props.navigation.navigate('MainTab');
    UserManager.getInstance()._getUserStatus();
  };

  render() {
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
        <View style={styles.mainContainer}>
          <View style={styles.orderConfirmedContainer}>
            <Image
              source={require('../resources/images/buyer/default-avatar.png')}
            />
            <Text style={[styles.commonText, {marginTop: 25}]}>John Dou</Text>
            <Text style={styles.commonText}>accepted your order!</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 29,
              }}>
              <Text style={styles.commonText}>Delivery cost:</Text>
              <Text style={[styles.commonText, {fontSize: 24, marginLeft: 13}]}>
                6$
              </Text>
            </View>
          </View>
          <View style={styles.gradientBtnWrapper}>
            <TouchableOpacity
              onPress={this._continue}
              style={[styles.gradientBtn, {marginBottom: 10}]}>
              <LinearGradient
                style={styles.gradientBtnBackground}
                colors={['#E8222B', '#141414']}>
                <Text style={styles.gradientBtnLabel}>Go Shopping</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gradientBtn}>
              <LinearGradient
                style={styles.gradientBtnBackground}
                colors={['#888888', '#888888']}>
                <Text style={styles.gradientBtnLabel}>Cancel</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  },
  orderConfirmedContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0,
    color: '#319800',
  },
  gradientBtnWrapper: {
    alignItems: 'center',
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
