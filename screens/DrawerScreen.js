/**
 * JonssonConnect DrawerScreen Page
 * Developed in part by Manu, Akshay, Vignesh, Ramya, & Jahnavi
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, Text, View, Linking, TouchableOpacity, ActivityIndicator, AsyncStorage, ImageBackground } from 'react-native';
import RF from 'react-native-responsive-fontsize';
import { Thumbnail, Icon } from 'native-base';
import { Permissions, Notifications } from 'expo';
import * as firebase from 'firebase';
import moment from "moment";

export default class DrawerScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isAdmin: false,
    }
  }

  async componentWillMount() {

    await Expo.Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
    });

    this.setState({
      firstName: await AsyncStorage.getItem('firstName'),
      lastName: await AsyncStorage.getItem('lastName'),
      userPhoto: await AsyncStorage.getItem('userPhoto'),
      headline: await AsyncStorage.getItem('headline'),
      location: await AsyncStorage.getItem('location'),
      industry: await AsyncStorage.getItem('industry'),
      userID: await AsyncStorage.getItem('userID')
    });

    this.setState( {
      isLoading: false
    })

    const { permissionStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalPermissionsStatus = permissionStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (permissionStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      finalPermissionsStatus = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    }

    // User has rejected notifications permission
    if (finalPermissionsStatus !== 'granted') {
      return;
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();

    let userID = await AsyncStorage.getItem('userID');
    let firstName = await AsyncStorage.getItem('firstName');
    let lastName = await AsyncStorage.getItem('lastName');

    let userRef = firebase.database().ref('Users/' + userID);
    userRef.update({
      notificationToken: token,
      firstName: firstName,
      lastName: lastName,
    }).catch(this.handleError(error));
  }

  checkIsAdmin = () => {
    let isAdminRef = firebase.database().ref("Users/" + this.state.userID + "/isAdmin/");
    isAdminRef.on('value', this.handleIsAdmin, this.handleError);
  }

  handleIsAdmin = (data) => {
    this.state.isAdmin = data.val()
  }

  handleError = (err) => {
    console.log(err);
  }

  /*
  *
  *  Navigation to other pages
  *
  */
  navigateToRewardsPage = () => {
    this.props.navigation.navigate("Rewards");
  }

  navigateToHelpPage = () => {
    this.props.navigation.navigate("Help");
  }

  navigateToQrcodePage = () => {
    let userID = this.state.userID;
    let isAdmin = this.state.isAdmin;
    this.props.navigation.navigate("Qrcode", {userID, isAdmin});
  }

  navigateToSettingsPage = () => {
    console.log('navigateToSettingsPage has been executed');
    this.props.navigation.navigate("Settings");
  }


  render() {

    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <ActivityIndicator />
        </View>
      );
    }

    let day = moment().format('dddd,');
    let monthPlusDate =  moment().format('MMMM D');

    let userImageUrl = this.state.userPhoto;
    let userPhotoSource = (userImageUrl == null || userImageUrl.toString() == '') ? require('../images/default_user_photo.png') : {uri: userImageUrl.toString()}; 

    return (
      <View>
        <ScrollView>
          <View>
              <View>
                <ImageBackground style={styles.backdrop} source={require('../images/image7.jpg')} blurRadius={1.5}>
                <View style={styles.photo} >
                  <Thumbnail large source={userPhotoSource} />
                </View>

                <View style={styles.userInfo}>
                  <Text style={{ textAlign: 'center', fontSize: RF(3), fontWeight: '700', color: '#FFFFFF' }} >{this.state.firstName.toString()} {this.state.lastName.toString()}</Text>
                  {/* <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF' }} >{this.state.lastName.toString()}</Text> */}
                </View>

                <View style={styles.industryInfo}>
                  <Text style={{ fontSize: 14, fontWeight: '300', color: '#FFFFFF' }} >
                  <Icon name='ios-pin' style={{ fontSize: 14, color: '#FFFFFF' }} />
                  {" "}{this.state.location.toString().replace(/{"name":"/g, '').replace(/"}/g, '')}
                  </Text>
                </View>

                <View style={styles.industryInfo}>
                  <Text style={{ fontSize: 14, fontWeight: '300', color: '#FFFFFF' }} >
                  <Icon name='ios-globe' style={{ fontSize: 14, color: '#FFFFFF' }} />
                  {" "}{this.state.industry.toString()}
                  </Text>
                </View>
                </ImageBackground>
              </View>
            <View style={styles.sidebarDay}>
              <Text style={styles.day}>
                {day}
              </Text>
            </View>
            <View style={styles.sidebarDate}>
            <Text style={styles.date}>
                {monthPlusDate}
              </Text>
            </View>

            <TouchableOpacity style={styles.sidebar} onPress={() => this.navigateToRewardsPage()}>
              <Icon type="FontAwesome" name='gift'  style={{color: '#c75b12'}} />
              <Text style={styles.settingsStyle}>
                Rewards
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebar} onPress={() => { Linking.openURL('https://giving.utdallas.edu/ECS') }}>
              <Icon type="FontAwesome" name='dollar' style={{color: '#c75b12'}} />
              <Text style={styles.settingsStyle}>
                Donate Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebar} onPress={() => this.navigateToHelpPage()}>
              <Icon type="FontAwesome" name='question'  style={{color: '#c75b12'}}/>
              <Text style={styles.settingsStyle}>
                Help & Feedback
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebar} onPress={() => this.navigateToQrcodePage()}>
              <Icon type="FontAwesome" name='qrcode'  style={{color: '#c75b12'}}/>
              <Text style={styles.settingsStyle}>
                Scan QR Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebar} onPress={() => this.navigateToSettingsPage()}>
              <Icon type='FontAwesome' name='cog' style={{color: '#c75b12'}}/>
              <Text style={styles.settingsStyle}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
}



DrawerScreen.propTypes = {
  navigation: PropTypes.object
};

const styles = {

  backdrop: {
    width: '100%',
    height: '100%',
    flex: 1,
  },

  sidebar: {

    padding: 14,
    paddingLeft: 20,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'

  },
  day: {
    fontWeight: 'bold',
    fontSize: 15,
    paddingTop: 20
  },
  date: {
    fontWeight: 'bold',
    fontSize: 20,
    paddingBottom: 10
  },
  logOut: {
    color: 'red',
    textAlign: 'auto',
    fontWeight: 'bold'
  },
  logOutText: {
    color: 'red',
    paddingLeft: 10,
    lineHeight: 25,
    textAlign: 'auto',
    fontWeight: 'bold',
    fontSize: 18
  },
  settingsStyle: {
    paddingLeft: 10,
    textAlign: 'auto',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sidebarDate: {
    paddingLeft: 25,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  sidebarDay: {
    paddingLeft: 25,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  backdropView: {
    paddingTop: 10,
    width: 200,
    backgroundColor: 'rgba(0,0,0,0)',
    paddingLeft: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    paddingBottom: 3,
  },
  userInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    paddingBottom: 5
  },
  industryInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  }
}
