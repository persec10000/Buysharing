import React, {Component} from 'react';
import {StyleSheet, View, ActivityIndicator} from 'react-native';
import _ from 'lodash';
import SplashScreen from 'react-native-splash-screen';
import LoginScreen from './auth/LoginScreen';
import RegisterScreen from './auth/RegisterScreen';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {
  createStackNavigator,
  StackViewStyleInterpolator,
  Header,
} from 'react-navigation-stack';
import {createBottomTabNavigator, BottomTabBar} from 'react-navigation-tabs';
import {createDrawerNavigator} from 'react-navigation-drawer';
import LinearGradient from 'react-native-linear-gradient';
import MainCarPoolingScreen from './carPooling/MainCarPoolingScreen';
import TabBarIcon from './commons/TabBarIcon';
import MainShopingScreen from './shoping/MainShopingScreen';
import DriverScreen from './carPooling/DriverScreen';
// import DriverNearbyScreen from './carPooling/DriverNearbyScreen';
import DriveroffersNearbyScreen from './carPooling/DriveroffersNearbyScreen'
import DriveroffersDetailScreen from './carPooling/DriveroffersDetailScreen'
import TripScreen from './carPooling/TripScreen';
import DriverWriteScreen from './carPooling/DriverWriteScreen';
import PassengerScreen from './carPooling/PassengerScreen';
import PassengerNearbyScreen from './carPooling/PassengerNearbyScreen';
import CustomizedTabBar from './commons/CustomizedTabBar';
import DrawerView from './navigation/DrawerView';
import SettingsScreen from './settings/SettingsScreen';
import BuyerScreen from './buyer/BuyerScreen';
import SupplierScreen from './supplier/SupplierScreen';
import ShoppingListScreen from './shoping/ShoppingListScreen';
import ItemLibraryScreen from './shoping/ItemLibraryScreen';
import NewItemScreen from './shoping/NewItemScreen';
import EditItemScreen from './shoping/EditItemScreen';
import OrderDetailScreen from './supplier/OrderDetailScreen';
import OffersNearbyScreen from './buyer/OffersNearbyScreen';
import MakeOrderScreen from './buyer/MakeOrderScreen';
import OrderConfirmedScreen from './buyer/OrderConfirmedScreen';
import UserManager from './manager/UserManager';
import SupplierOrderDetailScreen from './buyer/SupplierOrderDetailScreen';
import ItemLibraryManager from './manager/ItemLibraryManager';
import ShoppingListManager from './manager/ShoppingListManager';
import OrdersNearbyScreen from './supplier/OrdersNearbyScreen';
import BuyerOrderDetailScreen from './supplier/BuyerOrderDetailScreen';
import AbsoluteLoadingScreen from './commons/AbsoluteLoadingScreen';
import DriverSubScreen from './carPooling/DriverSubScreen';
console.disableYellowBox = true;
const userManager = UserManager.getInstance();
const itemLibraryManager = ItemLibraryManager.getInstance();
const shoppingListManager = ShoppingListManager.getInstance();

const CarPoolingRouteConfigs = {
  MainCarPooling: {
    screen: MainCarPoolingScreen,
  },
};

const CarPoolingNavigatorConfigs = {
  initialRouteName: 'MainCarPooling',
  headerLayoutPreset: 'center',
};

const CarPoolingNavigator = createStackNavigator(
  CarPoolingRouteConfigs,
  CarPoolingNavigatorConfigs,
);
const CarPoolingContainer = createAppContainer(CarPoolingNavigator);

const ShopingRouteConfigs = {
  MainShoping: {
    screen: MainShopingScreen,
  },
};

const ShopingNavigatorConfigs = {
  initialRouteName: 'MainShoping',
  headerLayoutPreset: 'center',
};

const ShopingNavigator = createStackNavigator(
  ShopingRouteConfigs,
  ShopingNavigatorConfigs,
);
const ShopingContainer = createAppContainer(ShopingNavigator);

const TabRouteConfigs = {
  CarPooling: {
    screen: CarPoolingContainer,
    navigationOptions: {
      tabBarLabel: 'Car Pooling',
      tabBarIcon: ({focused, horizontal, tintColor}) => {
        return (
          <TabBarIcon
            focused={focused}
            tintColor={tintColor}
            image={require('./resources/images/car.png')}
          />
        );
      },
    },
  },
  Shoping: {
    screen: ShopingContainer,
    navigationOptions: {
      tabBarLabel: 'Shoping',
      tabBarIcon: ({focused, horizontal, tintColor}) => {
        return (
          <TabBarIcon
            focused={focused}
            tintColor={tintColor}
            image={require('./resources/images/cart.png')}
          />
        );
      },
    },
  },
};

const TabNavigatorConfigs = {
  initialRouteName: 'Shoping',
  tabBarComponent: props => <CustomizedTabBar {...props} />,
  tabBarOptions: {
    activeTintColor: '#fff',
    inactiveTintColor: '#fff',
  },
};

const TabNavigator = createBottomTabNavigator(
  TabRouteConfigs,
  TabNavigatorConfigs,
);
const TabContainer = createAppContainer(TabNavigator);

const BuyerRouteConfigs = {
  Buyer: BuyerScreen,
  ShoppingList: ShoppingListScreen,
  ItemLibrary: ItemLibraryScreen,
  NewItem: NewItemScreen,
  EditItem: EditItemScreen,
  OffersNearby: OffersNearbyScreen,
  MakeOrder: MakeOrderScreen,
  OrderConfirmed: OrderConfirmedScreen,
  SupplierOrderDetail: SupplierOrderDetailScreen,
};

const BuyerNavigatorConfigs = {
  initialRouteName: 'Buyer',
  headerLayoutPreset: 'center',
};

const BuyerNavigator = createStackNavigator(
  BuyerRouteConfigs,
  BuyerNavigatorConfigs,
);
const BuyerContainer = createAppContainer(BuyerNavigator);

const DriverRouteConfigs = {
  Driver: DriverScreen,
  DriverSub: DriverSubScreen,
  // DriverNearby: DriverNearbyScreen,
  Trip: TripScreen,
  DriverWrite: DriverWriteScreen,
  Driverofferby: DriveroffersNearbyScreen,
  DriverDetail: DriveroffersDetailScreen
};

const DriverNavigatorConfigs = {
  initialRouteName: 'Driver',
  headerLayoutPreset: 'center',
};

const PassengerRouteConfigs = {
  Passenger: PassengerScreen,
  PassengerNearby: PassengerNearbyScreen,
};

const PassengerNavigatorConfigs = {
  initialRouteName: 'Passenger',
  headerLayoutPreset: 'center',
};

const PassengerNavigator = createStackNavigator(
  PassengerRouteConfigs,
  PassengerNavigatorConfigs,
);
const PassengerContainer = createAppContainer(PassengerNavigator);

const DriverNavigator = createStackNavigator(
  DriverRouteConfigs,
  DriverNavigatorConfigs,
);
const DriverContainer = createAppContainer(DriverNavigator);

const SupplierRouteConfigs = {
  Supplier: SupplierScreen,
  OrderDetail: OrderDetailScreen,
  OrdersNearby: OrdersNearbyScreen,
  BuyerOrderDetail: BuyerOrderDetailScreen,
};

const SupplierNavigatorConfigs = {
  initialRouteName: 'Supplier',
  headerLayoutPreset: 'center',
};

const SupplierNavigator = createStackNavigator(
  SupplierRouteConfigs,
  SupplierNavigatorConfigs,
);
const SupplierContainer = createAppContainer(SupplierNavigator);

const MainAppRouteConfigs = {
  MainTab: {
    screen: TabContainer,
    navigationOptions: {
      header: null,
    },
  },
  BuyerStack: {
    screen: BuyerContainer,
    navigationOptions: {
      header: null,
    },
  },
  SupplierStack: {
    screen: SupplierContainer,
    navigationOptions: {
      header: null,
    },
  },
  DriverStack: {
    screen: DriverContainer,
    navigationOptions: {
      header: null,
    },
  },
  PassengerStack: {
    screen: PassengerContainer,
    navigationOptions: {
      header: null,
    },
  },
  Settings: SettingsScreen,
};

const MainAppNavigatorConfigs = {
  initialRouteName: 'MainTab',
};

const MainAppNavigator = createStackNavigator(
  MainAppRouteConfigs,
  MainAppNavigatorConfigs,
);
const MainAppContainer = createAppContainer(MainAppNavigator);

const DrawerRouteConfigs = {
  MainAppStack: MainAppContainer,
};

const DrawerNavigatorConfigs = {
  initialRouteName: 'MainAppStack',
  contentComponent: DrawerView,
  drawerWidth: 299,
  // drawerType: 'slide',
};

const DrawerNavigator = createDrawerNavigator(
  DrawerRouteConfigs,
  DrawerNavigatorConfigs,
);
const DrawerContainer = createAppContainer(DrawerNavigator);

const AuthRouteConfigs = {
  Login: {
    screen: LoginScreen,
  },
  Register: {
    screen: RegisterScreen,
  },
  MainScreen: {
    screen: DrawerContainer,
    navigationOptions: {
      header: null,
    },
  },
};

const AuthStackNavigatorConfig = {
  initialRouteName: 'Login',
};

const AuthNavigator = createStackNavigator(
  AuthRouteConfigs,
  AuthStackNavigatorConfig,
);
const AuthContainer = createAppContainer(AuthNavigator);

class AuthLoadingScreen extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    // const userToken = await AsyncStorage.getItem('userToken');

    const user = userManager.getUser();
    // console.log(user)

    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    this.props.navigation.navigate(!_.isEmpty(user) ? 'App' : 'Auth');
  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }
}

const AppSwitchRouteConfigs = {
  AuthLoading: AuthLoadingScreen,
  Auth: AuthContainer,
  App: DrawerContainer,
};

const AppSwitchNavigatorConfigs = {
  initialRouteName: 'AuthLoading',
};

const AppSwitchNavigator = createSwitchNavigator(
  AppSwitchRouteConfigs,
  AppSwitchNavigatorConfigs,
);
const AppSwitchContainer = createAppContainer(AppSwitchNavigator);

export default class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  componentDidMount = async () => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 3000);
    this.setState({loading: true});
    await userManager.updateNavigation(this._navigator);
    await itemLibraryManager.updateNavigation(this._navigator);
    await shoppingListManager.updateNavigation(this._navigator);
    await userManager._getUserStatus();
    this.setState({loading: false});
  };

  render() {
    const {loading} = this.state;
    return (
      <View style={styles.container}>
        {loading && <AbsoluteLoadingScreen />}
        <AppSwitchContainer ref={ref => (this._navigator = ref)} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
