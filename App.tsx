import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ThemeProvider } from "./src/contexts/ThemeContext"; // 🌙 Importa o tema

export default function App() {
  return (
    <NavigationContainer>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
}
