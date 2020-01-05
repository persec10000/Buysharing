import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import APIClient from '../utils/APIClient';
import _ from 'lodash';
import AbsoluteLoadingScreen from '../commons/AbsoluteLoadingScreen';

const DATA = [
  {
    name: 'Banana Bread',
    manufacturer: '',
    quantitive: '',
  },
  {
    name: 'Milk 3.2%',
    manufacturer: 'Milkland',
    quantitive: '',
  },
  {
    name: 'Rice',
    manufacturer: '',
    quantitive: '0.5 kg',
  },
  {
    name: 'Water',
    manufacturer: '',
    quantitive: '1l',
  },
  {
    name: 'Napkins',
    manufacturer: '',
    quantitive: '',
  },
  {
    name: 'Eggs',
    manufacturer: '',
    quantitive: '10',
  },
  {
    name: 'Soy sauce',
    manufacturer: '',
    quantitive: '',
  },
];

export default class ShoppingListContent extends Component {
  constructor(props) {
    super(props);

    const {orderDetail} = this.props;

    this.state = {
      orderDetail: orderDetail || {},
      isChecked: false,
      loading: false,
      productList: [],
    };
  }

  componentDidMount = () => {
    this._getProductList();
  };

  _getProductList = async () => {
    const {orderDetail} = this.state;
    console.log(orderDetail);
    if (_.isEmpty(orderDetail) || !orderDetail.order_id) return;
    this.setState({loading: true});
    const path = '/api/v1/order/product/order/' + orderDetail.order_id;
    const {response, error} = await APIClient.getInstance().GET(path);
    console.log('tai sao khong thay', response);
    if (!_.isEmpty(response)) {
      this.setState({
        productList: response,
      });
    }
    this.setState({loading: false});
  };

  _renderItem = ({item}) => {
    const {
      product_name,
      product_price,
      photo,
      volume,
      unit,
      amount,
      vendor_name,
    } = item;
    return (
      <Text style={styles.shoppingListItem}>
        - {product_name} {vendor_name} {amount}
      </Text>
    );
  };

  _keyExtractor = (item, index) => {
    return index.toString();
  };

  _onPressCheckbox = () => {
    this.setState(prevState => ({
      ...prevState,
      isChecked: !prevState.isChecked,
    }));
  };

  render() {
    const {orderDetail, loading, productList, isChecked} = this.state;

    const shopping_cost = orderDetail.shopping_cost || 0;
    const shipping_cost = orderDetail.shipping_cost || 0;

    return (
      <View style={styles.dialogContainer}>
        {loading && <AbsoluteLoadingScreen />}
        <View style={styles.dialogHeader}>
          <Text style={styles.dialogTitle}>Your shopping list</Text>
          <TouchableOpacity onPress={this.props._hideShoppingList}>
            <Image source={require('../resources/images/buyer/close.png')} />
          </TouchableOpacity>
        </View>
        <View style={styles.shoppingFlatlist}>
          <FlatList
            style={{flex: 1}}
            data={productList}
            renderItem={this._renderItem}
            keyExtractor={this._keyExtractor}
            contentContainerStyle={{flex: 1}}
          />
        </View>
        <View style={styles.shoppingCostDetail}>
          <View style={styles.costRow}>
            <Text style={[styles.costText, {fontWeight: 'bold'}]}>
              Shopping cost:
            </Text>
            <Text style={styles.costText}>
              {shopping_cost.toLocaleString()}$
            </Text>
          </View>
          <View style={styles.costRow}>
            <View style={styles.checkboxContainer}>
              <TouchableWithoutFeedback onPress={this._onPressCheckbox}>
                <ImageBackground
                  source={require('../resources/images/checkbox-uncheck.png')}
                  style={{
                    width: 30,
                    height: 30,
                    marginRight: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {isChecked && <View style={styles.checkedDot} />}
                </ImageBackground>
              </TouchableWithoutFeedback>
              <Text style={[styles.costText, {fontSize: 12}]}>
                Include shipping cost:
              </Text>
            </View>
            <Text style={styles.costText}>
              {shipping_cost.toLocaleString()}$
            </Text>
          </View>
          <View style={[styles.costRow, {marginBottom: 0}]}>
            <Text style={[styles.costText, {fontWeight: 'bold'}]}>
              Total cost:
            </Text>
            <Text style={styles.totalCost}>
              {(shopping_cost + shipping_cost).toLocaleString()}$
            </Text>
          </View>
        </View>
        <View style={styles.gradientBtnWrapper}>
          <TouchableOpacity style={styles.gradientBtn}>
            <LinearGradient
              style={styles.gradientBtnBackground}
              colors={['#E8222B', '#141414']}>
              <Text style={styles.gradientBtnLabel}>Go to payment</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  dialogContainer: {
    width: 290,
    height: 440,
    backgroundColor: '#fff',
    paddingVertical: 19,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 23,
    paddingRight: 16.5,
    marginBottom: 11,
  },
  dialogTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  shoppingFlatlist: {
    borderColor: '#707070',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 15,
    marginHorizontal: 13,
    padding: 15,
    flex: 1,
  },
  shoppingListItem: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  shoppingCostDetail: {
    paddingHorizontal: 23,
    paddingVertical: 18,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  costText: {
    fontSize: 16,
    letterSpacing: 0,
    color: '#707070',
  },
  totalCost: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#319800',
    letterSpacing: 0,
  },
  gradientBtnWrapper: {
    alignItems: 'center',
  },
  gradientBtn: {
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
  },
  gradientBtnBackground: {
    width: 265,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBtnLabel: {
    fontSize: 20,
    letterSpacing: 0,
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedDot: {
    width: 19,
    height: 19,
    backgroundColor: '#E8222B',
    borderRadius: 10,
  },
});
