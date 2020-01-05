import React, {Component} from 'react';
import {StyleSheet, View, ActivityIndicator} from 'react-native';

export default class AbsoluteLoadingScreen extends Component {
  render() {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 13,
  },
});
