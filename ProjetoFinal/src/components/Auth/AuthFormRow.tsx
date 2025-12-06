import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface AuthFormRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

// Container para campos de formulário lado a lado
export default function AuthFormRow({ children, style }: AuthFormRowProps) {
  return (
    <View style={[styles.row, style]} accessible={false}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 0,
  },
});

