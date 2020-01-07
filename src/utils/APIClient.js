import axios from 'axios';
import _ from 'lodash';
import querystring from 'querystring';
import Qs from 'qs';

let Axios = axios.create({
  paramsSerializer: params => Qs.stringify(params, {arrayFormat: 'repeat'}),
});

export default class APIClient {
  static getInstance() {
    if (!APIClient.sharedInstance) {
      APIClient.sharedInstance = new APIClient();
    }
    return APIClient.sharedInstance;
  }

  /**
   * parse error to get message
   * @param error
   * @param defaultMessage default message
   */
  static parseErrorMessage = ({error, defaultMessage}) => {
    if (
      !_.isNil(error) &&
      !_.isNil(error.response) &&
      !_.isNil(error.response.data) &&
      !_.isNil(error.response.data.error) &&
      !_.isNil(error.response.data.error.message)
    ) {
      return error.response.data.error.message;
    }
    return defaultMessage;
  };

  /**
   * parse error to get status code
   * @param error
   * @param defaultStatusCode
   */
  static parseErrorStatus = ({error, defaultStatusCode = 404}) => {
    if (!_.isNil(error) && !_.isNil(error.response)) {
      return error.response.status;
    }
    return defaultStatusCode;
  };

  GET = async (path, params, cancelToken) => {
    return await this.request(
      'GET',
      path,
      null,
      null,
      params,
      null,
      cancelToken,
    );
  };

  jwtGET = async (path, jwtToken, params, cancelToken) => {
    const headers = {};
    headers['Authorization'] = jwtToken;
    return await this.request(
      'GET',
      path,
      headers,
      null,
      params,
      null,
      cancelToken,
    );
  };

  POST = async (path, data, header, cancelToken) => {
    return await this.request(
      'POST',
      path,
      header,
      null,
      null,
      data,
      cancelToken,
    );
  };

  PUT = async (path, data, cancelToken) => {
    return await this.request('PUT', path, null, null, null, data, cancelToken);
  };

  DELETE = async (path, data, cancelToken) => {
    return await this.request(
      'DELETE',
      path,
      null,
      null,
      null,
      data,
      cancelToken,
    );
  };

  paramsPOST = async (path, params, data, cancelToken) => {
    return await this.request(
      'POST',
      path,
      null,
      null,
      params,
      data,
      cancelToken,
    );
  };

  jsonPOST = async (path, data, cancelToken) => {
    const headers = {
      'Content-Type': 'application/json;charset=UTF-8',
    };
    return await this.request(
      'post',
      path,
      headers,
      null,
      null,
      data,
      cancelToken,
    );
  };

  jsonPUT = async (path, data, cancelToken) => {
    const headers = {
      'Content-Type': 'application/json;charset=UTF-8',
    };
    return await this.request(
      'put',
      path,
      headers,
      null,
      null,
      data,
      cancelToken,
    );
  };

  jsonParamsPUT = async (path, params, data, cancelToken) => {
    const headers = {
      'Content-Type': 'application/json;charset=UTF-8',
    };
    return await this.request(
      'put',
      path,
      headers,
      null,
      params,
      data,
      cancelToken,
    );
  };

  authPOST = async (path, auth, cancelToken) => {
    return await this.request(
      'POST',
      path,
      null,
      auth,
      null,
      null,
      cancelToken,
    );
  };

  jwtPOST = async (path, jwtToken, data, cancelToken) => {
    const headers = {};
    headers['Authorization'] = jwtToken;
    return await this.request(
      'POST',
      path,
      headers,
      null,
      null,
      data,
      cancelToken,
    );
  };

  request = async (method, path, headers, auth, params, data, cancelToken) => {
    try {
      let url;
      if (_.startsWith(path, 'http')) {
        const baseURL = 'http://192.168.207.74:5001';
        url = baseURL + path;
      } else {
        // const baseURL = 'http://159.65.13.232:5001'
        const baseURL = 'http://192.168.207.74:5001';
        url = baseURL + path;
      }

      if (_.isNil(params)) {
        params = {};
      }

      if (_.isNil(headers)) {
        headers = {};
      }
      headers['Accept'] = 'application/json';
      if (!_.isEmpty(this._token) && _.isNil(headers['Authorization'])) {
        headers['Authorization'] = this._token;
      }
      if (method === 'GET') {
      } else if (!_.isNil(data)) {
        if (data instanceof FormData) {
          headers['Content-Type'] = 'multipart/form-data';
        } else {
          const contentType = headers['Content-Type'];
          if (contentType === 'application/json;charset=UTF-8') {
            // post using json
            data = JSON.stringify(data);
          } else {
            // post using x-www-form-urlencoded
            headers['Content-Type'] =
              'application/x-www-form-urlencoded;charset=UTF-8';
            data = querystring.stringify(data);
          }
        }
      }

      console.log('method: ' + method);
      console.log('headers: ' + JSON.stringify(headers));
      console.log('path: ' + path);
      console.log('url: ' + url);
      console.log('params: ' + JSON.stringify(params));
      console.log('data: ' + data);
      console.log('cancel token: ' + (cancelToken ? 'not null' : 'null'));

      let rawResponse = await Axios({
        url: url,
        method: method,
        headers: headers,
        params: params,
        data: data,
        cancelToken: cancelToken,
      });
      console.log('request url: ', rawResponse.data);
      const response = rawResponse.data;
      return {
        response,
      };
    } catch (error) {
      console.log('error: ', error);
      return {
        error,
      };
    }
  };
}
