import React, {Component} from 'react';
import {StyleSheet, View, Text, Alert} from 'react-native';
import FormInput from './FormInput';
import GradientButton from './GradientButton';
import _ from 'lodash';

export default class ModalLeaveComment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: '',
    };
  }

  _onChangeComment = text => {
    this.setState({
      comment: text,
    });
  };

  _accept = () => {
    const {comment} = this.state;

    if (_.isEmpty(comment)) {
      Alert.alert(__APP_NAME__, 'Comment field must be not empty');
      return;
    }
  };

  render() {
    const {comment} = this.state;
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
            Delivery From
          </Text>
        </View>
        <FormInput
          label="Comment"
          placeholder="Lorem ipsum...."
          value={comment}
          onChangeText={this._onChangeComment}
        />
        <GradientButton label="Accept" _onPress={this._accept} />
      </View>
    );
  }
}
