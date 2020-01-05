import {Platform, PermissionsAndroid, AppState, Alert} from 'react-native';
import Permissions from 'react-native-permissions';
import _ from 'lodash';
import LocationMode from 'react-native-location-mode-android';
import TimerMixin from 'react-timer-mixin';
import reactMixin from 'react-mixin';
import * as geoFireUtils from './geoFireUtils';

navigator.geolocation = require('@react-native-community/geolocation');

const DISTANCE_FILTER_THRESHOLD = 5; // distance threshold before calling to update new location
const SYNC_LOCATION_DURATION = 5;

class LocationManager {
  static getInstance() {
    if (!LocationManager.sharedInstance) {
      const sharedInstance = new LocationManager();
      LocationManager.sharedInstance = sharedInstance;
    }
    return LocationManager.sharedInstance;
  }

  /**
   * initialize location manager, i.e ask for permissions and starting to watch
   */
  initialize = async () => {
    /*if (Platform.OS === 'android') {
      const granted
      = await Permission.requestAndroidPermission(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        `${global.__APP_NAME__} truy cập vị trí của bạn để hiển thị kết quả tốt hơn`
      );
      this._permissionGranted = granted;
    }
    else {
      const authorization = await navigator.geolocation.requestAuthorization();
      console.log('geolocation authorization: ' + authorization);
    }*/

    await this._requestPermission();

    this._startWatching({disableHighAccuracy: true});

    // register for app state change so we can stop and start watching for location change
    AppState.addEventListener('change', this._handleAppStateChange);

    if (!this.isEnabled()) {
      this._notifyPermissionDenied();
    }
  };

  /**
   * return whether or not location is enabled
   * i.e permission status is null or authorized
   */
  isEnabled = () => {
    return (
      _.isNil(this._permissionStatus) || this._permissionStatus === 'authorized'
    );
  };

  /**
   * return current location data
   *
   * @return current location
   */
  getCurrentLocation = () => {
    return this._currentLocation;
  };

  /**
   * add listener when location is updated
   *
   * @param listener callback function that take an argument with key {location, error}
   */
  addListener = listener => {
    if (!listener) {
      return;
    }

    if (!this._listenerList) {
      this._listenerList = [];
    }
    this._listenerList.push(listener);
    // notify listener immediately if we do not get authorized to get location
    // so we can update ui corresponding
    if (!this.isEnabled()) {
      this._notifyPermissionDenied(listener);
    }
  };

  /**
   * remote listener
   *
   * @param listener listener to remove
   */
  removeListener = listener => {
    if (!listener || !this._listenerList) {
      return;
    }

    const index = this._listenerList.indexOf(listener);
    if (index < 0) {
      return;
    }
    this._listenerList.splice(index, 1);
  };

  /**
   * stop location manager service
   */
  stop = () => {
    this._clean();
  };

  _requestPermission = async () => {
    try {
      // console.log('check location permission');
      let response = await Permissions.check('location');
      // console.log('location permission check response: ' + response);
      if (response === 'denied' || response === 'undetermined') {
        // console.log('request location permission');
        response = await Permissions.request('location', {
          title: global.__APP_NAME__,
          message: `Vui lòng cho phép ${global.__APP_NAME__} truy cập vị trí của bạn để hiển thị kết quả tốt hơn`,
        });
        // console.log('location permission request response: ' + response);
        this._permissionStatus = response;
      } else {
        this._permissionStatus = response;
      }
    } catch (error) {
      // console.log('request location permission error: ', error);
      this._permissionStatus = 'denied';
    }
  };

  _handleAppStateChange = async nextAppState => {
    // console.log('location manager next app state: ' + nextAppState);
    if (this._appState !== nextAppState) {
      if (nextAppState === 'background') {
        // clean all data when app goes to background
        this._clean();
      } else if (nextAppState === 'active') {
        // check permission again and ask for it if user didn't allow
        await this._requestPermission();
        if (this.isEnabled()) {
          this._startWatching();
        } else {
          this._notifyPermissionDenied();
        }
      }
    }
    this._appState = nextAppState;
  };

  _startWatching = async (
    {disableHighAccuracy} = {
      disableHighAccuracy: false,
    },
  ) => {
    if (this._permissionStatus !== 'authorized') {
      return;
    }

    // clean watch
    this._clearWatch();

    let enableHighAccuracy = true;
    if (disableHighAccuracy) {
      enableHighAccuracy = false;
    }
    let timeout = 20000;
    if (Platform.OS === 'android') {
      try {
        const mode = await LocationMode.getMode();
        // console.log('android location mode: ', mode);
        if (!disableHighAccuracy) {
          enableHighAccuracy =
            mode === 'HIGH_ACCURACY' || mode === 'DEVICE_ONLY';
        }
        this._locationMode = mode;
        if (mode === 'HIGH_ACCURACY' && !disableHighAccuracy) {
          // reduce timeout so we can quickly switch using network provider to get location
          timeout = 10000;
        }
      } catch (error) {}
    }
    // console.log('enableHighAccuracy: ', enableHighAccuracy);
    this._enableHighAccuracy = enableHighAccuracy;

    const geolocation = navigator.geolocation;
    let options = {
      timeout: timeout,
      maximumAge: 120000,
      enableHighAccuracy: this._enableHighAccuracy,
    };
    geolocation.getCurrentPosition(
      this._updateLocation,
      this._handleError,
      options,
    );
    options = {
      ...options,
      distanceFilter: DISTANCE_FILTER_THRESHOLD,
      useSignificantChanges: false,
    };
    this._watchId = geolocation.watchPosition(
      this._updateLocation,
      this._handleError,
      options,
    );
  };

  _updateLocation = location => {
    if (!location) {
      // console.log('location is null');
      return;
    }

    const {latitude, longitude} = _.isNil(location.coords)
      ? location
      : location.coords;
    const data = [latitude, longitude];
    if (this._currentLocation) {
      const distance = geoFireUtils.calculateDistance(
        this._currentLocation,
        data,
      );
      // console.log('distance: ' + distance);
      if (distance < 0 || distance < DISTANCE_FILTER_THRESHOLD / 1000) {
        // console.log('location did not change much or invalid');
        return;
      }
    }
    // console.log('update location: ' + JSON.stringify(location));
    this._currentLocation = data;

    // notify listener
    this._notifyListeners({
      location: data,
    });
  };

  _handleError = error => {
    // console.log('location manager error: ' + JSON.stringify(error));
    if (this._currentLocation) {
      // if we still have location, just ignore error
      return;
    }

    const {code} = error;
    let err;
    let actionDisabled = false;
    if (code === 1) {
      // permission denied
      err = new Error(
        'Vui lòng bật cài đặt cho phép lấy vị trí của bạn để hiển thị đơn chính xác hơn',
      );
    } else if (code === 2) {
      // gps not turn on
      err = new Error(
        'Vui lòng bật định vị cho điện thoại của bạn để hiển thị đơn chính xác hơn',
      );
    } else if (code === 3) {
      // timeout
      // console.log('location mode: ' + this._locationMode);
      if (this._locationMode === 'HIGH_ACCURACY' && this._enableHighAccuracy) {
        // tried to get location using network
        this._startWatching({
          disableHighAccuracy: true,
        });
        err = new Error('Đang lấy vị trí của bạn, vui lòng chờ trong giây lát');
        actionDisabled = true;
      } else {
        if (this._locationMode === 'DEVICE_ONLY') {
          err = new Error(
            'Bạn đang chọn chế độ dò vị trí chỉ dùng GPS, tuy nhiên tín hiệu GPS đã bị chặn. Vui lòng chọn chế độ dò vị trí khác hoặc đi ra vùng không gian thoáng',
          );
        } else {
          err = new Error(
            'Không lấy được vị trí của bạn, vui lòng thử lại sau',
          );
        }
        actionDisabled = true;
      }
    } else {
      err = new Error('Không lấy được vị trí của bạn, vui lòng thử lại sau');
      actionDisabled = true;
    }
    this._notifyPermissionDenied(null, {
      error: err,
      actionDisabled: actionDisabled,
    });
  };

  /**
   * clean all data
   */
  _clean = () => {
    // console.log('clean data');
    // clean permission status
    this._permissionStatus = null;
    // _clean current location
    this._currentLocation = null;
    // clean watch id
    this._clearWatch();
    // clean timer
    this._clearTimer();
  };

  _clearWatch = () => {
    if (this._watchId) {
      const geolocation = navigator.geolocation;
      geolocation.clearWatch(this._watchId);
      this._watchId = null;
    }
  };

  _clearTimer = () => {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  };

  _notifyListeners = data => {
    if (this._listenerList && this._listenerList.length > 0) {
      // send new data to listener
      this._listenerList.forEach(listener => listener(data));
    }
  };

  _notifyPermissionDenied = (listener, data) => {
    if (!data) {
      data = {
        error: new Error(
          'Vui lòng bật cài đặt cho phép lấy vị trí của bạn để hiển thị đơn chính xác hơn',
        ),
        actionDisabled: false,
      };
    }
    if (listener) {
      listener(data);
    } else {
      this._notifyListeners(data);
    }
  };
}

reactMixin(LocationManager.prototype, TimerMixin);

export default LocationManager;
