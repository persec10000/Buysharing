/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import Index from './src/Index';
import {
  StatusBar,
  Platform,
  Text,
  StyleSheet,
  ScrollView,
  Keyboard,
  View,
} from 'react-native';
import {omit} from 'lodash';
import getFontFamily from './src/utils/getFontFamily';
import LanguageManager from './src/manager/LanguageManager';
import LocationManager from './src/manager/LocationManager';
import UserManager from './src/manager/UserManager';
import ItemLibraryManager from './src/manager/ItemLibraryManager';
import ShoppingListManager from './src/manager/ShoppingListManager';

// redux
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import {PersistGate} from 'redux-persist/integration/react';
import {persistStore, persistReducer} from 'redux-persist';
import rootReducer from './src/redux/reducers/index';
import AsyncStorage from '@react-native-community/async-storage';

LanguageManager.getInstance().initialize();
LocationManager.getInstance().initialize();
ItemLibraryManager.getInstance().initialize();
ShoppingListManager.getInstance().initialize();

StatusBar.setBarStyle('dark-content');

const setCustomText = customProps => {
  const TextRender = Text.render;
  const initialDefaultProps = Text.defaultProps;
  Text.defaultProps = {
    ...initialDefaultProps,
    ...customProps,
  };
  Text.render = function render(props) {
    let oldProps = props;
    const style = StyleSheet.flatten([customProps.style, props.style]);
    props = {
      ...props,
      style:
        style.fontFamily === 'Raleway' || !style.fontFamily
          ? [
              omit(style, 'fontWeight', 'fontStyle'),
              {
                fontFamily: getFontFamily('Raleway', style),
              },
            ]
          : style,
    };
    try {
      return TextRender.apply(this, arguments);
    } finally {
      props = oldProps;
    }
  };
};

setCustomText({});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
let store = createStore(persistedReducer, applyMiddleware(thunk));

class App extends React.Component {
  constructor() {
    super();
    this.state = {rehydrated: false};
  }

  _updateStore = () => {
    console.log('rehydrated');
    // APIClient.getInstance().updateStore(store);
    UserManager.getInstance().updateStore(store);
    ItemLibraryManager.getInstance().updateStore(store);
    ShoppingListManager.getInstance().updateStore(store);

    this.setState({rehydrated: true});
  };

  componentWillMount() {
    this._persistor = persistStore(store, null, this._updateStore);
  }

  render() {
    if (!this.state.rehydrated) {
      return <View />;
    }

    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={this._persistor}>
          <Index />
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
