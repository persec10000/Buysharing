import React from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import {isIphoneX, getStatusBarHeight} from 'react-native-iphone-x-helper';
import {Header} from 'react-navigation-stack';
import LinearGradient from 'react-native-linear-gradient';

export default GradientHeader = props => (
  <View style={{backgroundColor: 'black'}}>
    <LinearGradient
      colors={['#E8222B', '#AC040C']}
      style={[
        {
          height: Header.HEIGHT + (isIphoneX() ? getStatusBarHeight() - 6 : 0),
        },
      ]}>
      <Header {...props} />
    </LinearGradient>
  </View>
);
