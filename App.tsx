import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Route, Text, View } from 'react-native';
import { BottomNavigation } from 'react-native-paper';
import * as Location from 'expo-location';

const App : React.FC = () : React.ReactElement => {

  const FrontRoute = () =>
    <View style={styles.container}>
      <Text>FrontPage</Text>
    </View>
  ;

  const SearchRoute = () =>
    <View style={styles.container}>
      <Text>SeachPage</Text>
    </View>
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
});

export default App;