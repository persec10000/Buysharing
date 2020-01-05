import React, { Component } from 'react'
import { 
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CustomTextInput from './CustomTextInput'
import APIClient from '../utils/APIClient'
import _ from 'lodash'
import UserManager from '../manager/UserManager'

const userManager = UserManager.getInstance()

class LoginScreen extends Component {
    static navigationOptions = ({ navigation, screenProps }) => {
        return {
            header: null
        }
    };

    constructor(props) {
        super(props)
    
        this.state = {
            email: '',
            password: '',
            isLoggingIn: false
        }
    }
    
    componentDidMount() {
        this.mounted = true
    }
    
    componentWillUnmount() {
        this.mounted = false
    }

    _login = async () => {
        // this.props.navigation.navigate('App')
        // return 
        const { email, password } = this.state;
        if(_.isEmpty(email) || _.isEmpty(password)) {
            Alert.alert(__APP_NAME__, 'The email and password fields are empty!');
            return;
        }
        this.setState({ isLoggingIn: true })
        const path = '/api/v1/auth/login'
        const data = {
            email, password
        } 
        const { response, error } = await APIClient.getInstance().jsonPOST(path, data)
        console.log(response)
        if(response && response.user_id) {
            await userManager.updateUser(response)
            userManager._getUserStatus()
            // this._getInfo(response.data.Authorization)
            this.props.navigation.navigate('App')
        }
        else{
            Alert.alert(__APP_NAME__, 'Login failed');
        }
        if(this.mounted) this.setState({ isLoggingIn: false })
    }

    _getInfo = async (authorization) => {
        const path = '/api/v1/auth/info'
        const { response, error } = await APIClient.getInstance().jwtGET(path, authorization)
        console.log('get info', response)
    }

    _register = () => {
        this.props.navigation.navigate('Register')
    }

    _onChangeEmail = (text) => {
        this.setState({ email: text })
    }

    _onChangePassword = (text) => {
        this.setState({ password: text })
    }

    render() {
        const {
            email,
            password,
            isLoggingIn
        } = this.state;
        return (
            <KeyboardAwareScrollView 
                style={styles.container}>
                <Image 
                    source={require('../resources/images/appLogo.png')} 
                    style={styles.appLogo}/>
                <View style={styles.mainLoginContainer}>
                    <CustomTextInput 
                        inputWrapperStyle={{
                            marginBottom: 17
                        }}
                        value={email}
                        placeholder="Email or Mobile Number"
                        placeholderTextColor="#707070"
                        onChangeText={this._onChangeEmail}
                    />
                    <CustomTextInput 
                        inputWrapperStyle={{
                            marginBottom: 17
                        }}
                        value={password}
                        placeholder="Password"
                        placeholderTextColor="#707070"
                        secureTextEntry={true}
                        onChangeText={this._onChangePassword}
                    />
                    <View style={styles.forgotPasswordContainer}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </View>
                    <View style={styles.actionContainer}>
                        {isLoggingIn 
                            ?
                            <View style={styles.loginBtn}>
                                <LinearGradient colors={['#E8222B', '#141414']} style={styles.loginBtnBackground}>
                                    <ActivityIndicator color='#fff'/>
                                </LinearGradient>
                            </View>
                            :
                            <TouchableOpacity style={styles.loginBtn} onPress={this._login}>
                                <LinearGradient colors={['#E8222B', '#141414']} style={styles.loginBtnBackground}>
                                    <Text style={styles.loginText}>Login</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        }
                        <TouchableOpacity style={styles.createAccountBtn} onPress={this._register}>
                            <Text style={styles.createAccountText}>Create an account</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.signInWith}>
                        <Text style={styles.signInWithText}>Sign in with</Text>
                        <View style={styles.signInOptionContainer}>
                            <TouchableWithoutFeedback>
                                <Image 
                                    source={require('../resources/images/facebook.png')} 
                                    style={styles.signInOption}/>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback>
                                <Image 
                                    source={require('../resources/images/instagram.png')} 
                                    style={styles.signInOption}/>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback>
                                <Image 
                                    source={require('../resources/images/google-plus.png')} 
                                    style={styles.signInOption}/>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    appLogo: {
        alignSelf: 'center',
        marginTop: 140,
        marginBottom: 50
    },
    mainLoginContainer: {
        flex: 1
    },
    forgotPasswordContainer: {
        paddingHorizontal: 110,
        alignItems: 'center'
    },
    forgotPasswordText: {
        fontSize: 16,
        letterSpacing: 0,
        color: '#707070',
        textDecorationLine: 'underline'
    },
    actionContainer: {
        marginTop: 32,
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
    createAccountBtn: {
        marginTop: 10,
        width: 265,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#888888',
    },
    createAccountText: {
        color: '#fff',
        fontSize: 20,
        letterSpacing: 0
    },
    signInWith: {
        alignItems: 'center',
        marginTop: 38
    },
    signInWithText: {
        color: '#707070',
        fontSize: 16
    },
    signInOptionContainer: {
        marginVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    signInOption: {
        marginHorizontal: 2.5
    }
})

export default LoginScreen