import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Props {
  error: string;
  onClose: () => void;
}

export default function ErrorAlert({ error, onClose }: Props) {
  return (
    <View style={styles.alert}>
      <Text style={styles.text}>{error}</Text>
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.close}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    backgroundColor: "#f8d7da",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  text: { color: "#721c24" },
  close: { fontWeight: "bold" },
});
