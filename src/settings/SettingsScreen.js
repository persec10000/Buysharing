import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Picker,
  ScrollView,
  Platform,
  Alert,
  YellowBox,
} from 'react-native';
import {
  Menu,
  MenuProvider,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import {isIphoneX, getStatusBarHeight} from 'react-native-iphone-x-helper';
import LinearGradient from 'react-native-linear-gradient';
import SafeAreaView from 'react-native-safe-area-view';
import Dialog, {SlideAnimation} from 'react-native-popup-dialog';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ModalLanguage from '../commons/ModalLanguage';
import UserManager from '../manager/UserManager';
import i18n from '../translations/i18n';

const userManager = UserManager.getInstance();

const GradientButton = props => {
  const {colors, label, onPressButton} = props;
  return (
    <View style={styles.buttonWrapper}>
      <TouchableOpacity style={styles.button} onPress={onPressButton}>
        <LinearGradient style={styles.gradientButton} colors={colors}>
          <Text style={styles.buttonLabel}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const TextInputSetting = props => {
  const {inputWrapperStyle} = props;
  return (
    <View style={[styles.settingInteractArea, inputWrapperStyle]}>
      <TextInput style={styles.interactTextInput} {...props} />
      <Image source={require('../resources/images/settings/edit.png')} />
    </View>
  );
};

const DropdownInputSetting = props => {
  const {image, language, onPressHandler} = props;
  return (
    <TouchableOpacity
      onPress={onPressHandler}
      style={styles.settingInteractArea}>
      <View style={styles.interactContent}>
        {image && <Image style={styles.interactImage} source={image} />}
        <Text style={styles.interactLabel}>{language}</Text>
      </View>
      <Image source={require('../resources/images/settings/caret-down.png')} />
    </TouchableOpacity>
  );
};

export default class SettingsScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => {
    return {
      header: null,
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      user: userManager.getUser() || {},
      visibleModallanguage: false,
      language: 'English',
      locale: 'en',
      flag: '',
    };
  }

  onPressHandler = () => {
    this.setState({visibleModallanguage: true});
  };

  onPressSignOut = () => {
    Alert.alert(__APP_NAME__, 'Sign out');
    userManager.signOut();
  };
  _closeModalLanguage = () => {
    this.setState({
      visibleModallanguage: false,
    });
  };
  English = () => {
    i18n.locale = "en";
    this.setState({language: 'English', locale: 'en'});
  };

  Germany = () => {
    i18n.locale = 'de';
    this.setState({language: 'Germany', locale: 'de'});
  };

  render() {
    const {user, visibleModallanguage, language, flag, locale} = this.state;
    console.log(i18n.locale);
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView style={styles.container}>
            <View style={styles.headerContainer}>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}
                  style={styles.headerBackBtn}>
                  <Image
                    source={require('../resources/images/settings/caret-left.png')}
                  />
                </TouchableOpacity>
                <Image
                  source={require('../resources/images/settings/header-logo.png')}
                />
              </View>
              <Text style={styles.headerLabel}>{i18n.t('Driver')}</Text>
            </View>
            <View style={styles.settingContainer}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Languagues</Text>
                <DropdownInputSetting
                  onPressHandler={this.onPressHandler}
                  image={require('../resources/images/settings/america-flag.png')}
                  language={language}
                />
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Currency</Text>
                <TouchableOpacity style={styles.settingInteractArea}>
                  <View style={styles.interactContent}>
                    <Text style={styles.interactLabel}>American Dollar</Text>
                  </View>
                  <Image
                    source={require('../resources/images/settings/caret-down.png')}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Name</Text>
                <TextInputSetting
                  value={user.name}
                  placeholder="Name"
                  placeholderTextColor="#707070"
                />
                <TextInputSetting
                  inputWrapperStyle={{marginTop: 10}}
                  value={user.surname}
                  placeholder="Surname"
                  placeholderTextColor="#707070"
                />
                <TextInputSetting
                  inputWrapperStyle={{marginTop: 10}}
                  value={user.middlename}
                  placeholder="Middlename"
                  placeholderTextColor="#707070"
                />
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Address</Text>
                <TextInputSetting
                  // value="Ukraine, Kyiv"
                  value={`${user.home_address} ${user.home_street} ${user.home_city} ${user.home_country}`}
                  placeholder="Address"
                  placeholderTextColor="#707070"
                />
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Email address</Text>
                <TextInputSetting
                  value={user.email}
                  placeholder="Email address"
                  placeholderTextColor="#707070"
                />
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Mobile number</Text>
                <View style={styles.settingInteractArea}>
                  <TextInput
                    style={styles.interactTextInput}
                    value={user.phone || ''}
                  />
                  <Image
                    source={require('../resources/images/settings/edit.png')}
                  />
                </View>
              </View>
              <GradientButton colors={['#E8222B', '#141414']} label="Save" />
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Password</Text>
                <TextInputSetting
                  placeholder="Old password"
                  placeholderTextColor="#707070"
                  secureTextEntry={true}
                />
                <TextInputSetting
                  inputWrapperStyle={{marginTop: 10}}
                  placeholder="New password"
                  placeholderTextColor="#707070"
                  secureTextEntry={true}
                />
                <TextInputSetting
                  inputWrapperStyle={{marginTop: 10}}
                  placeholder="Repeat password"
                  placeholderTextColor="#707070"
                  secureTextEntry={true}
                />
              </View>
              <GradientButton
                colors={['#E8222B', '#141414']}
                label="Change password"
              />
              <GradientButton
                colors={['#888888', '#888888']}
                label="Sign out"
                onPressButton={this.onPressSignOut}
              />
            </View>
            <Dialog
              visible={visibleModallanguage}
              onTouchOutside={this._closeModalLanguage}>
              <ModalLanguage
                title="Language"
                closeModal={this._closeModalLanguage}
                English={this.English}
                Germany={this.Germany}
                requiredAll={true}
              />
            </Dialog>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 27,
  },
  headerBackBtn: {
    position: 'absolute',
    left: 15,
    padding: 20,
  },
  headerLabel: {
    color: '#707070',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0,
  },
  settingContainer: {
    paddingHorizontal: 27,
  },
  settingItem: {
    marginBottom: 18,
  },
  settingLabel: {
    marginBottom: 9,
    paddingHorizontal: 23,
    fontSize: 16,
    letterSpacing: 0,
    color: '#707070',
  },
  settingInteractArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 60,
    paddingHorizontal: 22,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#C2C2C2',
  },
  interactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactImage: {
    marginRight: 12,
  },
  interactLabel: {
    fontSize: 16,
    color: '#707070',
  },
  interactTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#707070',
  },
  buttonWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  button: {
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 6,
    elevation: 12,
  },
  gradientButton: {
    width: 265,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 20,
    letterSpacing: 0,
  },
  headerText: {
    fontSize: 20,
    margin: 10,
    fontWeight: 'bold',
  },
  menuContent: {
    color: '#000',
    fontWeight: 'bold',
    padding: 2,
    fontSize: 20,
  },
});
