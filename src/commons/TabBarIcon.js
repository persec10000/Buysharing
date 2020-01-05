import React, {Component} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

class TabBarIcon extends Component {
  render() {
    const {focused, image, tintColor} = this.props;
    return (
      <View style={[styles.iconContainer]}>
        <Image
          style={{tintColor: focused ? tintColor : '#8e8e93'}}
          source={image}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TabBarIcon;
