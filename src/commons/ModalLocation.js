import React, {Component} from 'react';
import {StyleSheet, View, Text, Alert} from 'react-native';
import FormInput from './FormInput';
import GradientButton from './GradientButton';
import _ from 'lodash';

export default class ModalAddress extends Component {
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

  _accept = () => {
    const {place, street, city, country} = this.state;

    const {
      requiredAll,
      requiredPlace,
      requiredStreet,
      requiredCity,
      requiredCountry,
    } = this.props;

    if (requiredAll) {
      if (
        _.isEmpty(place) ||
        _.isEmpty(street) ||
        _.isEmpty(city) ||
        _.isEmpty(country)
      ) {
        Alert.alert(__APP_NAME__, 'All fields must be not empty');
        return;
      }

      const location = `${place.trim()}, ${street.trim()}, ${city.trim()}, ${country.trim()}`;
      this.props.onChangeLocation(location);
    } else {
      if (requiredPlace && _.isEmpty(place)) {
        Alert.alert(__APP_NAME__, 'Place field must be not empty');
        return;
      }

      if (requiredStreet && _.isEmpty(street)) {
        Alert.alert(__APP_NAME__, 'Street field must be not empty');
        return;
      }

      if (requiredCity && _.isEmpty(city)) {
        Alert.alert(__APP_NAME__, 'City field must be not empty');
        return;
      }

      if (requiredCountry && _.isEmpty(country)) {
        Alert.alert(__APP_NAME__, 'Country field must be not empty');
        return;
      }

      this.props.onChangeLocation(place, street, city, country);
    }
    this.props.closeModal();
  };

  render() {
    const {place, street, city, country} = this.state;

    const {title} = this.props;

    return (
      <View
        style={{
          paddingVertical: 15,
          paddingHorizontal: 20,
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
        <FormInput
          label="Place No"
          placeholder="Enter Place NO"
          value={place}
          onChangeText={this._onChangePlace}
        />
        <FormInput
          label="Street"
          placeholder="Enter Street Name"
          value={street}
          onChangeText={this._onChangeStreet}
        />
        <FormInput
          label="City"
          placeholder="Enter City Name"
          value={city}
          onChangeText={this._onChangeCity}
        />
        <FormInput
          label="Country"
          placeholder="Enter Country Name"
          value={country}
          onChangeText={this._onChangeCountry}
        />
        <GradientButton label="Accept" _onPress={this._accept} />
      </View>
    );
  }
}
