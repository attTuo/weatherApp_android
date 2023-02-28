import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, ScrollView, Route, Text,TextInput, View } from 'react-native';
import { Appbar, Avatar, BottomNavigation, Card, IconButton, List } from 'react-native-paper';
import * as Location from 'expo-location';
import { WeatherData, ForecastData, ForecastListItem } from './weatherDataTypes';
import { LocationGeocodedAddress, LocationObject, LocationObjectCoords, LocationPermissionResponse } from 'expo-location';
import { format } from "date-fns";

const App : React.FC = () : React.ReactElement => {

  const [location, setLocation] = useState<LocationObject>();
  const degreeSymbol : string = ` \xB0C`;
  const apiKey : string = "";
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    ( async () => {

      let { status } : LocationPermissionResponse = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Could not access GPS... Try again by refreshing the page.");
        return;
      }
      setErrorMsg("");

      let gpsLocation : LocationObject = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Lowest});
      setLocation(gpsLocation);

      await apiFetch(gpsLocation);
    })();
  }, []);

  // Fetching weather information from OpenWeatherMap API
  const [weatherData, setWeatherData] = useState<WeatherData>();
  const [forecastData, setForecastData] = useState<ForecastData>();
  const apiFetch = async (location : LocationObject) : Promise<void> => {

    // Current weather
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&lang=en&appid=${apiKey}`,
      {}
    );
    let fetchedWeatherData : WeatherData = await response.json();

    if (fetchedWeatherData.cod === 401) {
      setErrorMsg("Invalid API key.");
    } else {
      setWeatherData(fetchedWeatherData);
    }

    // 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&lang=en&appid=${apiKey}`,
      {}
    );
    let fetchedForecastData : ForecastData = await forecastResponse.json();

    if (fetchedForecastData.cod === "401") {
      setErrorMsg("Invalid API key.")
    } else {
      setForecastData(fetchedForecastData);
    }
  }

  // Front page refresh
  const refreshPage = async () : Promise<void> => {

    let { status } : LocationPermissionResponse = await Location.requestForegroundPermissionsAsync();
    
    if (status !== "granted") {
      setErrorMsg("Could not access GPS... Try again by refreshing the page.");
      return;
    }
    setErrorMsg("");

    let gpsLocation : LocationObject = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Low});
    setLocation(gpsLocation);

    await apiFetch(gpsLocation);
  }

  // Search weather fetch
  const [searchWeatherData, setSearchWeatherData] = useState<WeatherData>();
  const [searchForecastData, setSearchForecastData] = useState<ForecastData>();
  const [searchCity, setSearchCity] = useState<string>("");
  const searchWeather = async (city : string) : Promise<void> => {
    
    setSearchCity(city);

    const searchResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=en&appid=${apiKey}`,
      {}
    );
    let searchWeatherData : WeatherData = await searchResponse.json();
    setSearchWeatherData(searchWeatherData);

    const searchForecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=en&appid=${apiKey}`,
      {}
    );
    let searchForecastData : ForecastData = await searchForecastResponse.json();
    setSearchForecastData(searchForecastData);
  }

  // View-routes
  const FrontRoute = () =>
    <>
      <Appbar.Header style={{backgroundColor: "#dff4ff"}}>
        <Appbar.Content title="Weather" />
        <IconButton 
          icon="refresh"
          onPress={refreshPage}
        />
      </Appbar.Header>

      { (errorMsg.length > 0)
        ? <View style={styles.container}>
            <IconButton 
              icon="cellphone-marker"
              size={100}
            />
            <Text style={{fontSize: 20, margin: 10}}>
              {errorMsg}
            </Text>
          </View>
        : <SafeAreaView style={{flex: 1, backgroundColor: "#dff4ff"}}>
            <ScrollView showsHorizontalScrollIndicator={false}>
              <Text style={{fontSize:30, margin: 10, marginBottom: 0}}>{weatherData?.name} - {weatherData?.sys.country}</Text>
              <Card mode='elevated' style={styles.card}>
                <Avatar.Image style={{backgroundColor: "#fdfbfb"}} source={{ uri : `http://openweathermap.org/img/wn/${weatherData?.weather[0].icon}@2x.png`}} size={100}/>
                <Card.Content>
                  <Text style={styles.cardTitle}>Weather now - {weatherData?.weather[0].description}</Text>
                  <Text style={styles.textStyle}>{weatherData?.main.temp.toFixed(0)}{degreeSymbol}</Text>
                  <Text>Feels like: {weatherData?.main.feels_like.toFixed(0)}{degreeSymbol}</Text>
                  <Text>Wind: {weatherData?.wind.speed} m/s </Text>
                  <Text>Gust: {weatherData?.wind.gust} m/s </Text>
                </Card.Content>
              </Card>

              { forecastData?.list.map((day : ForecastListItem, idx : number) => {

                if( day.dt_txt.includes("15:00:00")){
                  return (
                    <Card mode='elevated' style={styles.card} key={idx}>
                      <Avatar.Image style={{backgroundColor: "#fdfbfb"}} source={{ uri : `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}} size={100}/>
                      <Card.Content>
                        <Text style={styles.cardTitle}> {format((day.dt*1000), 'cccc')} 15:00 - {day.weather[0].description}</Text>
                          <Text style={styles.textStyle}>{day.main.temp.toFixed(0)}{degreeSymbol}</Text>
                          <Text>Feels like: {day.main.feels_like.toFixed(0)}{degreeSymbol}</Text>
                          <Text>Wind: {day.wind.speed} m/s </Text>
                          <Text>Gust: {day.wind.gust} m/s </Text>
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
            onEndEditing={ (e : any) => { 
              searchWeather(e.nativeEvent.text);
            }}
            style={styles.textInput}
          />
        </View>
      </Appbar.Header>

      { (!searchWeatherData)
        ? <View style={styles.container}>
            <IconButton 
              icon="weather-cloudy"
              size={100}
            />
            <Text style={{fontSize: 20, margin: 10}}>Search weather by city.</Text>
          </View>
        : (searchWeatherData?.name === undefined)
          ? <View style={styles.container}>
              <IconButton 
                icon="weather-cloudy"
                size={100}
              />
              <Text style={{fontSize: 20, margin: 10}}>Could not find weather for "{searchCity}".</Text>
            </View>
          :<SafeAreaView style={{flex: 1, backgroundColor: "#dff4ff"}}>
            <ScrollView showsHorizontalScrollIndicator={false}>
              <Text style={{fontSize:30, margin: 10, marginBottom: 0}}>{searchCity} - {searchWeatherData.sys.country}</Text>
              <Card mode='elevated' style={styles.card}>
                <Avatar.Image style={{backgroundColor: "#fdfbfb"}} source={{ uri : `http://openweathermap.org/img/wn/${searchWeatherData?.weather[0].icon}@2x.png`}} size={100}/>
                <Card.Content>
                  <Text style={styles.cardTitle}>Weather now - {searchWeatherData?.weather[0].description}</Text>
                  <Text style={styles.textStyle}>{searchWeatherData?.main.temp.toFixed(0)}{degreeSymbol}</Text>
                  <Text>Feels like: {weatherData?.main.feels_like.toFixed(0)}{degreeSymbol}</Text>
                  <Text>Wind: {weatherData?.wind.speed} m/s </Text>
                  <Text>Gust: {weatherData?.wind.gust} m/s </Text>
                </Card.Content>
              </Card>

              { (searchForecastData?.cod === "200")
                ? <>
                    { searchForecastData?.list.map((day : ForecastListItem, idx : number) => {
                      if( day.dt_txt.includes("15:00:00")){
                        return (
                          <Card mode='elevated' style={styles.card} key={idx}>
                            <Avatar.Image style={{backgroundColor: "#fdfbfb"}} source={{ uri : `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}} size={100}/>
                            <Card.Content>
                              <Text style={styles.cardTitle}>{format((day.dt*1000), 'ccc')} 15:00 - {day.weather[0].description}</Text>
                                <Text style={styles.textStyle}>{day.main.temp.toFixed(0)}{degreeSymbol}</Text>
                                <Text>Feels like: {day.main.feels_like.toFixed(0)}{degreeSymbol}</Text>
                                <Text>Wind: {day.wind.speed} m/s </Text>
                                <Text>Gust: {day.wind.gust} m/s </Text>
                            </Card.Content>
                          </Card> 
                        )
                      }
                    })} 
                  </> 
                : <></>
              }
              </ScrollView>
          </SafeAreaView>
        }
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