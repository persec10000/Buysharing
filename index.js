/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry, Dimensions} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

global.__APP_NAME__ = 'Buy Sharing';
global.__SCREEN_WIDTH__ = Dimensions.get('window').width;
global.__SCREEN_HEIGHT__ = Dimensions.get('window').height;

AppRegistry.registerComponent(appName, () => App);
