import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import DashboardScreen from "../screens/DashboardScreen";
import DiscussionsScreen from "../screens/DiscussionsScreen";
import RankingScreen from "../screens/RankingScreen";
import ExercisesScreen from "../screens/ExercisesScreen";
import SettingsScreen from "../screens/SettingsScreen";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  Discussions: undefined;
  Ranking: undefined;
  Exercises: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Discussions" component={DiscussionsScreen} />
      <Stack.Screen name="Ranking" component={RankingScreen} />
      <Stack.Screen name="Exercises" component={ExercisesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
