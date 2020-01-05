import React, {Component} from 'react';
import {StyleSheet, View, Text, TextInput, Image} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

export default class FormInput extends Component {
  render() {
    const {
      label,
      labelStyle,
      value,
      onPressTouchableWithoutFeedback,
    } = this.props;
    return (
      <TouchableWithoutFeedback
        onPress={onPressTouchableWithoutFeedback}
        style={styles.formInput}>
        <Text style={[styles.inputLabel, labelStyle]}>{label}:</Text>
        <TextInput style={styles.inputField} value={value} {...this.props} />
        <Image source={require('../resources/images/settings/edit.png')} />
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  formInput: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 9,
    paddingBottom: 9,
    borderColor: '#C2C2C2',
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 10,
  },
  inputLabel: {
    width: 77,
    fontSize: 16,
    fontWeight: '700',
    color: '#707070',
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#707070',
    padding: 0,
  },
});
