import React, {Component} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default class GradientPickupButton extends Component {
  render() {
    const {label, _onPress} = this.props;
    return (
      <View style={styles.gradientBtnWrapper}>
        <TouchableOpacity onPress={_onPress} style={styles.gradientBtn}>
          <LinearGradient
            style={styles.gradientBtnBackground}
            colors={['#E8222B', '#141414']}>
            <Image
              source={require('../resources/images/driver/surface2.png')}
            />
            <Text style={styles.gradientBtnLabel}>{label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  gradientBtnWrapper: {
    alignItems: 'center',
    marginTop: 15,
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
    flexDirection: 'row'
  },
  gradientBtnLabel: {
    fontSize: 20,
    letterSpacing: 0,
    color: '#fff',
    marginLeft: 10
  },
});
