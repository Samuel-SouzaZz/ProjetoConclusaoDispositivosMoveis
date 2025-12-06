import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface AuthCardProps {
  children: React.ReactNode;
  isSignup?: boolean;
  style?: ViewStyle;
}

// Card centralizado para telas de autenticação
export default function AuthCard({
  children,
  isSignup = false,
  style,
}: AuthCardProps) {
  return (
    <View
      style={[
        styles.card,
        isSignup ? styles.cardSignup : styles.cardLogin,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 60,
    elevation: 20,
  },
  cardLogin: {
    maxWidth: 420,
  },
  cardSignup: {
    maxWidth: 500,
  },
});

