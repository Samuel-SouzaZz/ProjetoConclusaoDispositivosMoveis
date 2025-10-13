import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Props {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

export default function Notification({ type, message, onClose }: Props) {
  return (
    <View
      style={[
        styles.container,
        type === "success" ? styles.success : styles.error,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.close}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    width: "90%",
  },
  success: { backgroundColor: "#d4edda" },
  error: { backgroundColor: "#f8d7da" },
  text: { flex: 1, color: "#000", fontSize: 14 },
  close: { fontWeight: "bold", marginLeft: 8 },
});
