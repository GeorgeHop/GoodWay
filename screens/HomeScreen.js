import * as WebBrowser from 'expo-web-browser';
import React, {useState} from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, Dimensions, TextInput, Animated, Button } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { MonoText } from '../components/StyledText';
import MapView from "react-native-maps";
import * as Location from 'expo-location';
import SwipeUpDown from "react-native-swipe-up-down";

import SlidingUpPanel from "rn-sliding-up-panel";

let {width, height} = Dimensions.get('window');

export default class HomeScreen extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      bearerToken: 'eyJhbGciOiJSUzUxMiIsImN0eSI6IkpXVCIsImlzcyI6IkhFUkUiLCJhaWQiOiJIWW1mUlBzMG9kenRyeVduMEc0eSIsImlhdCI6MTU4NzgxNzY1NSwiZXhwIjoxNTg3OTA0MDU1LCJraWQiOiJqMSJ9.ZXlKaGJHY2lPaUprYVhJaUxDSmxibU1pT2lKQk1qVTJRMEpETFVoVE5URXlJbjAuLmNuSmxZMFU1QmIxelJhQWU1SjJSUkEuZ1RYQnpNSXFSYU5DWEl6akpTbUMyUkFrNkRVTWtsS2Zxc3BOLUlReWFsajhDS1p0UHVsLVpnOWlnQ3FCTW9BQWR4aXIyWE5fSEU1cHBwUk4xcjV5Qi1qc09XUnpLdjBEZGpJbVpfYkgzQmtPV3ZkckIxeEdvNHZxQ3d0SmZNVVkuZlRYV0VVU0VCTVhjSUZIeHZqc2dsakxwdUQ5QmVvVF9wSzBZR2dOOXpISQ.Dny9Xm11rSIUBFS0OJ9dCoIJC2JR3pH15caVhQElZ--7JoCOELdck6Ikn0__m482BTK4V5Y-0FoOtdFnXGwZ67FBg0kHXEYakg2uv3S7g6B2bcLK8HTaayrkoDgJrjmlZVBdZVg8nwIjgsZdFtSzYmOyFxVYlTOOayM1etuLxYIh0SYZMVwtp3st8G-Nyit_tmc485yWqSyyVLrQo9ClHSy8e9atO6Wmr8fEsHFSqbqwznGSloi30mAlfG68HPMwSfOWbqoOgc_GeWs4O464uv8f1SAjt5B6UFuWg0E_lP8PcrGoQAkS1E66757B-b3-wCMgixN0EhdzSmzKvm3Giw',
      location: null,
      loading: true,
      coords: [],
      boards:[],
      departures:[],
      place: {
        name: '',
      },
      transport:{
        time: '',
        transport: {
          category: '',
          name: '',
          headsign: '',
        },
      },
      region: {
        latitude: null,
        longitude: null,
        latitudeDelta: 0.8,
        longitudeDelta: 0.8
      }
    };
  }

  componentDidMount() {
    this.findCurrentLocation();
  }

  findCurrentLocation = () => {
      navigator.geolocation.getCurrentPosition(
          position => {
              const latitude = JSON.stringify(position.coords.latitude);
              const longitude = JSON.stringify(position.coords.longitude);

              if (latitude && longitude != null) {
                  this.setState({
                      region: {
                        latitude: Number(latitude),
                        longitude:  Number(longitude),
                        latitudeDelta: 0.04,
                        longitudeDelta: 0.04
                      }
                  },this.getRoutesForCurrentLocation);
              }
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 1000
          }
      );
  };

  getRoutesForCurrentLocation() {
      let {transports,departures} = this.state;
      let index;
      let url = `https://transit.hereapi.com/v8/departures?in=${this.state.region.latitude},${this.state.region.longitude};r=500`;
      fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.state.bearerToken,
          }
      }).then(res => res.json())
          .then((result) => {
            for (index = result.boards.length - 1; index >= 0; --index) {
              console.log(result.boards[index].departures);
              this.setState({
                departures: result.boards[index].departures,
              })
            }
          })
          .catch((error) => {
            console.log('Its notice about', error);
          });
  }

  static defaultProps = {
    draggableRange: { top: height, bottom: 450 }
  };

  _draggedValue = new Animated.Value(450);

  render() {
      let {loading, transports, departures} = this.state;
      const { top, bottom } = this.props.draggableRange;
      const backgoundOpacity = this._draggedValue.interpolate({
        inputRange: [height - 48, height],
        outputRange: [1, 0],
        extrapolate: "clamp"
      });
      let renderMapView;
      if (this.state.region.latitude && this.state.region.longitude != null) {
          renderMapView = (
              <MapView
                  width={width}
                  height={height} // navigation header offset
                  initialRegion={this.state.region}
                  showsUserLocation={this.onMapReady}
                  onRegionChangeComplete={this.onRegionChange}
                  edgePadding={{ top: 100, right: 100, bottom: 100, left: 100 }}
              >
                  <MapView.Marker
                      coordinate={{
                        "latitude": this.state.region.latitude,
                        "longitude": this.state.region.longitude,
                      }}
                      title={"Its Your Location"}
                      draggable
                  />
              </MapView>
          )
      }
      return (
          <View>
              {renderMapView}
              <SlidingUpPanel
                  ref={c => (this._panel = c)}
                  draggableRange={this.props.draggableRange}
                  animatedValue={this._draggedValue}
                  snappingPoints={[360]}
                  height={height + 450}
                  friction={4.5}
                  containerStyle={{
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                  }}
              >
                  <View style={styles.panel}>
                      <View>
                          <Animated.View>
                              <TextInput style={styles.searchBox} placeholder={'Search'} autoFocus={false} />
                          </Animated.View>
                      </View>
                      <View style={{backgroundColor: '#f8f9fa'}}>
                        <View style={{
                          flexWrap: 'wrap',
                          justifyContent: 'center',
                          backgroundColor: '#f8f9fa',
                          height: '30%',
                        }}>
                          <View style={{
                            flexWrap: 'wrap',
                            backgroundColor: '#f8f9fa',
                            marginLeft: 18,
                            marginTop: -15,
                            flexDirection: 'row',
                          }}>
                            {departures.map(function(listItem, index){
                              return (
                                <View key={index}>
                                  <TouchableOpacity style={styles.buttonTransportStyles}>
                                    <Text>{listItem.transport.name}</Text>
                                  </TouchableOpacity>
                                </View>
                              )
                            })}
                          </View>
                        </View>
                          <View style={{
                            flexWrap: 'wrap',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            backgroundColor: '#f8f9fa',
                            height: '50%',
                          }}>
                            <View style={{
                              width: '100%',
                              height: 60,
                              borderRadius: 25,
                              backgroundColor: '#bdc3c7',
                              padding: 2,
                              flexDirection: 'row',
                            }}>
                              <TouchableOpacity style={styles.buttonBarStyles}>
                                <Text>Home</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.buttonBarStyles}>
                                <Text>Work</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.buttonBarStyles}>
                                <Text>Best place</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.buttonBarStyles}>
                                <Text>Blabla</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                  onPress={() => this._panel.show(360)}
                                  style={styles.buttonBarStyles}>
                                <Text>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                      </View>
                  </View>
              </SlidingUpPanel>
              <SlidingUpPanel
                  ref={c => (this._panel = c)}
                  draggableRange={this.props.draggableRange}
                  animatedValue={this._draggedValue}
                  snappingPoints={[360]}
                  height={height + 180}
                  friction={0.5}
                  containerStyle={{
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                  }}
              >
                <View style={styles.panel}>
                  <Text>Blabla</Text>
                </View>
              </SlidingUpPanel>
          </View>
      );
  }

}

HomeScreen.navigationOptions = {
  header: null,
};

function DevelopmentModeNotice() {
  if (__DEV__) {
    const learnMoreButton = (
      <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
        Learn more
      </Text>
    );

    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled: your app will be slower but you can use useful development
        tools. {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        You are not in development mode: your app will run at full speed.
      </Text>
    );
  }
}

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/workflow/development-mode/');
}

function handleHelpPress() {
  WebBrowser.openBrowserAsync(
    'https://docs.expo.io/versions/latest/get-started/create-a-new-app/#making-your-first-change'
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center"
  },
  panel: {
    flex: 1,
    backgroundColor: "#2c3e50",
    position: "relative",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  textHeader: {
    fontSize: 28,
    color: "#FFF"
  },
  buttonBarStyles: {
    width: 55,
    height: 55,
    borderRadius: 30,
    alignItems: "center",
    padding: 10,
    marginLeft: 25,
    marginRight: 10,
    backgroundColor: '#2c3e50',
  },
  buttonTransportStyles: {
    width: 55,
    height: 35,
    borderRadius: 2,
    alignItems: "center",
    backgroundColor: '#d35400',
    margin: 10,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  searchBox: {
    backgroundColor: '#ecf0f1',
    marginTop: 5,
    marginHorizontal: 5,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 30,
    height: 40,
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});

