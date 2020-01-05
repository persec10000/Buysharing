import React, {Component} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import GradientHeader from '../commons/GradientHeader';
import Icons from '../utils/Icons';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import APIClient from '../utils/APIClient';
import _ from 'lodash';
import AbsoluteLoadingScreen from '../commons/AbsoluteLoadingScreen';
import FastImage from 'react-native-fast-image';

const ITEM_LIST = [
  {
    name: 'Almond Milk',
    manufacturer: 'Firm-manufacturer',
    volume: '200 ml',
    image: require('../resources/images/buyer/example-milk.png'),
    amount: 1,
    check: true,
  },
  {
    name: 'Chocolate',
    manufacturer: 'Milka',
    volume: '200 g',
    image: require('../resources/images/buyer/example-chocolate.png'),
    amount: 2,
    check: true,
  },
  {
    name: 'Chocolate',
    manufacturer: 'Milka',
    volume: '200 g',
    image: require('../resources/images/buyer/example-chocolate.png'),
    amount: 2,
  },
  {
    name: 'Chocolate',
    manufacturer: 'Milka',
    volume: '200 g',
    image: require('../resources/images/buyer/example-chocolate.png'),
    amount: 2,
  },
  {
    name: 'Chocolate',
    manufacturer: 'Milka',
    volume: '200 g',
    image: require('../resources/images/buyer/example-chocolate.png'),
    amount: 2,
  },
];

const ProductItem = props => {
  const {item, editItem, removeItem} = props;
  const {product_name, vendor_name, volume, unit, amount, photo, check} = item;
  return (
    <View style={styles.productItem}>
      <View style={styles.itemContainer}>
        <View style={styles.itemImageWrapper}>
          <Image
            style={styles.itemImage}
            source={{uri: `data:image/gif;base64,${photo}`}}
          />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{product_name}</Text>
          <Text style={styles.itemManufacturer}>{vendor_name}</Text>
          <Text style={styles.itemQuantitative}>
            {volume} {unit}
          </Text>
          <Text style={styles.itemQuantitative}>Amount: {amount}</Text>
        </View>
        <View style={{justifyContent: 'center'}}>
          <TouchableWithoutFeedback>
            <View style={styles.itemCheckWrapper}>
              {/* {check && <Image source={require('../resources/images/supplier/check.png')} />} */}
              <Image
                source={require('../resources/images/supplier/check.png')}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </View>
  );
};

export default class BuyerOrderDetailScreen extends Component {
  static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      headerTitleStyle: {color: '#fff'},
      headerStyle: {
        backgroundColor: 'transparent',
      },
      header: props => <GradientHeader {...props} />,
      headerTitle: <Text style={styles.headerTitle}>Supplier</Text>,
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('MainTab');
          }}
          style={styles.headerLeftBtn}>
          <Image
            style={{tintColor: '#fff'}}
            source={require('../resources/images/settings/caret-left.png')}
          />
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);

    const {orderDetails} = this.props.navigation.state.params;
    this.state = {
      orderDetails: orderDetails || {},
      buyerShoppingList: [],
      loading: false,
    };
  }

  componentDidMount = async () => {
    this._getBuyerInfo();
    const order_id = await this._getOrderInfo();
    this._getBuyerShoppingList(order_id);
  };

  _getBuyerInfo = async () => {
    const {orderDetails} = this.state;
    if (!orderDetails.user_id) return;

    const path = '/api/v1/user/' + orderDetails.user_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log(response);
    if (response && response.status && !_.isEmpty(response.data)) {
      this.setState(prevState => ({
        orderDetails: {
          ...prevState.orderDetails,
          ...response.data,
        },
      }));
    }
  };

  _getOrderInfo = async () => {
    const {orderDetails} = this.state;
    const path = '/api/v1/order/search/buyer/' + orderDetails.buyer_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log(orderDetails, response);
    if (response && response.order_id) {
      return response.order_id;
    }
    return false;
  };

  _getBuyerShoppingList = async order_id => {
    if (!order_id) return;

    this.setState({loading: true});
    const path = '/api/v1/order/product/order/' + order_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log(response);
    if (response && !_.isEmpty(response))
      this.setState({buyerShoppingList: response});
    this.setState({loading: false});
  };

  _renderItem = ({item}) => {
    return <ProductItem item={item} />;
  };

  _keyExtractor = (item, index) => {
    return index.toString();
  };

  render() {
    const {orderDetails, buyerShoppingList, loading} = this.state;
    return (
      <View style={styles.container}>
        {loading && <AbsoluteLoadingScreen />}
        <TouchableOpacity
          onPress={() => this.props.navigation.goBack()}
          style={[styles.offerMainInfo, styles.shadowStyle]}>
          <View style={styles.supplierContainer}>
            <FastImage
              style={styles.supplierAvatar}
              source={
                orderDetails.avatar
                  ? {uri: `data:image/gif;base64,${orderDetails.avatar}`}
                  : require('../resources/images/buyer/default-avatar.png')
              }
            />
            <Text style={styles.supplierName}>
              {/* John Dou */}
              {orderDetails.fullname || 'Unknow'}
            </Text>
          </View>
          <View style={styles.offerDetail}>
            <View style={styles.offerDetailRow}>
              <View style={styles.rowIcon}>
                <Image
                  source={require('../resources/images/buyer/marker.png')}
                />
              </View>
              <Text style={styles.rowLabel}>
                {orderDetails.buying_street}, {orderDetails.buying_city},{' '}
                {orderDetails.buying_country}
              </Text>
            </View>
            <View style={styles.offerDetailRow}>
              <View style={styles.rowIcon}>
                <Image
                  source={require('../resources/images/buyer/corner-down-right.png')}
                />
              </View>
              <Text style={styles.rowLabel}>
                {orderDetails.ship_street}, {orderDetails.ship_city},{' '}
                {orderDetails.ship_country}
              </Text>
            </View>
            <View style={styles.offerDetailRow}>
              <View style={styles.rowIcon}>
                <Icons.FontAwesome name="clock-o" size={20} color="#707070" />
              </View>
              <Text style={styles.rowLabel}>
                {orderDetails.buying_date}, {orderDetails.ship_date}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <FlatList
          style={{flex: 1}}
          showsVerticalScrollIndicator={false}
          data={buyerShoppingList}
          renderItem={this._renderItem}
          keyExtractor={this._keyExtractor}
          contentContainerStyle={styles.contentContainerStyle}
        />
        <View style={[styles.screenFooter, styles.shadowStyle]}>
          <Text style={styles.noticeCheckText}>
            Please don't forget to take the check.
          </Text>
          <View style={{flexDirection: 'row', marginTop: 15}}>
            <TouchableOpacity
              style={[styles.contactButton, styles.shadowStyle]}>
              <Image
                source={require('../resources/images/supplier/mail.png')}
              />
              <Text style={styles.contactText}>Write</Text>
            </TouchableOpacity>
            <View style={{width: 13}} />
            <TouchableOpacity
              style={[styles.contactButton, styles.shadowStyle]}>
              <Image
                source={require('../resources/images/supplier/phone.png')}
              />
              <Text style={styles.contactText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerLeftBtn: {
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },

  offerMainInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    // alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  supplierContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  supplierAvatar: {
    width: 55,
    height: 55,
  },
  supplierName: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#6A6A6A',
    maxWidth: 72,
    textAlign: 'center',
  },
  offerDetail: {
    justifyContent: 'space-between',
    flex: 1,
  },
  offerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  rowIcon: {
    width: 31,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  shadowStyle: {
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
  },
  contentContainerStyle: {
    paddingVertical: 23,
    paddingHorizontal: 14,
  },
  screenFooter: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  noticeCheckText: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
    textAlign: 'center',
  },
  contactButton: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#888888',
    borderRadius: 15,
    overflow: 'hidden',
  },
  contactText: {
    marginLeft: 11.5,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0,
  },
  productItem: {
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#C2C2C2',
    padding: 14,
  },
  itemImageWrapper: {
    backgroundColor: '#fff',
    shadowColor: '#00000029',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
  },
  itemImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  itemInfo: {
    marginLeft: 15,
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#6A6A6A',
    letterSpacing: 0,
    marginBottom: 5,
  },
  itemManufacturer: {
    fontSize: 14,
    color: '#707070',
    letterSpacing: 0,
    marginBottom: 10,
  },
  itemQuantitative: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  itemCheckWrapper: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderColor: '#C2C2C2',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPriceLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#319800',
    letterSpacing: 0,
    marginRight: 10,
  },
  itemPriceValue: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#319800',
    letterSpacing: 0,
  },
});
