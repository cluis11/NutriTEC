import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar pantallas
import LoginScreen from './src/screens/Login';
import DashboardScreen from './src/screens/MainScreen';
import GestionRecetas from "./src/screens/GestionRecetas";

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  GestionRecetas: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="GestionRecetas"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen
          name="GestionRecetas"
          component={GestionRecetas}
          options={{ title: "Gestión de Recetas" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}