import React, {Component} from 'react';
import {StyleSheet, View, Text, TextInput, Image} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import _ from 'lodash';

export default class FormInteractField extends Component {
  render() {
    const {
      label,
      value,
      placeholder,
      iconSuffix,
      onPressTouchableWithoutFeedback,
    } = this.props;
    return (
      <TouchableWithoutFeedback
        onPress={onPressTouchableWithoutFeedback}
        style={styles.formInput}>
        {label && <Text style={styles.inputLabel}>{label}:</Text>}
        {!value || (value && _.isEmpty(value.trim())) ? (
          <Text numberOfLines={1} style={[styles.inputField, {color: '#bbb'}]}>
            {placeholder}
          </Text>
        ) : (
          <Text numberOfLines={1} style={styles.inputField}>
            {value}
          </Text>
        )}
        {iconSuffix ? (
          <Image source={iconSuffix} />
        ) : (
          <Image source={require('../resources/images/settings/edit.png')} />
        )}
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  formInput: {
    // height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 9,
    borderColor: '#C2C2C2',
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 10,
  },
  inputLabel: {
    width: 67,
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
