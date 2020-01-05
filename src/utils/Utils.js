import LocationManager from '../manager/LocationManager';
import queryString from 'query-string';
import Contacts from 'react-native-contacts';
import Permissions from 'react-native-permissions';
import ImagePicker from 'react-native-image-crop-picker';
import {ActionSheetIOS, Alert, Platform, CameraRoll} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import _ from 'lodash';
import RNFetchBlob from 'rn-fetch-blob';

export default new (class Utils {
  constructor() {
    NetInfo.addEventListener(
      'connectionChange',
      this._handleFirstConnectivityChange,
    );
    this._networkListeners = [];
  }

  initialLocation = () => {
    const locationManager = LocationManager.getInstance();
    locationManager.initialize();
    this.locationManager = locationManager;
  };

  _handleFirstConnectivityChange = connectionInfo => {
    this._connectionInfo = connectionInfo;
    if (_.isEmpty(this._networkListeners)) {
      return;
    }

    this._networkListeners.forEach(networkFunction => {
      networkFunction(connectionInfo);
    });
  };

  addNetworkListener = networkFunction => {
    if (!networkFunction || typeof networkFunction !== 'function') {
      return;
    }

    const index = _.findIndex(this._networkListeners, networkFunction);
    if (index >= 0) {
      return;
    }

    networkFunction(this._connectionInfo);

    this._networkListeners.push(networkFunction);
  };

  removeNetworkListener = networkFunction => {
    if (!networkFunction) {
      return;
    }

    if (!this._networkListeners) {
      return;
    }

    const index = _.findIndex(this._networkListeners, networkFunction);
    if (index < 0) {
      return;
    }

    this._networkListeners.splice(index, 1);
  };

  setScreen = (screen, propsFunc) => {
    if (!this._propsFunc) {
      this._propsFunc = {};
    }
    this._propsFunc[screen] = propsFunc;
  };

  setProps = (screen, props) => {
    const setProps = this._propsFunc[screen];
    if (setProps) {
      setProps(props);
    }
  };

  setCurrentRoute = route => {
    this._currentRoute = route;
  };

  getCurrentRoute = () => this._currentRoute;

  getLocation = (times = 5) => {
    return new Promise(resolve => {
      if (times === 0) {
        resolve(null);
      }
      if (!this.locationManager) {
        const locationManager = LocationManager.getInstance();
        locationManager.initialize();
        this.locationManager = locationManager;
      }
      const currentLocation = this.locationManager.getCurrentLocation();
      if (currentLocation) {
        resolve(currentLocation);
      } else {
        setTimeout(async () => {
          const currentLocation = await this.getLocation(times - 1);
          resolve(currentLocation);
        }, 1000);
      }
    });
  };

  setDeviceId = deviceId => {
    this.deviceId = deviceId;
  };

  getDeviceId = () => {
    return this.deviceId;
  };

  setBaseUrl = baseUrl => {
    this.baseUrl = baseUrl;
  };

  getLocationManager = () => {
    return this.locationManager;
  };

  getTabUrl = tab => {
    let currentLocation;
    if (this.locationManager) {
      currentLocation = this.locationManager.getCurrentLocation();
    }
    const time = Date.now();
    const {baseUrl, deviceId} = this;
    const params = {
      tab,
      deviceId,
      location:
        currentLocation && `${currentLocation[0]},${currentLocation[1]}`,
      hash: time,
    };
    const url = baseUrl + '?' + queryString.stringify(params);
    console.log('====================================');
    console.log(url);
    console.log('====================================');
    return url;
  };

  getUrl = () => {
    let currentLocation;
    if (this.locationManager) {
      currentLocation = this.locationManager.getCurrentLocation();
    }
    const {baseUrl, deviceId} = this;
    const params = {
      deviceId,
      location:
        currentLocation && `${currentLocation[0]},${currentLocation[1]}`,
    };
    const url = baseUrl + '?' + queryString.stringify(params);
    return url;
  };

  addLocation = url => {
    if (!this.locationManager) {
      return url;
    }
    const currentLocation = this.locationManager.getCurrentLocation();
    if (!currentLocation) {
      return url;
    }
    return (
      url +
      `&location=${currentLocation[0]},${currentLocation[1]}&deviceId=${this.deviceId}`
    );
  };

  getContacts = () => {
    return new Promise(async resolve => {
      const permission = await Permissions.check('contacts');
      if (permission === 'authorized') {
        Contacts.getAll((error, contacts) => {
          if (error) {
            resolve({error});
          } else {
            if (!_.isEmpty(contacts)) {
              let listContacts = contacts.map(item =>
                _.pick(_.omitBy(item, _.isEmpty), [
                  'familyName',
                  'givenName',
                  'phoneNumbers',
                  'emailAddresses',
                ]),
              );
              resolve({contacts: listContacts});
            }
          }
        });
      } else {
        const newPermissions = await Permissions.request('contacts');
        if (newPermissions === 'authorized') {
          const {error, contacts} = await this.getContacts();
          resolve({error, contacts});
        } else {
          resolve({error: 'Ứng dụng không có quyển truy cập danh bạ'});
        }
      }
    });
  };

  openPicker = () => {
    return new Promise(resolve => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Ảnh từ thư viện', 'Chụp ảnh', 'Bỏ qua'],
            cancelButtonIndex: 2,
            destructiveButtonIndex: -1,
          },
          buttonIndex => {
            if (buttonIndex == 0) {
              this._pickPhoto(resolve);
            } else if (buttonIndex == 1) {
              this._capturePhoto(resolve);
            }
          },
        );
      } else if (Platform.OS === 'android') {
        Alert.alert(__APP_NAME__, 'Bạn muốn chọn ảnh từ đâu?', [
          {text: 'Ảnh từ thư viện', onPress: () => this._pickPhoto(resolve)},
          {text: 'Chụp ảnh', onPress: () => this._capturePhoto(resolve)},
          {text: 'Bỏ qua', style: 'cancel'},
        ]);
      }
    });
  };

  _pickPhoto = async resolve => {
    const image = await ImagePicker.openPicker({});
    resolve(image);
  };

  _capturePhoto = async resolve => {
    const image = await ImagePicker.openCamera({});
    resolve(image);
  };

  validateUrl(value) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
      value,
    );
  }

  setupAlert = alert => {
    this._alert = alert;
  };

  alert = ({message, type}) => {
    this._alert({message, type});
    // setTim eout(this._alert, 2000);
  };

  saveToCameraRoll = async uri => {
    if (!this.validateUrl(uri)) {
      this.alert({
        message: 'Có lỗi xảy ra, vui lòng thử lại',
        type: 'error',
      });
      return;
    }
    if (Platform.OS === 'android') {
      const permission = await Permissions.check('storage');
      if (permission === 'authorized') {
        RNFetchBlob.config({
          fileCache: true,
          appendExt: 'jpg',
        })
          .fetch('GET', uri)
          .then(res => {
            CameraRoll.saveToCameraRoll(res.path()).then(
              this.alert({
                message: 'Lưu ảnh thành công',
                type: 'success',
              }),
            );
          })
          .catch(
            this.alert({
              message: 'Có lỗi xảy ra, vui lòng thử lại',
              type: 'error',
            }),
          );
      } else {
        const newPermissions = await Permissions.request('storage');
        if (newPermissions === 'authorized') {
          this.saveToCameraRoll(uri);
        }
      }
    } else {
      CameraRoll.saveToCameraRoll(uri).then(
        this.alert({
          message: 'Lưu ảnh thành công',
          type: 'success',
        }),
      );
    }
  };

  uploadPhoto = photo => {
    return new Promise(resolve => {
      const data = new FormData();
      data.append('file', {
        uri: photo.path,
        type: photo.mime,
        name: `photo.${photo.mime.split('/')[1]}`,
      });
      axios({
        method: 'post',
        url: 'http://cdnapp.5web.vn/',
        data,
        config: {headers: {'Content-Type': 'multipart/form-data'}},
      })
        .then(response => {
          resolve({response: response.data});
        })
        .catch(error => {
          resolve({error});
        });
    });
  };
})();
