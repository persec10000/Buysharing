import React, { Component } from 'react'
import { 
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    ImageBackground,
    Alert
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import CustomTextInput from './CustomTextInput'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import DatePicker from 'react-native-datepicker'
import moment from 'moment'
import APIClient from '../utils/APIClient'
import _ from 'lodash'
import UserManager from '../manager/UserManager'

const userManager = UserManager.getInstance()

export default class RegisterScreen extends Component {
    static navigationOptions = ({ navigation, screenProps }) => {
        return {
            header: null
        }
    };
    
    constructor(props) {
        super(props)
    
        this.state = {
            isChecked: false,
            name: '',
            phone: '',
            birthday: moment(),
            address: '',
            email: '',
            password: '',
            passwordConfirm: ''
        }
    }
    
    _onPressTerm = () => {
        this.setState(prevState => ({
            ...prevState,
            isChecked: !prevState.isChecked
        }))
    }

    _onChangeName = (text) => {
        this.setState({ name: text })
    }

    _onChangePhone = (text) => {
        this.setState({ phone: text })
    }

    _onChangeAddress = (text) => {
        this.setState({ address: text })
    }

    _onChangeEmail = (text) => {
        this.setState({ email: text })
    }

    _onChangePassword = (text) => {
        this.setState({ password: text })
    }

    _onChangePasswordConfirm = (text) => {
        this.setState({ passwordConfirm: text })
    }

    _onChangeBirthday = (value) => {
        const birthday = moment(value, 'DD/MM/YYYY')
        this.setState({ birthday })
    }

    _register = async () => {
        const { 
            isChecked,
            name,
            phone,
            birthday,
            address,
            email,
            password,
            passwordConfirm
        } = this.state;

        if(!isChecked) {
            Alert.alert(__APP_NAME__, 'You must accept Terms & Conditions first');
            return
        }

        if(_.isEmpty(name) 
            || _.isEmpty(phone)
            || _.isEmpty(email)
            || _.isEmpty(password)
            || _.isEmpty(passwordConfirm)) {
                Alert.alert(__APP_NAME__, 'All fields must be not empty');
                return
            }
        
        if(password !== passwordConfirm) {
            Alert.alert(__APP_NAME__, 'Password confirm doesn\'t match');
            return
        }

        const path = '/api/v1/user'
        const data = {
            name,
            phone,
            email,
            password,
            address,
            username: email,
            birthday: birthday.format()
        }

        const { response, error } = await APIClient.getInstance().jsonPOST(path, data)
        console.log(response)
        if(response && response.status && response.code === 200 && !_.isEmpty(response.data)) {
            Alert.alert(__APP_NAME__, response.message);
            userManager.updateUser(response.data)
            this.props.navigation.navigate('App')
        }
        else {
            Alert.alert(__APP_NAME__, 'Create user failed');
        }
    }

    render() {
        const { 
            isChecked,
            name,
            phone,
            birthday,
            address,
            email,
            password,
            passwordConfirm
        } = this.state;
        return (
            <KeyboardAwareScrollView style={styles.container}>
                <View style={styles.appLogoContainer}>
                    <Image
                        source={require('../resources/images/smallLogo.png')}
                        />
                </View>
                <View style={styles.registerForm}>
                    <Text style={styles.registerLabel}>Create Account</Text>
                    <CustomTextInput 
                        placeholder="Name"
                        placeholderTextColor="#707070"
                        inputWrapperStyle={{
                            marginBottom: 17
                        }}
                        value={name}
                        onChangeText={this._onChangeName}
                    />
                    <CustomTextInput 
                        placeholder="Mobile number"
                        placeholderTextColor="#707070"
                        inputWrapperStyle={{
                            marginBottom: 17
                        }}
                        value={phone}
                        onChangeText={this._onChangePhone}
                    />
                    <CustomTextInput 
                        placeholder="Address"
                        placeholderTextColor="#707070"
                        inputWrapperStyle={{
                            marginBottom: 17
                        }}
                        value={address}
                        onChangeText={this._onChangeAddress}
                    />
                    <CustomTextInput 
                        placeholder="Email"
                        placeholderTextColor="#707070"
                        inputWrapperStyle={{
                            marginBottom: 17
                        }}
                        value={email}
                        onChangeText={this._onChangeEmail}
                    />
                    <CustomTextInput 
                        placeholder="Age"
                        placeholderTextColor="#707070"
                        inputWrapperStyle={{
                            marginBottom: 17
                        }}
                        editable={false}
                        suffixIcon={true}
                        onPressSuffixIcon={() => { this.datePicker.onPressDate()}}
                        value={birthday && birthday.format('DD/MM/YYYY')}
                    />
                    <CustomTextInput 
                        placeholder="Password"
                        placeholderTextColor="#707070"
                        secureTextEntry={true}
                        inputWrapperStyle={{
                            marginBottom: 17
                        }}
                        value={password}
                        onChangeText={this._onChangePassword}
                    />
                    <CustomTextInput 
                        placeholder="Password confirm"
                        placeholderTextColor="#707070"
                        secureTextEntry={true}
                        inputWrapperStyle={{
                            marginBottom: 17
                        }}
                        value={passwordConfirm}
                        onChangeText={this._onChangePasswordConfirm}
                    />
                    <View style={styles.termsContainer}>
                        <TouchableWithoutFeedback onPress={this._onPressTerm}>
                            <ImageBackground 
                                source={require('../resources/images/checkbox-uncheck.png')}
                                style={{ width: 30, height: 30, marginRight: 10, alignItems: 'center', justifyContent: 'center' }}
                            >
                                {isChecked && <View style={styles.checkedDot}/>}
                            </ImageBackground>
                        </TouchableWithoutFeedback>
                        <Text style={styles.termText}>
                            I agree with the 
                        </Text>
                        <Text style={[styles.termText, { textDecorationLine: 'underline', marginLeft: 4 }]}>
                            Terms & Conditions
                        </Text>
                    </View>
                    <View style={styles.actionContainer}>
                        <TouchableOpacity 
                            style={styles.loginBtn} 
                            onPress={this._register}
                            >
                            <LinearGradient colors={['#E8222B', '#141414']} style={styles.loginBtnBackground}>
                                <Text style={styles.loginText}>Register</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
                <DatePicker
                    style={{width: 0, height: 0}}
                    ref={refs => this.datePicker = refs}
                    androidMode="spinner"
                    showIcon={false}
                    mode="date"
                    placeholder="Ngày sinh ..."
                    format="DD/MM/YYYY"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    onDateChange={this._onChangeBirthday}
                    customStyles={{
                        dateInput: {
                            borderWidth: 0,
                            height: 0
                        },
                        btnTextConfirm: {
                            color: '#AC040C',
                            fontSize: 20,
                        },
                        btnTextCancel: {
                            color: '#707070',
                            fontSize: 20,
                        },
                    }}
                />
            </KeyboardAwareScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    appLogoContainer: {
        marginTop: 50,
        alignItems: 'center',
    },
    registerForm: {

    },
    registerLabel: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#707070',
        marginVertical: 15,
        alignSelf: 'center'
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkedDot: {
        width: 19, 
        height: 19, 
        backgroundColor: '#E8222B', 
        borderRadius: 10
    },
    termText: {
        fontSize: 12,
        letterSpacing: 0,
        color: '#707070'
    },
    actionContainer: {
        marginVertical: 32,
        alignItems: 'center'
    },
    loginBtn: {
        width: 265,
        height: 60,
    },
    loginBtnBackground: {
        flex: 1,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginText: {
        fontSize: 20,
        color: '#fff',
        letterSpacing: 0
    },
})
