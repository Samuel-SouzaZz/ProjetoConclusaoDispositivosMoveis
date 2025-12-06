import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";

interface AuthTitleProps {
  title: string;
  style?: TextStyle;
}

// Título de autenticação com chaves estilizadas
export default function AuthTitle({ title, style }: AuthTitleProps) {
  return (
    <Text
      style={[styles.title, style]}
      accessible={true}
      accessibilityRole="header"
      accessibilityLabel={`Título: ${title}`}
    >
      <Text style={styles.bracket}>{"{"}</Text>
      {title}
      <Text style={styles.bracket}>{"}"}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  bracket: {
    color: "#4b5563",
    fontWeight: "400",
  },
});

