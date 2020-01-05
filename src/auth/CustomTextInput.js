import React, { Component } from 'react'
import { 
    StyleSheet,
    View,
    TextInput,
    Image,
    Platform,
    Alert
} from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export default class CustomTextInput extends Component {
    render() {
        const { inputWrapperStyle, inputStyle, suffixIcon, onPressSuffixIcon } = this.props;
        return (
            <View style={[styles.textInputWrapper, inputWrapperStyle ]}>
                <TextInput 
                    style={[styles.textInput, inputStyle]}
                    {...this.props}
                />
                {suffixIcon && <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center'}}>
                    <TouchableWithoutFeedback onPress={onPressSuffixIcon}>
                        <Image 
                            source={require('../resources/images/calendar.png')}
                            tintColor="#707070"
                            style={{ marginRight: 10 }}
                            />
                    </TouchableWithoutFeedback>
                </View>}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    textInputWrapper: {
        borderWidth: 1,
        borderColor: '#707070',
        borderRadius: 15,
        marginHorizontal: 28,
        overflow: 'hidden'
    },
    textInput: {
        fontSize: 16,
        paddingHorizontal: 22,
        paddingVertical: 20,
        padding: Platform.select({
            android: 0
        }),
        color: '#000',
        fontWeight: '400',
        fontFamily: 'Raleway-Regular'
    },
})
