import React, {Component} from 'react';
import {StyleSheet, View, Text, Button} from 'react-native';
import {
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';

export default class CustomizedTabBar extends Component {
  render() {
    const {navigation, activeTintColor, inactiveTintColor} = this.props;
    const {routes} = navigation.state;
    return (
      <View style={styles.tabBar}>
        {routes.map((route, index) => {
          const focused = index === navigation.state.index;
          const label = this.props.getLabelText({route});
          const renderIcon = this.props.renderIcon({
            route,
            focused: true,
            tintColor: focused ? activeTintColor : inactiveTintColor,
          });
          return (
            <View key={route.key} style={styles.tabBarItem}>
              <LinearGradient
                colors={
                  focused ? ['#E8222B', '#141414'] : ['#707070', '#707070']
                }
                style={styles.tabBarItemBackground}>
                <TouchableWithoutFeedback
                  style={[
                    styles.tabBarItemBackground,
                    {width: __SCREEN_WIDTH__ / routes.length},
                  ]}
                  onPress={() => navigation.navigate(route.key)}>
                  <View>
                    {renderIcon}
                    <Text style={styles.routeName}>{label}</Text>
                  </View>
                </TouchableWithoutFeedback>
              </LinearGradient>
            </View>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    flexDirection: 'row',
  },
  tabBarItem: {
    flex: 1,
  },
  tabBarItemBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeName: {
    fontSize: 20,
    letterSpacing: 0,
    color: '#fff',
    marginTop: 2,
  },
});
