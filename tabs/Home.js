/**
 * JonssonConnect Home Page
 * Developed in part by Manu, Akshay, Vignesh, Ramya, & Jahnavi
 */

import React, { Component } from 'react';
import { Alert, ActivityIndicator, AsyncStorage, FlatList, ImageBackground, StyleSheet, View } from 'react-native';
import { Card, CardItem, Icon, Text, Body } from 'native-base';
import * as firebase from 'firebase';
import moment from "moment";

export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      refreshing: false,
      loadingFonts: true,
    };
  }

  async componentDidMount() {

    this.setState({
      userID: await AsyncStorage.getItem('userID'),
      firstName: await AsyncStorage.getItem('firstName'),
      lastName: await AsyncStorage.getItem('lastName'),
      userPhoto: await AsyncStorage.getItem('userPhoto'),
      headline: await AsyncStorage.getItem('headline'),
      location: await AsyncStorage.getItem('location'),
      industry: await AsyncStorage.getItem('industry'),
    });

    this.updateClassification()
    this._downloadNews();
  }

  updateClassification = () => {
    let userClassificationRef = firebase.database().ref("Users/" + this.state.userID + "/classification/");
    userClassificationRef.on('value', this.loadedClassification, this.handleError);
  }

  loadedClassification = (data) => {
    let studentClassification = data.val()

    if(studentClassification === null)
    {
      this.askUserClassification()
    }
  }

  handleError = (err) => {
    console.log(err);
  }

  askUserClassification = () => {
    Alert.alert(
        'I am a ...',
        'Please choose one of the options below. It will help us provide you with the most relevant news, events, & jobs!',
        [
          {text: 'Current Student', onPress: () => this.saveUser('student') },
          {text: 'Alumnus', onPress: () => this.saveUser('alumni') },
        ],
        { cancelable: false }
    )
  }

  saveUser = (classification) => {

    if (classification !== 'student' && classification !== 'alumni') {
      console.log("ERROR: Classification not recognized");
      return;
    }

    let firstName = this.state.firstName
    let lastName = this.state.lastName

    let userRef = firebase.database().ref('Users/' + this.state.userID + "/");

    userRef.update({
      classification: classification,
      userStatus: (classification === 'student') ? 'approved' : 'waiting',
      isAdmin: "false",
      numOfEvents: 0,
      points: 0,
      firstName: firstName,
      lastName: lastName
    }).catch(function (error) {
      console.log(error);
    });
  }

  _onRefresh() {
    this.setState({ refreshing: true });
    this._downloadNews(true);
  }

  _downloadNews(refresh) {
    fetch(firebase.database().ref('Articles') + ".json")
      .then((response) => {
        return response.json();
      }).then((responseJson) => {

        let dataArray = [];
        for(let article in responseJson) {
          dataArray.push([article, responseJson[article]]);
        }

        dataArray.sort(function(a, b) {
          let date1 = new Date(a[1].postedOn);
          let date2 = new Date(b[1].postedOn);
          return -1*(date1 - date2);
        });

        this.setState({
          isLoading: false,
          dataSource: dataArray,
        });

        if(refresh) {
          this.setState({
            refreshing: false
          });
        }

      })
      .catch((error) => {
        console.error(error);
        this.setState({
          isLoading: false,
          networkFailed: true,
        });
      });
  }

  _keyExtractor = (item, index) => item[0];

  _renderArticle = ({item}) => {

    let dateString = moment().format('  MMMM D, YYYY');

    return (
      <View style={{paddingBottom: 10, backgroundColor: '#FFFFFF'}}>
        <Text style={{ color: item[1].articleColor, fontSize: 10, fontWeight: '100', paddingLeft: 15, paddingRight: 10, paddingTop: 10, paddingBottom: 10}}>
          <Icon name='ios-pricetag' style={{ fontSize: 10, color: item[1].articleColor }} />  {item[1].articleType}
        </Text>
        <Text onPress={() => this.props.navigation.push("ArticleDetails", { item })} style={styles.nameStyle}>
          { item[1].articleName }
        </Text>
        <Text style={styles.dateStyle}>
          <Icon name='calendar' style={{ fontSize: 12, color: '#878787' }} />
          { dateString }
        </Text>
      </View>
    );
  };

  _renderHeader = () => {
    return (
      <View>
        <View style={styles.container2}>
          <ImageBackground
            style={styles.backdrop}
            blurRadius={0}
            source={require('../images/image2.jpg')}>
            <View style={styles.backdropView}></View>
          </ImageBackground>
        </View>
        <View style={{ backgroundColor: '#FFFFFF' }}>
          <Card>
            <CardItem bordered style={{ borderLeftColor: '#0039A6', borderLeftWidth: 2}}>
              <Body>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#C75B12' }}><Icon type='FontAwesome' name='newspaper-o' style={{ fontSize: 22, color: '#C75B12' }} /> {" "}Jonsson | News</Text>
              </Body>
            </CardItem>
          </Card>
        </View>
      </View>
    );
  };

  render() {

    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <FlatList
        keyExtractor={this._keyExtractor}
        data={this.state.dataSource}
        renderItem={this._renderArticle}
        ListHeaderComponent={this._renderHeader}
        onRefresh={this._onRefresh.bind(this)}
        refreshing={this.state.refreshing}
      />
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: '#FFFFFF',
  },
  container2: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: null,
    backgroundColor: '#FFFFFF'
  },
  backdrop: {
    width: null,
    height: 180
  },
  backdropView: {
    paddingTop: 10,
    width: 400,
    backgroundColor: 'rgba(0,0,0,0)',
    paddingLeft: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostStyle: {
    fontWeight: '800',
    fontSize: 14,
  },
  seperator: {
    fontWeight: '100',
    color: '#D3D3D3',
    paddingLeft: 10,
  },
  nameStyle: {
    fontSize: 16,
    fontWeight: '400',
    paddingTop: 5,
    paddingLeft: 15,
    paddingRight: 5,
  },
  dateStyle: {
    fontSize: 10,
    fontWeight: '100',
    paddingTop: 10,
    paddingLeft: 15,
    paddingRight: 5,
    color: '#878787',
  },
  bigHeader: {
    fontSize: 24,
    fontWeight: '800',
    paddingTop: 10,
    paddingLeft: 15,
  },
  colorHeader: {
    fontSize: 24,
    fontWeight: '800',
    paddingTop: 10,
    paddingLeft: 15,
    color: '#C75B12',
  },
  jonssonHeader: {
    fontSize: 24,
    fontWeight: '800',
    paddingBottom: 20,
    paddingLeft: 10,
  },
  eventDescriptionStyle: {
    fontSize: 10,
  },
  typeStyle: {
    fontSize: 14,
    fontWeight: '800',
    paddingTop: 10,
    paddingLeft: 15,
    paddingRight: 5,
    color: '#0085c2',
  },
  summaryStyle: {
    fontSize: 18,
    fontWeight: '800',
    paddingTop: 10,
    paddingLeft: 15,
    paddingRight: 5,
  },
  buttonStyle: {
    fontSize: 12,
  },
  search: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
  },
  searchbarColor: {
    backgroundColor: '#00A1DE',
  },
  searchButton: {
    fontSize: 12,
    color: '#ffffff',
  },
  textInput: {
    height: 30,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginBottom: 5,
    marginVertical: 5,
    marginHorizontal: 5,
  },
});
