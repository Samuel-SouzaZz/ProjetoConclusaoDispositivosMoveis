import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface AuthContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

// Container principal para telas de autenticação
export default function AuthContainer({ children, style }: AuthContainerProps) {
  return (
    <View
      style={[styles.container, style]}
      accessible={false}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    position: "relative",
    backgroundColor: "#f9fafb",
  },
});

