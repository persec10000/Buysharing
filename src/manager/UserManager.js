import _ from 'lodash';
import {SwitchActions, NavigationActions} from 'react-navigation';
import {updateData, signOut} from '../redux/actions/user';
import APIClient from '../utils/APIClient';

export default class UserManager {
  static getInstance() {
    if (!UserManager.sharedInstance) {
      UserManager.sharedInstance = new UserManager();
    }
    return UserManager.sharedInstance;
  }

  getUser = () => {
    return this._user;
  };

  /**
   * update user, call after login
   * need to call dispatch to update user in redux store
   * @param user
   */
  updateUser = user => {
    if (this._user === user) {
      return;
    }

    this._user = user;
    this._store.dispatch(updateData(user));
  };

  /**
   * update redux store
   * @param store
   */
  updateStore = store => {
    console.log('user manager update store', store);
    if (!store || this._store === store) {
      return;
    }

    this._store = store;
    const user = store.getState().user.user;
    console.log('user====', user);
    this._user = user;
  };

  /**
   * update navigation
   * @param navigation
   */
  updateNavigation = navigation => {
    console.log('user manager update navigation', navigation);
    if (!navigation || this.navigation === navigation) {
      return;
    }

    this._navigation = navigation;
  };

  _getUserStatus = async () => {
    if (!this._user) return;
    const path = '/api/v1/user/' + this._user.user_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log('_getUserStatus', response);
    if (response.status && response.code === 200 && !_.isEmpty(response.data)) {
      this.updateUser(response.data);
      let params = {};
      let order_id = null;
      switch (response.data.role) {
        case 'buyer':
          let orderDetail = await this._getBuyerInfo(response.data.buyer_id);
          order_id = await this._getOrderInfoByBuyerId(response.data.buyer_id);
          params = {
            isMakingOrder: true,
            orderDetail: {
              ...orderDetail,
              order_id: order_id || null,
            },
          };
          this._navigation.dispatch(
            NavigationActions.navigate({routeName: 'Buyer', params}),
          );
          break;
        case 'supplier':
          let offerDetail = await this._getSupplierInfo(
            response.data.supplier_id,
          );
          order_id = await this._getOrderInfoBySupplierId(
            response.data.supplier_id,
          );
          params = {
            isMakingOffer: true,
            offerDetail: {
              ...offerDetail,
              order_id: order_id || null,
            },
          };
          this._navigation.dispatch(
            NavigationActions.navigate({routeName: 'Supplier', params}),
          );
          break;

        default:
          break;
      }
    }
  };

  _getSupplierInfo = async supplier_id => {
    const path = '/api/v1/supplier/' + supplier_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log(response);
    if (response && !_.isEmpty(response)) return response;
    return {};
  };

  _getOrderInfoBySupplierId = async supplier_id => {
    const path = '/api/v1/order/search/supplier/' + supplier_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    if (response && response.order_id) {
      return response.order_id;
    }
    return false;
  };

  _getBuyerInfo = async buyer_id => {
    const path = '/api/v1/buyer/' + buyer_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log(response);
    if (response && !_.isEmpty(response)) return response;
    return {};
  };

  _getOrderInfoByBuyerId = async buyer_id => {
    const path = '/api/v1/order/search/buyer/' + buyer_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    if (response && response.order_id) {
      return response.order_id;
    }
    return false;
  };

  signOut = async () => {
    const path = '/api/v1/auth/logout';
    const {response, error} = await APIClient.getInstance().jsonPOST(path);

    this._store.dispatch(signOut());
    this._navigation.dispatch(SwitchActions.jumpTo({routeName: 'Auth'}));
  };
}
