import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Route, Text,TextInput, View } from 'react-native';
import { Appbar, BottomNavigation, IconButton } from 'react-native-paper';
import * as Location from 'expo-location';
import { CurrentWeather, ForecastData, ForecastListItem } from './weatherDataTypes';

const App : React.FC = () : React.ReactElement => {

  const FrontRoute = () =>
    <>
      <Appbar.Header style={{backgroundColor: "#dff4ff"}}>
        <Appbar.Content title="Weather" />
        <IconButton 
          icon="refresh"
        />
      </Appbar.Header>

      <View style={styles.container}>
        <IconButton 
          icon="cellphone-marker"
          size={100}
        />
        <Text style={{fontSize: 20, margin: 10}}>
          Allow GPS for weather in your area.
        </Text>
      </View>

    </>  
  ;

  const SearchRoute = () =>
    <>
      <Appbar.Header style={{backgroundColor: "#dff4ff"}}>
        <Appbar.Content title="Search" />
        <View>
          <TextInput
            placeholder="Search..."
            style={styles.textInput}
          />
        </View>
      </Appbar.Header>

      <View style={styles.container}>
        <IconButton 
          icon="weather-cloudy"
          size={100}
        />
        <Text style={{fontSize: 20, margin: 10}}>
          Search weather by city name.
        </Text>
      </View>
    </>
  ;

  const [index, setIndex] = useState<number>(0);
  const [routes] = useState<Route[0]>([
    { key: 'frontpage', title: 'FrontPage', focusedIcon: 'weather-partly-cloudy', unfocusedIcon: 'weather-cloudy' },
    { key: 'search', title: 'Search', focusedIcon: 'cloud-search', unfocusedIcon: 'cloud-search-outline'}
  ]);
  const renderScene =  BottomNavigation.SceneMap({
    frontpage: FrontRoute,
    search: SearchRoute
  });
  
  return (
    <>
      <BottomNavigation
        navigationState={{ index , routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    width: 255,
    marginRight: 20,
    borderColor: "dark-gray",
    borderWidth: 1,
    padding: 5
  }
});

export default App;