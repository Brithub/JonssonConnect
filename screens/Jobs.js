/**
 * JonssonConnect Jobs Page
 * Developed in part by Manu, Akshay, Vignesh, Ramya, & Jahnavi
 */
import React, { Component } from 'react';
import { ActivityIndicator, Image, ListView, StyleSheet, View, Linking, RefreshControl, ImageBackground, TouchableOpacity } from 'react-native';
import { Container, Content, Card, CardItem, Icon, Text, Body } from 'native-base';

import * as firebase from 'firebase';
import firebaseApp from './JobsDetails';
import config from './JobsDetails';

export default class Jobs extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      isLoading: true,
      refreshing: false,
    }
  }

  componentDidMount() {
   return fetch('https://jonssonconnect.firebaseio.com/Jobs.json')
     .then((response) => response.json())
     .then((responseJson) => {
       let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
       this.setState({
         isLoading: false,
         dataSource: ds.cloneWithRows(responseJson),
         data: responseJson.Jobs,
       });
     })
     .catch((error) => {
       console.error(error);
     });
  }

   _onRefresh() {
     this.setState({refreshing: true});
     return fetch('https://jonssonconnect.firebaseio.com/Jobs.json')
      .then((response) => response.json())
      .then((responseJson) => {
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({
          isLoading: false,
          dataSource: ds.cloneWithRows(responseJson),
          refreshing: false,
        }, function() {
          });
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
          networkFailed: true,
        })
      });
   }

  _renderJobListing = (rowData) => {
    return (
      <TouchableOpacity onPress={() => this.props.navigation.navigate("JobsDetails", { rowData })} >
        <View style={styles.jobListingContainer}>
          <View>
            <Image source={{ uri: rowData.companyImageURL }} defaultSource={require('../images/default_job_icon.png')} style={styles.jobImage}/>
          </View>
          <View style={styles.jobInfoContainer}>
            <Text style={styles.jobTitle}>{rowData.positionTitle}</Text>
            <Text style={styles.jobCompany}>@ {rowData.companyName}</Text>
            <Text style={styles.jobLocation}>
              <Icon name='ios-pin' style={styles.jobPinIcon} /> {rowData.jobLocation}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <Container style={styles.containerStyle}>
       <Content
         refreshControl={
           <RefreshControl
             refreshing={this.state.refreshing}
             onRefresh={this._onRefresh.bind(this)}
           />
         }
       >
       <View style={styles.container2}>
         <ImageBackground
           style={styles.backdrop}
           blurRadius={0}
           source={require('../images/image1.jpg')}>
             <View style={styles.backdropView}>
             {/* <Text style={{ fontSize: 35, fontWeight: 'bold', paddingBottom: 5, paddingTop: 15, color: '#000000'}}>Jonsson|<Text style={{ fontSize: 35, fontWeight: 'bold', paddingBottom: 5, paddingTop: 15, color: '#c75b12'}}>Careers</Text></Text> */}
             </View>
         </ImageBackground>
       </View>
         <Content>
         <Card>
           <CardItem>
             <Body>
               <Text style={{ color: '#c75b12', fontSize: 22, fontWeight: '800'}}><Icon name='md-trending-up' style={{ fontSize: 22, color: '#c75b12'}}/> {" "}Jonsson | Careers</Text>
             </Body>
           </CardItem>
         </Card>
         </Content>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this._renderJobListing}
          />
          <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center'}} onPress={ ()=>{ Linking.openURL('https://utdallas.joinhandshake.com/login')}}>
          <Text style={{fontSize: 15, textAlign: 'center'}} >Click here to find more opportunities!
            
          </Text>
          <Image
            style={{ height: 75, width: '70%', position: 'relative', resizeMode: 'contain' }}
            source={require('../images/handshake_logo_dark.png')}
          />
          </TouchableOpacity>
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container2: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: null,
    backgroundColor: '#FFFFFF'
  },
  backdrop: {
    width: null,
    height: 180,
  },
  backdropView: {
    paddingTop: 20,
    width: 400,
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listStyle: {
    backgroundColor: '#FFFFFF',
  },
  bigHeader: {
    fontSize: 18,
    fontWeight: '800',
    paddingTop: 10,
    paddingLeft: 15,
  },
  colorHeader: {
    fontSize: 18,
    fontWeight: '800',
    paddingTop: 10,
    paddingLeft: 15,
    color: '#008542',
  },
  containerStyle: {
    backgroundColor: '#FFFFFF',
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
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 1,
  },
  searchbarColor: {
    backgroundColor: '#0039A6',
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
  companyNameStyle: {
    fontWeight: '100',
    fontSize: 12,
    paddingTop: 3,
  },
  positionTitleStyle: {
    fontWeight: '500',
    fontSize: 14,
  },
  jobLocationStyle: {
    fontSize: 12,
    color: '#808080',
    paddingTop: 3,
    fontWeight: '100'
  },
  jobListingContainer: {
    paddingBottom: 10, 
    backgroundColor: '#FFFFFF', 
    flexDirection: 'row'
  },
  jobImage: {
    height: 80, 
    width: 80, 
    marginLeft: 5, 
    borderRadius: 3
  },
  jobInfoContainer: {
    height: 80, 
    flex: 1
  },
  jobTitle: {
    flex: 3,
    fontSize: 16,
    fontWeight: '400',

    paddingTop: 5,
    paddingLeft: 15,
    paddingRight: 5,
  },
  jobCompany: {
    flex: 2,
    fontSize: 12, 
    fontWeight: '200',

    paddingLeft: 15,
  },
  jobPinIcon: {
    fontSize: 10,
    color: '#878787'
  },
  jobLocation: {
    flex: 2,
    fontSize: 12,
    fontWeight: '200',
    
    paddingLeft: 15,
  },
});
