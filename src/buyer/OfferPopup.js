import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import _ from 'lodash';
import APIClient from '../utils/APIClient';
import FastImage from 'react-native-fast-image';

export default class OfferPopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasOffered: false,
      orderDetail: this.props.orderDetail || {},
      supplierInOffering: {},
    };
  }

  componentDidMount() {
    this._getUpdateOrder();
    this.interval = setInterval(() => {
      this._getUpdateOrder();
    }, 5000);
  }

  componentWillUnmount = () => {
    clearInterval(this.interval);
  };

  _getUpdateOrder = async () => {
    const {orderDetail} = this.state;
    console.log('orderDetail', orderDetail);
    if (_.isEmpty(orderDetail)) return;
    const path = '/api/v1/order/' + orderDetail.order_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log(response);
    if (response && !_.isEmpty(response) && response.supplier_id) {
      this._getSupplier(response.supplier_id);
    }
  };

  _getSupplier = async supplier_id => {
    const path = '/api/v1/supplier/' + supplier_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log(response);
    if (response && !_.isEmpty(response) && response.supplier_id) {
      this.setState({
        supplierInOffering: response,
      });
    }
  };

  _viewDetail = () => {
    const {orderDetail, supplierInOffering} = this.state;

    const params = {
      orderDetail,
      supplierInOffering,
    };
    this.props.navigation.navigate('SupplierOrderDetail', params);
  };

  render() {
    const {hasOffered, supplierInOffering} = this.state;
    const {navigation} = this.props;
    return (
      <View style={styles.popupPurpose}>
        {!hasOffered && _.isEmpty(supplierInOffering) ? (
          <View
            style={{
              flex: 1,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            <ActivityIndicator />
            <Text style={{fontSize: 16, color: '#707070', marginLeft: 10}}>
              Waiting for supplier
            </Text>
          </View>
        ) : (
          [
            <TouchableOpacity
              onPress={this._viewDetail}
              key="1"
              style={styles.customerContainer}>
              <FastImage
                style={styles.customerAvatar}
                resizeMode={FastImage.resizeMode.cover}
                source={
                  supplierInOffering.avatar
                    ? {
                        uri: `data:image/gif;base64,${supplierInOffering.avatar}`,
                      }
                    : require('../resources/images/buyer/default-avatar.png')
                }
              />
              <Text style={styles.customerName}>
                {supplierInOffering.fullname || 'Unknow'}
              </Text>
              <View style={styles.reviewContainer}>
                <Image
                  source={require('../resources/images/profile/thumbs-up.png')}
                />
                <View style={styles.reviews}>
                  <Text style={[styles.reviewText, {color: '#319800'}]}>2</Text>
                  <Text style={styles.reviewText}>/3</Text>
                </View>
              </View>
            </TouchableOpacity>,
            <View key="2" style={styles.deliveryContainer}>
              <View style={styles.deliveryInfo}>
                <TouchableOpacity
                  onPress={this._viewDetail}
                  style={styles.delivery}>
                  <View style={styles.deliveryRow}>
                    <Image
                      style={{marginRight: 7.5}}
                      source={require('../resources/images/buyer/vehicle.png')}
                    />
                    <Text>Mercedes A300</Text>
                  </View>
                  <View style={styles.deliveryRow}>
                    <Image
                      style={{marginRight: 7.5}}
                      source={require('../resources/images/buyer/distance.png')}
                    />
                    <Text>1.5 km</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.deliveryCost}>
                  <Text style={styles.deliveryCostText}>6 $</Text>
                  <Text style={styles.deliveryCostText}>+ purchase</Text>
                </View>
              </View>
              <View style={styles.deliveryActions}>
                <TouchableOpacity
                  style={[styles.deliveryActionBtn, {marginRight: 20}]}>
                  <LinearGradient
                    style={styles.deliveryActionBackground}
                    colors={['#E8222B', '#141414']}>
                    <Text style={styles.deliveryActionText}>Accept</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deliveryActionBtn}>
                  <LinearGradient
                    style={styles.deliveryActionBackground}
                    colors={['#888888', '#888888']}>
                    <Text style={styles.deliveryActionText}>Decline</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>,
          ]
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  popupPurpose: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 15,
    position: 'absolute',
    top: 73,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
  },
  customerContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  customerAvatar: {
    width: 45,
    height: 45,
  },
  customerName: {
    maxWidth: 62,
    textAlign: 'center',
  },
  reviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviews: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  reviewText: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
    fontWeight: '700',
  },
  deliveryContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  delivery: {
    flex: 1,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  deliveryCost: {
    alignItems: 'center',
  },
  deliveryCostText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#319800',
  },
  deliveryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryActionBtn: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  deliveryActionBackground: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  deliveryActionText: {
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0,
  },
});
