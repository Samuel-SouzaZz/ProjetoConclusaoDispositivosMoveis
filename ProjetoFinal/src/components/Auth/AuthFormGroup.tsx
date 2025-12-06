import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface AuthFormGroupProps {
  children: React.ReactNode;
  style?: ViewStyle;
  flex?: number;
}

// Grupo de campo de formulário (para usar dentro de FormRow)
export default function AuthFormGroup({
  children,
  style,
  flex = 1,
}: AuthFormGroupProps) {
  return (
    <View style={[styles.group, { flex }, style]} accessible={false}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    minWidth: 0,
  },
});

