import React, {Component} from 'react';
import {StyleSheet, View, Text, Alert,TouchableOpacity,Image} from 'react-native';
import FormInput from './FormInput';
import GradientButton from './GradientButton';
import _ from 'lodash';

export default class ModalLanguage extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }
  
  English = () => {
    this.props.English();
    this.props.closeModal();
  };

  Germany = () => {
    this.props.Germany();
    this.props.closeModal();
  };

  render() {
    const {title} = this.props;

    return (
      <View
        style={{
          paddingVertical: 15,
          paddingHorizontal: 10,
          width: __SCREEN_WIDTH__ - 40,
        }}>
        <View
          style={{
            marginBottom: 15,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{fontSize: 17, fontWeight: '700', color: '#707070'}}>
            {title}
          </Text>
        </View>
        <View
          style={{
            borderBottomColor: 'black',
            borderBottomWidth: 1,
          }}
        />
        <TouchableOpacity
          onPress={this.English}
          style={styles.settingInteractArea}>
          <View style={styles.interactContent}>
            <Image
              style={styles.interactImage}
              source={require('../resources/images/settings/america-flag.png')}
            />
            <Text style={styles.interactLabel}>English</Text>
          </View>
        </TouchableOpacity>
        <View
          style={{
            width:'100%',
            borderBottomColor: 'black',
            borderBottomWidth: 1,
          }}
        />
        <TouchableOpacity
          onPress={this.Germany}
          style={styles.settingInteractArea}>
          <View style={styles.interactContent}>
            <Image
                style={styles.interactImage}
                source={require('../resources/images/settings/america-flag.png')}
            />
            <Text style={styles.interactLabel}>Germany</Text>
          </View>
        </TouchableOpacity>
        <View
          style={{
            borderBottomColor: 'black',
            borderBottomWidth: 1,
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  settingInteractArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 60,
    paddingHorizontal: 22,
  },
  interactContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  interactImage: {
      marginRight: 30,
  },
  interactLabel: {
      fontSize: 16,
      color: '#707070'
  },
}) 