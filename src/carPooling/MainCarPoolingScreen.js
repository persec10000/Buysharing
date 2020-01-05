import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import GradientHeader from '../commons/GradientHeader';
import MapView, {Marker} from 'react-native-maps';
import LanguageManager from '../manager/LanguageManager';

const languageManager = LanguageManager.getInstance();

class MainCarPoolingScreen extends Component {
  static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      headerTitleStyle: {color: '#fff'},
      headerStyle: {
        backgroundColor: 'transparent',
      },
      header: props => <GradientHeader {...props} />,
      headerTitle: (
        <View style={styles.headerTitle}>
          <Image source={require('../resources/images/appName.png')} />
        </View>
      ),
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.toggleDrawer();
          }}
          style={styles.headerLeftBtn}>
          <Image source={require('../resources/images/menu.png')} />
        </TouchableOpacity>
      ),
    };
  };

  componentDidMount() {
    languageManager.addScreen(this);
  }

  componentWillUnmount() {
    languageManager.removeScreen(this);
  }

  handleLocalizationChange = () => {
    languageManager.setI18nConfig();
    this.forceUpdate();
  };

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={{flex: 1}}
          initialRegion={{
            latitude: 21.00992,
            longitude: 105.814728,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          // provider="google"
        >
          <Marker
            coordinate={{
              latitude: 21.00992,
              longitude: 105.814728,
            }}
            // image={<Image source={require('../resources/images/marker.png')}/>}
          >
            <View>
              <Image source={require('../resources/images/marker.png')} />
              <Image
                style={{
                  position: 'absolute',
                  width: 50,
                  height: 50,
                  borderRadius: 23,
                  top: 10,
                  right: 11,
                  left: 11,
                }}
                source={{
                  uri:
                    'https://scontent.fhan2-4.fna.fbcdn.net/v/t1.0-9/64685728_2210866278961289_9156587425705754624_o.jpg?_nc_cat=105&_nc_oc=AQlg0L9knkRrKy-dlTtnEY_H3Bh7QGOXhj9GuM5d-2957iRFpy9Rs1x6fWD0jd6JmFI&_nc_ht=scontent.fhan2-4.fna&oh=25a888b92f75c3d70fecfa6d924c8708&oe=5E20777D',
                }}
              />
            </View>
          </Marker>
        </MapView>
        <View style={styles.floatButtonContainer}>
          <View style={styles.floatButtonWrapper}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('Driver')}
              style={styles.floatButton}>
              <LinearGradient
                style={styles.floatButtonBackground}
                colors={['#E8222B', '#141414']}>
                <Text style={styles.floatButtonLabel}>
                  {languageManager.translateText('Driver')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.floatButtonWrapper}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('Passenger')}
              style={styles.floatButton}>
              <LinearGradient
                style={styles.floatButtonBackground}
                colors={['#E8222B', '#141414']}>
                <Text style={styles.floatButtonLabel}>
                  {languageManager.translateText('Passenger')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

export default MainCarPoolingScreen;
const styles = StyleSheet.create({
  headerTitle: {
    paddingBottom: 15,
  },
  headerLeftBtn: {
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },
  floatButtonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  floatButtonWrapper: {
    marginBottom: 10,
  },
  floatButton: {
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
  },
  floatButtonBackground: {
    width: 265,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatButtonLabel: {
    fontSize: 20,
    letterSpacing: 0,
    color: '#fff',
  },
});
