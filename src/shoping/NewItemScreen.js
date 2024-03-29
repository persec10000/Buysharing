import React, {Component} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
  AlertIOS,
  ToastAndroid,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import GradientHeader from '../commons/GradientHeader';
import LinearGradient from 'react-native-linear-gradient';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ImagePicker from 'react-native-image-crop-picker';
import _ from 'lodash';
import ItemLibraryManager from '../manager/ItemLibraryManager';

const itemLibraryManager = ItemLibraryManager.getInstance();

const PRODUCT_SIZE = 800;

const FormItem = props => {
  const {label, currency} = props;
  return (
    <View style={styles.formItem}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.formInteractArea}>
        <TextInput style={styles.formTextInput} {...props} />
        {currency && <Text style={styles.formCurrencyText}>{currency}</Text>}
        <Image
          style={styles.formSuffixIcon}
          source={require('../resources/images/settings/edit.png')}
        />
      </View>
    </View>
  );
};

export default class NewItemScreen extends Component {
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

  constructor(props) {
    super(props);

    this.state = {
      image: {},
      name: '',
      manufacturer: '',
      volume: '',
      price: '',
      itemList: itemLibraryManager.getItemList() || [],
    };
  }

  _onChangeName = text => {
    this.setState({name: text});
  };

  _onChangeManufacturer = text => {
    this.setState({manufacturer: text});
  };

  _onChangeVolume = text => {
    this.setState({volume: text});
  };

  _onChangePrice = text => {
    this.setState({price: text});
  };

  _onPressThumbnail = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Photo Library', 'Take Photo', 'Cancel'],
          cancelButtonIndex: 2,
          destructiveButtonIndex: -1,
        },
        buttonIndex => {
          if (buttonIndex == 0) {
            this._pickImage();
          } else if (buttonIndex == 1) {
            this._captureImage();
          }
        },
      );
    } else if (Platform.OS === 'android') {
      Alert.alert(global.__APP_NAME__, 'Pick image from...', [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Photo Library', onPress: () => this._pickImage()},
        {text: 'Take Photo', onPress: () => this._captureImage()},
      ]);
    }
  };

  _pickImage() {
    ImagePicker.openPicker({
      width: PRODUCT_SIZE,
      height: PRODUCT_SIZE,
      cropping: true,
      includeBase64: true,
      forceJpg: true,
    })
      .then(image => {
        this._onChangeImage(image);
      })
      .catch(error => {
        Platform.select({
          ios: () => {
            AlertIOS.alert('Error');
          },
          android: () => {
            ToastAndroid.show('Error', ToastAndroid.SHORT);
          },
        })();
      });
  }

  _captureImage() {
    ImagePicker.openCamera({
      width: PRODUCT_SIZE,
      height: PRODUCT_SIZE,
      cropping: true,
      forceJpg: true,
    })
      .then(image => {
        this._onChangeImage(image);
      })
      .catch(error => {
        Platform.select({
          ios: () => {
            AlertIOS.alert('Error');
          },
          android: () => {
            ToastAndroid.show('Error', ToastAndroid.SHORT);
          },
        })();
      });
  }

  _onChangeImage = image => {
    this.setState({image});
  };

  _createItem = () => {
    const {image, name, manufacturer, volume, price} = this.state;

    if (
      _.isEmpty(image) ||
      _.isEmpty(name) ||
      _.isEmpty(manufacturer) ||
      _.isEmpty(volume) ||
      _.isEmpty(price)
    ) {
      Alert.alert(global.__APP_NAME__, 'All fields must be not empty!');
      return;
    }

    const item = {
      image,
      name,
      manufacturer,
      volume,
      price,
      currency: '$',
    };

    const itemList = _.cloneDeep(this.state.itemList);
    itemList.push(item);
    itemLibraryManager.updateItemLibrary(itemList);
    this.props.navigation.goBack();
  };

  render() {
    const {image, name, manufacturer, volume, price} = this.state;
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
          <Text style={styles.screenTitle}>Item Library</Text>
        </View>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={styles.mainContainer}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              onPress={this._onPressThumbnail}
              style={styles.avatarUpload}>
              {_.isEmpty(image) ? (
                <Image
                  source={require('../resources/images/buyer/plus-avatar-circle.png')}
                />
              ) : (
                <Image
                  style={{width: 162, height: 162, resizeMode: 'cover'}}
                  source={{uri: image.path}}
                />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.form}>
            <FormItem
              label="Name"
              placeholder="Enter..."
              placeholderTextColor="#707070"
              value={name}
              onChangeText={this._onChangeName}
            />
            <FormItem
              label="Firm-manufacturer"
              placeholder="Enter..."
              placeholderTextColor="#707070"
              value={manufacturer}
              onChangeText={this._onChangeManufacturer}
            />
            <FormItem
              label="Volume"
              placeholder="example: 200g..."
              placeholderTextColor="#707070"
              // keyboardType="numeric"
              value={volume}
              onChangeText={this._onChangeVolume}
            />
            <FormItem
              label="Price"
              placeholder="example: 200..."
              placeholderTextColor="#707070"
              keyboardType="numeric"
              currency="$"
              value={price}
              onChangeText={this._onChangePrice}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.createBtnWrapper}>
            <TouchableOpacity
              style={styles.gradientBtn}
              onPress={this._createItem}>
              <LinearGradient
                style={styles.gradientBtnBackground}
                colors={['#E8222B', '#141414']}>
                <Text style={styles.gradientBtnLabel}>Create Item</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
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
    paddingHorizontal: 27,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarUpload: {
    width: 162,
    height: 162,
    marginTop: 42,
    marginBottom: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    shadowColor: '#1C191966',
    elevation: 12,
  },
  form: {},
  formItem: {
    marginBottom: 17,
  },
  formLabel: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
    marginLeft: 13,
    marginBottom: 9,
  },
  formInteractArea: {
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#C2C2C2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 12,
    paddingVertical: 11,
  },
  formTextInput: {
    flex: 1,
    padding: 0,
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  formSuffixIcon: {
    width: 18,
    height: 18,
    resizeMode: 'cover',
  },
  formCurrencyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#319800',
    letterSpacing: 0,
    marginRight: 7,
  },
  createBtnWrapper: {
    alignItems: 'center',
    marginVertical: 22,
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
