import React, {Component} from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import _ from 'lodash';

const OPTIONS = [
  {
    label: 'Option 1',
  },
  {
    label: 'Option 2',
  },
  {
    label: 'Option 3',
  },
  {
    label: 'Option 4',
  },
  {
    label: 'Option 5',
  },
];

export default class BottomSheet extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  open = () => {
    this.RBSheet.open();
  };

  close = () => {
    this.RBSheet.close();
  };

  render() {
    const {title, options, onChooseOption} = this.props;

    return (
      <RBSheet
        ref={refs => (this.RBSheet = refs)}
        height={!_.isEmpty(options) ? options.length * 40 + 100 : 100}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose an option</Text>
          </View>
          <View>
            {!_.isEmpty(options) &&
              options.map((item, index) => (
                <TouchableOpacity
                  onPress={() => onChooseOption(item.value)}
                  key={index}
                  style={styles.optionItem}>
                  <Text style={{fontSize: 16, fontWeight: '400'}}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </RBSheet>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
});
