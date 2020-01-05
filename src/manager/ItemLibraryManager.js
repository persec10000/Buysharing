import _ from 'lodash';
import {updateList} from '../redux/actions/itemLibrary';

export default class ItemLibraryManager {
  static getInstance() {
    if (!ItemLibraryManager.sharedInstance) {
      ItemLibraryManager.sharedInstance = new ItemLibraryManager();
    }
    return ItemLibraryManager.sharedInstance;
  }

  initialize = () => {
    this._screenList = [];
  };

  getItemList = () => {
    return this._itemList;
  };

  updateItemLibrary = async itemList => {
    if (_.isEqual(this._itemList, itemList)) return;

    this._itemList = itemList;
    await this._store.dispatch(updateList(itemList));
    this.notifyUpdateScreen();
  };

  /**
   * update redux store
   * @param store
   */
  updateStore = store => {
    console.log('item library manager update store', store);
    if (!store || this._store === store) {
      return;
    }

    this._store = store;
    const itemList = store.getState().itemLibrary.itemList;
    this._itemList = itemList;
  };

  /**
   * update navigation
   * @param navigation
   */
  updateNavigation = navigation => {
    console.log('item library manager update navigation', navigation);
    if (!navigation || this.navigation === navigation) {
      return;
    }

    this._navigation = navigation;
  };

  addScreen = screen => {
    // validate screen
    if (
      !screen ||
      typeof screen._getItemsFromLibrary !== 'function' ||
      typeof screen._getItemsFromLibrary !== 'function'
    ) {
      return;
    }

    const index = _.findIndex(this._screenList, screen);
    if (index >= 0) {
      // we already add this screen
      return;
    }

    this._screenList.push(screen);
  };

  removeScreen = screen => {
    if (!screen) {
      return;
    }

    const index = _.findIndex(this._screenList, screen);
    if (index < 0) {
      // we didn't add this screen
      return;
    }

    // remove screen
    this._screenList.splice(index, 1);
  };

  notifyUpdateScreen = () => {
    if (this._screenList && this._screenList.length > 0) {
      console.log('notifyUpdateScreen', this._screenList);
      // send new data to listener
      this._screenList.forEach(screen => {
        screen._getItemsFromLibrary();
      });
    }
  };
}
