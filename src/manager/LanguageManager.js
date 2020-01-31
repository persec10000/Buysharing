// import * as RNLocalize from 'react-native-localize';
// import i18n from 'i18n-js';
// import memoize from 'lodash.memoize'; // Use for caching/memoize for better performance
// import {I18nManager} from 'react-native';
// import _ from 'lodash';

// const translationGetters = {
//   // lazy requires (metro bundler does not support symlinks)
//   en: () => require('../../translations/en.json'),
//   de: () => require('../../translations/de.json'),
// };

// const translate = memoize(
//   (key, config) => i18n.t(key, config),
//   (key, config) => (config ? key + JSON.stringify(config) : key),
// );

// export default class LanguageManager {
//   static getInstance() {
//     if (!LanguageManager.sharedInstance) {
//       LanguageManager.sharedInstance = new LanguageManager();
//     }
//     return LanguageManager.sharedInstance;
//   }

//   initialize = () => {
//     this._screenList = [];
//     this.setI18nConfig();
//   };

//   setI18nConfig = () => {
//     // fallback if no available language fits
//     const fallback = {languageTag: 'en', isRTL: false};

//     const {languageTag, isRTL} =
//       this.languageTag ||
//       // RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
//       fallback;

//     // clear translation cache
//     translate.cache.clear();
//     // update layout direction
//     I18nManager.forceRTL(isRTL);
//     // set i18n-js config
//     i18n.translations = {[languageTag]: translationGetters[languageTag]()};
//     i18n.locale = languageTag;
//   };

//   translateText = text => {
//     return translate(text);
//   };

//   setAppLanguage = language => {
//     this.languageTag = language;
//     this._updateScreenLanguage();
//   };

//   _updateScreenLanguage = () => {
//     this._screenList.length > 0 &&
//       this._screenList.forEach(screen => {
//         screen.handleLocalizationChange();
//       });
//   };

//   addScreen = screen => {
//     // validate screen
//     if (
//       !screen ||
//       typeof screen.handleLocalizationChange !== 'function' ||
//       typeof screen.handleLocalizationChange !== 'function'
//     ) {
//       return;
//     }

//     const index = _.findIndex(this._screenList, screen);
//     if (index >= 0) {
//       // we already add this screen
//       return;
//     }

//     this._screenList.push(screen);
//   };

//   removeScreen = screen => {
//     if (!screen) {
//       return;
//     }

//     const index = _.findIndex(this._screenList, screen);
//     if (index < 0) {
//       // we didn't add this screen
//       return;
//     }

//     // remove screen
//     this._screenList.splice(index, 1);
//   };
// }
