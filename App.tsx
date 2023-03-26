import { StyleSheet, SafeAreaView, ScrollView, Route, Text, TextInput, View } from 'react-native';
import { Appbar, Avatar, BottomNavigation, Card, IconButton } from 'react-native-paper';
import { WeatherData, ForecastData, ForecastListItem } from './weatherDataTypes';
import { LocationObject, LocationPermissionResponse } from 'expo-location';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
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
      <Appbar.Header style={styles.headerStyle}>
      <Text style={styles.blueFont}>{weatherData?.name} - {weatherData?.sys.country}</Text>
        <IconButton
          style={{position: "absolute",right:0}}
          icon="refresh"
          iconColor="#023E8A"
          size={35}
          onPress={refreshPage}
        />
      </Appbar.Header>

      { (errorMsg.length > 0)
        ? <View style={styles.container}>
            <IconButton 
              icon="cellphone-marker"
              iconColor="red"
              size={100}
            />
            <Text style={styles.errorText}>
              {errorMsg}
            </Text>
          </View>
        : <SafeAreaView style={styles.viewStyle}>
            <ScrollView showsHorizontalScrollIndicator={false}>
              <Card mode='elevated' style={styles.card}>
              <Text style={styles.cardTime}>Now - {format(new Date(),'HH:mm')}</Text>
              <Text style={{textAlign:"center"}}>Today</Text>

              {(weatherData?.sys.sunrise && weatherData?.sys.sunset)
                ? <View style={{alignItems:"center", flexDirection:"row"}}>
                    <Text style={{flex:4}}></Text>
                    <IconButton
                      icon="weather-sunset-up"
                      iconColor="#023E8A"
                      size={20}
                      style={{margin:0, marginBottom:10, flex:2}}
                    />
                    <Text style={{margin:0, marginBottom:10, flex:4, textAlign:"center"}}>{format((weatherData?.sys.sunrise*1000), 'HH:mm')} - {format((weatherData?.sys.sunset*1000), 'HH:mm')}</Text>
                    <IconButton
                      icon="weather-sunset-down"
                      iconColor="#023E8A"
                      size={20}
                      style={{margin:0, marginBottom:10, flex:2}}
                    />
                    <Text style={{flex:4}}></Text>
                  </View>
                : <></>
              }
              
                <Avatar.Image style={styles.avatarImage} source={{ uri : `http://openweathermap.org/img/wn/${weatherData?.weather[0].icon}@2x.png`}} size={100}/>
                <Text style={styles.cardWeather}>{weatherData?.weather[0].description}</Text>

                {(weatherData?.snow)
                  ? <Text style={styles.rainText}>{weatherData.snow['1h']} mm (1h)</Text>
                  : <></>
                }
                {(weatherData?.rain)
                  ? <Text style={styles.rainText}>{weatherData.rain['1h']} mm (1h)</Text>
                  : <></>
                }

                <Card.Content>
                  <Text style={styles.textStyle}>{weatherData?.main.temp.toFixed(0)}{degreeSymbol}</Text>
                  <Text>Feels like: {weatherData?.main.feels_like.toFixed(0)}{degreeSymbol}</Text>
                  <Text>Wind: {weatherData?.wind.speed} m/s </Text>
                  <Text>Gust: {weatherData?.wind.gust} m/s </Text>
                </Card.Content>
              </Card>

              { forecastData?.list.map((day : ForecastListItem, idx : number) => {
                if(day.dt_txt.includes("00:00:00")){
                  return (
                    <Card mode='elevated' style={styles.firstCard} key={idx}>
                      <Text style={styles.cardDay}>{format((day.dt*1000), 'cccc')}</Text>
                      <Text style={styles.cardTime}>{day.dt_txt.substring(11,16)}</Text>
                      <Avatar.Image style={styles.avatarImage} source={{ uri : `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}} size={100}/>
                      <Text style={styles.cardWeather}>{day.weather[0].description}</Text>

                      {(day.snow)
                        ? <Text style={styles.rainText}>{day.snow['3h']} mm (3h)</Text>
                        : <></>
                      }
                      {(day.rain)
                        ? <Text style={styles.rainText}>{day.rain['3h']} mm (3h)</Text>
                        : <></>
                      }

                      <Card.Content>
                        <Text style={styles.textStyle}>{day.main.temp.toFixed(0)}{degreeSymbol}</Text>
                        <Text>Feels like: {day.main.feels_like.toFixed(0)}{degreeSymbol}</Text>
                        <Text>Wind: {day.wind.speed} m/s </Text>
                        <Text>Gust: {day.wind.gust} m/s </Text>
                      </Card.Content>
                    </Card>
               
                  )
                }
                else {
                  return (
                    <Card mode='elevated' style={styles.card} key={idx}>
                      <Text style={styles.cardTime}>{day.dt_txt.substring(11,16)}</Text>
                      <Avatar.Image style={styles.avatarImage} source={{ uri : `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}} size={100}/>
                      <Text style={styles.cardWeather}>{day.weather[0].description}</Text>

                      {(day.snow)
                        ? <Text style={styles.rainText}>{day.snow['3h']} mm (3h)</Text>
                        : <></>
                      }
                      {(day.rain)
                        ? <Text style={styles.rainText}>{day.rain['3h']} mm (3h)</Text>
                        : <></>
                      }

                      <Card.Content>
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
      <Appbar.Header style={styles.headerStyle}>
        <View>
          <TextInput
            placeholder="Search..."
            onEndEditing={ (e : any) => { 
              searchWeather(e.nativeEvent.text);
            }}
            style={styles.textInput}
          />
        </View>
        <IconButton
          style={{position: "absolute",right:0}}
          icon="magnify"
          iconColor="#023E8A"
          size={35}
        />
      </Appbar.Header>

      { (!searchWeatherData)
        ? <View style={styles.container}>
            <IconButton 
              icon="weather-cloudy"
              iconColor="#023E8A"
              size={100}
            />
            <Text style={styles.smallBlueText}>Search weather by city name.</Text>
          </View>
        : (searchWeatherData?.name === undefined)
          ? <View style={styles.container}>
              <IconButton 
                icon="weather-cloudy"
                iconColor="red"
                size={100}
              />
              <Text style={styles.errorText}>Could not find weather for "{searchCity}".</Text>
            </View>
          :<SafeAreaView style={styles.viewStyle}>
            <ScrollView showsHorizontalScrollIndicator={false}>
              <Text style={styles.blueFont}>{searchCity} - {searchWeatherData.sys.country}</Text>
              <Card mode='elevated' style={styles.card}>
              <Text style={styles.cardTime}>Now - {format(new Date(),'HH:mm')}</Text>
                <Avatar.Image style={styles.avatarImage} source={{ uri : `http://openweathermap.org/img/wn/${weatherData?.weather[0].icon}@2x.png`}} size={100}/>
                <Text style={styles.cardWeather}>{searchWeatherData?.weather[0].description}</Text>

                {(searchWeatherData.snow)
                  ? <Text style={styles.rainText}>{searchWeatherData.snow['1h']} mm (1h)</Text>
                  : <></>
                }
                {(searchWeatherData.rain)
                  ? <Text style={styles.rainText}>{searchWeatherData.rain['1h']} mm (1h)</Text>
                  : <></>
                }

                <Card.Content>
                  <Text style={styles.textStyle}>{searchWeatherData?.main.temp.toFixed(0)}{degreeSymbol}</Text>
                  <Text>Feels like: {searchWeatherData?.main.feels_like.toFixed(0)}{degreeSymbol}</Text>
                  <Text>Wind: {searchWeatherData?.wind.speed} m/s </Text>
                  <Text>Gust: {searchWeatherData?.wind.gust} m/s </Text>
                </Card.Content>
              </Card>

              { (searchForecastData?.cod === "200")
                ? <>
                    { searchForecastData?.list.map((day : ForecastListItem, idx : number) => {
                      if(day.dt_txt.includes("00:00:00")){
                        return (
                          <Card mode='elevated' style={styles.firstCard} key={idx}>
                            <Text style={styles.cardDay}>{format((day.dt*1000), 'cccc')}</Text>
                            <Text style={styles.cardTime}>{day.dt_txt.substring(11,16)}</Text>
                            <Avatar.Image style={styles.avatarImage} source={{ uri : `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}} size={100}/>
                            <Text style={styles.cardWeather}>{day.weather[0].description}</Text>

                            {(day.snow)
                              ? <Text style={styles.rainText}>{day.snow['3h']} mm (3h)</Text>
                              : <></>
                            }
                            {(day.rain)
                              ? <Text style={styles.rainText}>{day.rain['3h']} mm (3h)</Text>
                              : <></>
                            }

                            <Card.Content>
                              <Text style={styles.textStyle}>{day.main.temp.toFixed(0)}{degreeSymbol}</Text>
                              <Text>Feels like: {day.main.feels_like.toFixed(0)}{degreeSymbol}</Text>
                              <Text>Wind: {day.wind.speed} m/s </Text>
                              <Text>Gust: {day.wind.gust} m/s </Text>
                            </Card.Content>
                          </Card>
                        )
                      }
                      else {
                        return (
                          <Card mode='elevated' style={styles.card} key={idx}>
                            <Text style={styles.cardTime}>{day.dt_txt.substring(11,16)}</Text>
                            <Avatar.Image style={styles.avatarImage} source={{ uri : `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}} size={100}/>
                            <Text style={styles.cardWeather}>{day.weather[0].description}</Text>

                            {(day.snow)
                              ? <Text style={styles.rainText}>{day.snow['3h']} mm (3h)</Text>
                              : <></>
                            }
                            {(day.rain)
                              ? <Text style={styles.rainText}>{day.rain['3h']} mm (3h)</Text>
                              : <></>
                            }

                            <Card.Content>
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
                : <>
                    <IconButton 
                      icon="weather-cloudy"
                      iconColor="red"
                      style={{alignSelf:"center"}}
                      size={100}
                    />
                    <Text style={styles.errorText}>Could not access forecast data.</Text>
                  </>
              }
              </ScrollView>
          </SafeAreaView>
        }
    </>
  ;

  const [index, setIndex] = useState<number>(0);
  const [routes] = useState<Route[0]>([
    { key: 'frontpage', title: 'Weather', focusedIcon: 'weather-partly-cloudy', unfocusedIcon: 'weather-cloudy' },
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
        barStyle={{backgroundColor:"#abc4ff"}}
        activeColor="#023E8A"
        inactiveColor="#023E8A"
      />
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#e2eafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    width: 355,
    marginLeft: 10,
    borderColor: "#023E8A",
    backgroundColor: "#e2eafc",
    borderWidth: 1,
    padding: 5
  },
  firstCard: {
    margin: 7,
    backgroundColor: "#e2eafc",
    marginTop: 20
  },
  card: {
    margin: 7,
    backgroundColor: "#e2eafc"
  },
  textStyle: {
    fontSize: 20
  },
  cardWeather: {
    fontSize: 20,
    marginBottom: 10,
    marginTop: 10,
    position: "absolute",
    right: 10,
    bottom: 20 
  },
  headerStyle: { 
    backgroundColor: "#abc4ff"
  },
  cardTime: {
    fontSize: 30,
    margin: 10,
    marginBottom: 0,
    textAlign: "center",
    color:"#023E8A"
  },
  avatarImage: {
    position: "absolute",
    right: 0,
    bottom: 40,
    backgroundColor: "#e2eafc"
  },
  cardDay: {
    fontSize: 40,
    margin: 10,
    textAlign: "center",
    fontWeight: "bold",
    color:"#023E8A"
  },
  blueFont: {
    fontSize:30, 
    margin: 10, 
    marginBottom: 0,
    color:"#023E8A",
    fontWeight:"bold"
  },
  viewStyle: {
    flex: 1,
    backgroundColor: "#abc4ff"
  },
  smallBlueText: {
    fontSize: 20,
    margin: 10,
    color:"#023E8A"
  },
  errorText: {
    color: "red",
    fontSize: 20, 
    margin: 10,
    textAlign: "center"
  },
  rainText: {
    position:"absolute",
    bottom:15,
    right:10
  }
});

export default App;