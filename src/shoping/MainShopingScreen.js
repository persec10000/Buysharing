import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import * as RNLocalize from 'react-native-localize';
import MapView, {Marker} from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import GradientHeader from '../commons/GradientHeader';
import LanguageManager from '../manager/LanguageManager';
import UserManager from '../manager/UserManager';
import MapScreen from '../commons/MapScreen';

const languageManager = LanguageManager.getInstance();
const userManager = UserManager.getInstance();

export default class MainShopingScreen extends Component {
  static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      headerTitleStyle: {color: '#fff'},
      headerStyle: {
        backgroundColor: 'transparent',
      },
      header: props => <GradientHeader {...props} />,
      headerTitle: (
        <View style={styles.headerTitle}>
          <Image source={require('../resources/images/appName.png')} />
        </View>
      ),
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.toggleDrawer();
          }}
          style={styles.headerLeftBtn}>
          <Image source={require('../resources/images/menu.png')} />
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount = async () => {
    languageManager.addScreen(this);
  };

  componentWillUnmount() {
    languageManager.removeScreen(this);
  }

  handleLocalizationChange = () => {
    languageManager.setI18nConfig();
    this.forceUpdate();
  };

  render() {
    return (
      <View style={styles.container}>
        <MapScreen />
        <View style={styles.floatButtonContainer}>
          <View style={styles.floatButtonWrapper}>
            <TouchableOpacity
              style={styles.floatButton}
              onPress={() => this.props.navigation.navigate('Supplier')}>
              <LinearGradient
                style={styles.floatButtonBackground}
                colors={['#E8222B', '#141414']}>
                <Text style={styles.floatButtonLabel}>
                  {languageManager.translateText('Supplier')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.floatButtonWrapper}>
            <TouchableOpacity
              style={styles.floatButton}
              onPress={() => this.props.navigation.navigate('Buyer')}>
              <LinearGradient
                style={styles.floatButtonBackground}
                colors={['#E8222B', '#141414']}>
                <Text style={styles.floatButtonLabel}>
                  {languageManager.translateText('Buyer')}
                </Text>
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
    paddingBottom: 15,
  },
  headerLeftBtn: {
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },
  floatButtonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  floatButtonWrapper: {
    marginBottom: 10,
  },
  floatButton: {
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
  },
  floatButtonBackground: {
    width: 265,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatButtonLabel: {
    fontSize: 20,
    letterSpacing: 0,
    color: '#fff',
  },
});
