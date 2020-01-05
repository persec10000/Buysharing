import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import _ from 'lodash';
import APIClient from '../utils/APIClient';
import FastImage from 'react-native-fast-image';

export default class OrderPopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasOrdered: false,
      offerDetail: this.props.offerDetail || {},
      buyerInOrdering: {},
    };
  }

  componentDidMount() {
    this._getUpdateOrder();
    this.interval = setInterval(() => {
      this._getUpdateOrder();
    }, 3000);
  }

  componentWillUnmount = () => {
    clearInterval(this.interval);
  };

  _getUpdateOrder = async () => {
    const {offerDetail} = this.state;
    console.log('offerDetail', offerDetail);
    if (_.isEmpty(offerDetail)) return;
    const path = '/api/v1/order/' + offerDetail.order_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log(response);
    if (response && !_.isEmpty(response) && response.buyer_id) {
      this._getBuyer(response.buyer_id);
    }
  };

  _getBuyer = async buyer_id => {
    const path = '/api/v1/buyer/' + buyer_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log(response);
    if (response && !_.isEmpty(response) && response.buyer_id) {
      this.setState({
        buyerInOrdering: response,
      });
    }
  };

  _viewDetail = () => {
    const {offerDetail, buyerInOrdering} = this.state;

    const params = {
      offerDetail,
      buyerInOrdering,
    };
    this.props.navigation.navigate('OrderDetail', params);
  };

  render() {
    const {hasOrdered, buyerInOrdering} = this.state;
    const {navigation} = this.props;
    return (
      <View style={styles.popupPurpose}>
        {!hasOrdered && _.isEmpty(buyerInOrdering) ? (
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
              Waiting for buyer
            </Text>
          </View>
        ) : (
          [
            <View key="1" style={styles.customerContainer}>
              <FastImage
                style={styles.customerAvatar}
                resizeMode={FastImage.resizeMode.cover}
                source={
                  buyerInOrdering.avatar
                    ? {uri: `data:image/gif;base64,${buyerInOrdering.avatar}`}
                    : require('../resources/images/buyer/default-avatar.png')
                }
              />
              <Text style={styles.customerName}>
                {buyerInOrdering.fullname}
              </Text>
              <Text style={styles.customerName}>1,5 km</Text>
            </View>,
            <View key="2" style={styles.deliveryContainer}>
              <View style={styles.deliveryInfo}>
                <TouchableOpacity
                  onPress={this._viewDetail}
                  style={styles.delivery}>
                  <Text style={styles.offerDetailText}>View Order Details</Text>
                </TouchableOpacity>
                <View style={styles.offerCost}>
                  <Text style={styles.offerCostText}>Delivery:</Text>
                  <Text style={[styles.offerCostText, {fontSize: 24}]}>
                    6 $
                  </Text>
                </View>
              </View>
              <View style={styles.offerActions}>
                <TouchableOpacity
                  style={[styles.offerActionBtn, {marginRight: 20}]}>
                  <LinearGradient
                    style={styles.offerActionBackground}
                    colors={['#E8222B', '#141414']}>
                    <Text style={styles.offerActionText}>Accept</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.offerActionBtn}>
                  <LinearGradient
                    style={styles.offerActionBackground}
                    colors={['#888888', '#888888']}>
                    <Text style={styles.offerActionText}>Decline</Text>
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
  deliveryContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  delivery: {
    width: 170,
    height: 40,
    borderColor: '#AC040C',
    borderWidth: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerDetailText: {
    fontSize: 15,
    color: '#AC040C',
  },
  offerCost: {
    marginLeft: 6,
    alignItems: 'center',
  },
  offerCostText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#319800',
  },
  offerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerActionBtn: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  offerActionBackground: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  offerActionText: {
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0,
  },
});
