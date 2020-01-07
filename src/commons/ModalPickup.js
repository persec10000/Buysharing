import React, {Component} from 'react';
import {StyleSheet, View, Text, Alert} from 'react-native';
import FormInput from './FormInput';
import GradientButton from './GradientButton';
import GradientPickupButton from './GradientPickupButton';
import APIClient from '../utils/APIClient';
import _ from 'lodash';

export default class ModalPickup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      place: '',
      street: '',
      city: '',
      country: '',
    };
  }

  _onChangePlace = text => {
    this.setState({place: text});
  };

  _onChangeStreet = text => {
    this.setState({street: text});
  };

  _onChangeCity = text => {
    this.setState({city: text});
  };

  _onChangeCountry = text => {
    this.setState({country: text});
  };

  _accept = async() => {
    console.log("carpooling=====>",this.props.carpooling_id)
    const path = '/api/v1/carpooling/' + this.props.carpooling_id;
    const data = {
      accepted: 1
    };
    const {response, error} = await APIClient.getInstance().jsonPUT(path, data);
    console.log(response);
    this.props.closeModal();
  };

  _makeorder = () => {
    this.props._makeorder()
  }

  render() {
    return (
      <View
        style={{
          paddingVertical: 40,
          paddingHorizontal: 50,
          width: __SCREEN_WIDTH__ - 40,
        }}>
        <View
          style={{
            marginBottom: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{fontSize: 17, color: '#707070'}}>
            If you wait 5 minutes, maybe one of
            the drivers will be able to pick 
            you up for a lower price.
          </Text>
        </View>
        <GradientPickupButton label="Pick Up" _onPress={this._accept} />
        <GradientButton label="Make Order" _onPress={this._makeorder} />
      </View>
    );
  }
}
