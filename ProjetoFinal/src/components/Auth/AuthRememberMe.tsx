import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";

interface AuthRememberMeProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
}

export default function AuthRememberMe({
  value,
  onValueChange,
  label = "Permanecer logado",
}: AuthRememberMeProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => onValueChange(!value)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ checked: value }}
      >
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#d1d5db", true: "#4A90E2" }}
          thumbColor="#ffffff"
        />
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
});
