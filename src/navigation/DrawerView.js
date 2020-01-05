import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import {isIphoneX, getStatusBarHeight} from 'react-native-iphone-x-helper';
import SafeAreaView from 'react-native-safe-area-view';
import UserManager from '../manager/UserManager';
import FastImage from 'react-native-fast-image';

const MenuItem = props => {
  const {icon, label, noti, onPressMenu} = props;
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPressMenu}>
      {icon && <Image style={styles.menuIcon} source={icon} />}
      <Text style={styles.menuLabel}>{label}</Text>
      {noti && (
        <View style={styles.menuNotiContainer}>
          <Text style={styles.menuNoti}>{noti}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default class DrawerView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: UserManager.getInstance().getUser() || {},
    };
  }

  render() {
    const {user} = this.state;
    return (
      <View style={styles.container}>
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <FastImage
                style={{flex: 1}}
                resizeMode={FastImage.resizeMode.cover}
                source={
                  user.avatar
                    ? {uri: `data:image/gif;base64,${user.avatar}`}
                    : require('../resources/images/buyer/default-avatar.png')
                }
              />
            </View>
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{user.username}</Text>
              <Text style={styles.userPhone}>
                {/* +0 0000 00 00 000 */}
                {user.phone}
              </Text>
            </View>
          </View>
          <View style={styles.menuContainer}>
            <MenuItem
              icon={require('../resources/images/navigation/bell.png')}
              label="My Activities"
            />
            <MenuItem
              icon={require('../resources/images/navigation/mail.png')}
              label="News"
              noti={1}
            />
            <MenuItem
              icon={require('../resources/images/navigation/shopping-bag.png')}
              label="Shopping History"
            />
            <MenuItem
              icon={require('../resources/images/navigation/database.png')}
              label="Payment Options"
            />
            <MenuItem
              icon={require('../resources/images/navigation/settings.png')}
              label="Settings"
              onPressMenu={() => this.props.navigation.navigate('Settings')}
            />
            <MenuItem
              icon={require('../resources/images/navigation/profile.png')}
              label="Help"
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 42,
    paddingVertical: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E2E2',
  },
  userInfoContainer: {
    marginLeft: 18,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#707070',
    letterSpacing: 0,
  },
  userPhone: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  menuContainer: {
    marginTop: 13,
    paddingHorizontal: 42,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
  },
  menuIcon: {
    tintColor: '#CFCFD0',
  },
  menuLabel: {
    marginLeft: 15,
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0,
  },
  menuNotiContainer: {
    width: 19,
    height: 19,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8222B',
    marginLeft: 5,
  },
  menuNoti: {
    color: '#fff',
  },
});
