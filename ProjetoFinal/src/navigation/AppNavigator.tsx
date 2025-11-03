import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import DashboardScreen from "../screens/DashboardScreen";
import DiscussionsScreen from "../screens/DiscussionsScreen";
import RankingScreen from "../screens/RankingScreen";
import ExercisesScreen from "../screens/ExercisesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

// Tipagem para o Stack Navigator
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
};

// Tipagem para o Tab Navigator
type TabParamList = {
  DashboardTab: undefined;
  ExercisesTab: undefined;
  DiscussionsTab: undefined;
  RankingTab: undefined;
  SettingsTab: undefined;
  ProfileTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard">
        {() => (
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.text,
              sceneContainerStyle: { backgroundColor: colors.background },
              tabBarStyle: {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                borderTopWidth: 1,
                height: 70,
                paddingBottom: 10,
                paddingTop: 10,
              },
              tabBarBackground: () => (
                <View style={{ flex: 1, backgroundColor: colors.card }} />
              ),
            }}
          >
            <Tab.Screen
              name="DashboardTab"
              component={DashboardScreen}
              options={{
                tabBarLabel: "Home",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen 
              name="ExercisesTab" 
              component={ExercisesScreen}
              options={{
                tabBarLabel: "Desafios",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="code-slash" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="DiscussionsTab"
              component={DiscussionsScreen}
              options={{
                tabBarLabel: "Discussões",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="chatbubbles" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="RankingTab"
              component={RankingScreen}
              options={{
                tabBarLabel: "Ranking",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="trophy" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="ProfileTab"
              component={ProfileScreen}
              options={{
                tabBarLabel: "Perfil",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="SettingsTab"
              component={SettingsScreen}
              options={{
                tabBarLabel: "Configurações",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="settings" size={size} color={color} />
                ),
              }}
            />
          </Tab.Navigator>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
