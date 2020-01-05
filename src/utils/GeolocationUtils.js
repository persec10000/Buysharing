import axios from 'axios';
import _ from 'lodash';

const GOOGLE_API_KEY = 'AIzaSyCdaUMXLJ_iDJvtwwOP10pdHMF0QYMUTYE';
const BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

export default class GeolocationUtils {
  static getInstance() {
    if (!GeolocationUtils.sharedInstance) {
      GeolocationUtils.sharedInstance = new GeolocationUtils();
    }
    return GeolocationUtils.sharedInstance;
  }

  getCoordinates = async address => {
    const params = {
      address,
      key: GOOGLE_API_KEY,
    };
    try {
      let rawResponse = await axios({
        url: BASE_URL,
        method: 'GET',
        params: params,
      });
      console.log('request url: ', rawResponse.request._url);
      const response = rawResponse.data;
      console.log('success: ', response);
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

  getAddress = async coordinates => {
    const params = {
      latlng: `${coordinates.latitude},${coordinates.longitude}`,
      key: GOOGLE_API_KEY,
    };
    try {
      let rawResponse = await axios({
        url: BASE_URL,
        method: 'GET',
        params: params,
      });
      console.log('request url: ', rawResponse.request._url);
      const response = rawResponse.data;
      console.log('success: ', response);
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
