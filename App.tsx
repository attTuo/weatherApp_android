import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, ScrollView, Route, Text,TextInput, View } from 'react-native';
import { Appbar, Avatar, BottomNavigation, Card, IconButton } from 'react-native-paper';
import * as Location from 'expo-location';
import { weatherData, ForecastData, ForecastListItem } from './weatherDataTypes';
import { LocationGeocodedAddress, LocationObject, LocationPermissionResponse } from 'expo-location';
import { format } from "date-fns";

const App : React.FC = () : React.ReactElement => {

  const [location, setLocation] = useState<LocationObject>();
  const degreeSymbol : string = ` \xB0C`;
  const apiKey : string = "";

  useEffect(() => {

    ( async () => {

      let { status } : LocationPermissionResponse = await Location.requestForegroundPermissionsAsync();

      let gpsLocation : LocationObject = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Highest});
      setLocation(gpsLocation);

      await coordsToPlace(gpsLocation);
      await apiFetch();
    })();
  }, []);

  // Getting location information from coordinates
  const [locationData, setLocationData] = useState<LocationGeocodedAddress>();
  const [myLocation, setMyLocation] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const coordsToPlace = async (location : LocationObject) : Promise<void> => {

    let data : LocationGeocodedAddress[] = await Location.reverseGeocodeAsync(location.coords);
    setLocationData(data[0]);

    // Formatting result to suit the API fetch
    let cityCountry : string = `${data[0].city}, ${data[0].isoCountryCode}`;
    cityCountry = cityCountry.replace('"', '');
    setMyLocation(cityCountry);
    setCity(`${data[0].city}`);
  }

  // Fetching the weather information from OpenWeatherMap API
  const [weatherData, setWeatherData] = useState<weatherData>();
  const [forecastData, setForecastData] = useState<ForecastData>();
  const apiFetch = async () : Promise<void> => {

    // Current weather
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${myLocation}&units=metric&lang=en&appid=${apiKey}`,
      {}
    );
    let fetchedWeatherData : weatherData = await response.json();

    if(fetchedWeatherData.cod === 200) {
      setWeatherData(fetchedWeatherData);
    }

    // 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${myLocation}&units=metric&lang=en&appid=${apiKey}`,
      {}
    );
    let fetchedForecastData : ForecastData = await forecastResponse.json();
    setForecastData(fetchedForecastData);
  }

  // View-routes
  const FrontRoute = () =>
    <>
      <Appbar.Header style={{backgroundColor: "#dff4ff"}}>
        <Appbar.Content title="Weather" />
        <IconButton 
          icon="refresh"
        />
      </Appbar.Header>

      { (!weatherData)
        ? <View style={styles.container}>
            <IconButton 
              icon="cellphone-marker"
              size={100}
            />
            <Text style={{fontSize: 20, margin: 10}}>
              Allow GPS to get weather from your area.
            </Text>
          </View>
        : <SafeAreaView style={{flex: 1, backgroundColor: "#dff4ff"}}>
          <ScrollView showsHorizontalScrollIndicator={false}>
            <Text style={{fontSize:30, margin: 10, marginBottom: 0}}>{city} - {weatherData.sys.country}</Text>
            <Card mode='elevated' style={styles.card}>
              <Avatar.Image style={{backgroundColor: "#fdfbfb"}} source={{ uri : `http://openweathermap.org/img/wn/${weatherData?.weather[0].icon}@2x.png`}} size={100}/>
              <Card.Content>
                <Text style={styles.cardTitle}>Weather now - {weatherData?.weather[0].description}</Text>
                <Text style={styles.textStyle}>{weatherData?.main.temp.toFixed(0)}{degreeSymbol}</Text>
                <Text>Feels like: {weatherData?.main.feels_like.toFixed(0)}{degreeSymbol}</Text>
                <Text>Wind: {weatherData?.wind.speed} m/s </Text>
              </Card.Content>
            </Card>

            { forecastData?.list.map((day : ForecastListItem, idx : number) => {

              if( day.dt_txt.includes("15:00:00")){
                return (
                  <Card mode='elevated' style={styles.card} key={idx}>
                    <Avatar.Image style={{backgroundColor: "#fdfbfb"}} source={{ uri : `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}} size={100}/>
                    <Card.Content>
                      <Text style={styles.cardTitle}> {format((day.dt*1000), 'ccc')} 15:00 - {day.weather[0].description}</Text>
                        <Text>{day.main.temp.toFixed(0)}{degreeSymbol}</Text>
                        <Text>Feels like: {day.main.feels_like.toFixed(0)}{degreeSymbol}</Text>
                        <Text>Wind: {day.wind.speed} m/s </Text>
                    </Card.Content>
                  </Card> 
                )
              }
              })} 
          </ScrollView>
          </SafeAreaView> 
      }
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
  },
  card: {
    margin: 7,
    backgroundColor: "#fdfbfb"
  },
  textStyle: {
    fontSize: 20
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 10,
    marginTop: 10
  },

});

export default App;