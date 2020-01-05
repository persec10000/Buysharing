import React, {Component} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import LocationManager from '../manager/LocationManager';
import Utils from '../utils/Utils';
import Icons from '../utils/Icons';
import FastImage from 'react-native-fast-image';
import _ from 'lodash';

const locationManager = LocationManager.getInstance();

export default class MapScreen extends Component {
  constructor(props) {
    super(props);
    this._locationManager = locationManager;
    const currentLocation = locationManager.getCurrentLocation();
    this.state = {
      region: currentLocation
        ? {
            latitude: currentLocation[0],
            longitude: currentLocation[1],
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }
        : {
            latitude: 21.0083019,
            longitude: 105.8182929,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          },
    };
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    if (
      _.isEqual(nextProps.supplierMarkers, this.props.supplierMarkers) &&
      _.isEqual(nextProps.tappedLocation, this.props.tappedLocation) &&
      _.isEqual(nextState, this.state)
    )
      return false;
    return true;
  };

  componentDidMount = async () => {
    this._locationManager.addListener(this._handleNewLocation);
    const currentLocation = await Utils.getLocation();
    if (currentLocation) {
      this._currentLocation = currentLocation;
      this.setState({
        currentLocation,
        region: {
          latitude: currentLocation[0],
          longitude: currentLocation[1],
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        },
      });
    }
  };

  componentWillUnmount() {
    this._locationManager.removeListener(this._handleNewLocation);
  }

  _handleNewLocation = ({location}) => {
    if (!location) {
      return;
    }
    this._currentLocation = location;
    this.setState({
      currentLocation: location,
    });
  };

  _moveToCurrentPosition = () => {
    const {currentLocation} = this.state;
    if (_.isEmpty(currentLocation)) return;
    this._mapView.animateToCoordinate({
      latitude: currentLocation[0],
      longitude: currentLocation[1],
    });
  };

  onRegionChange = region => {
    this.setState({region});
  };

  onRegionChangeComplete = region => {
    console.log(region);
    this.setState({region});
  };

  render() {
    const {region, currentLocation} = this.state;

    const {
      mapViewProps,
      supplierMarkers,
      buyerMarkers,
      tappedLocation,
    } = this.props;

    return (
      <View style={{flex: 1}}>
        <MapView
          style={{flex: 1}}
          ref={ref => (this._mapView = ref)}
          zoomControlEnabled={true}
          loadingEnabled={true}
          // initialRegion={{
          //     latitude: 21.0083019,
          //     longitude: 105.8182929,
          //     latitudeDelta: 0.01,
          //     longitudeDelta: 0.01
          // }}
          // onRegionChange={this.onRegionChange}
          onRegionChangeComplete={this.onRegionChangeComplete}
          rotateEnabled={false}
          showsUserLocation={true}
          {...{region}}
          {...mapViewProps}
          // provider="google"
        >
          {tappedLocation && (
            <Marker
              coordinate={{
                latitude: tappedLocation.latitude,
                longitude: tappedLocation.longitude,
              }}
              onPress={() => {
                this._mapView.animateToCoordinate({
                  latitude: tappedLocation.latitude,
                  longitude: tappedLocation.longitude,
                });
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
                  source={require('../resources/images/buyer/default-avatar.png')}
                />
              </View>
            </Marker>
          )}
          {supplierMarkers &&
            supplierMarkers.map((item, index) => {
              return (
                <Marker
                  coordinate={{
                    latitude: item.buying_geo_lat,
                    longitude: item.buying_geo_long,
                  }}
                  key={index}>
                  <View style={{alignItems: 'center'}}>
                    <FastImage
                      style={{width: 55, height: 55, borderRadius: 28}}
                      source={
                        item.avatar
                          ? {uri: `data:image/gif;base64,${item.avatar}`}
                          : require('../resources/images/buyer/default-avatar.png')
                      }
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '500',
                        color: '#6A6A6A',
                        paddingVertical: 2,
                      }}>
                      {item.username || 'Unknow'}
                    </Text>
                    <Image
                      source={require('../resources/images/buyer/supplier.png')}
                    />
                  </View>
                </Marker>
              );
            })}
          {buyerMarkers &&
            buyerMarkers.map((item, index) => {
              return (
                <Marker
                  coordinate={{
                    latitude: item.buying_geo_lat,
                    longitude: item.buying_geo_long,
                  }}
                  key={index}>
                  <View style={{alignItems: 'center'}}>
                    <FastImage
                      style={{width: 55, height: 55, borderRadius: 28}}
                      source={
                        item.avatar
                          ? {uri: `data:image/gif;base64,${item.avatar}`}
                          : require('../resources/images/buyer/default-avatar.png')
                      }
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '500',
                        color: '#6A6A6A',
                        paddingVertical: 2,
                      }}>
                      {item.username || 'Unknow'}
                    </Text>
                    <Image
                      source={require('../resources/images/supplier/buyer.png')}
                    />
                  </View>
                </Marker>
              );
            })}
        </MapView>
        <TouchableOpacity
          onPress={this._moveToCurrentPosition}
          style={[styles.myLocationButton, styles.shadowStyle]}>
          <Icons.MaterialIcons name="gps-fixed" color="#000" size={20} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  myLocationButton: {
    width: 40,
    height: 40,
    position: 'absolute',
    backgroundColor: '#fff',
    bottom: 10,
    right: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowStyle: {
    shadowColor: '#1C191966',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 12,
  },
});
