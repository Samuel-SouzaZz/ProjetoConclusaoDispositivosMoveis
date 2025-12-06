import React from "react";
import { Text, TouchableOpacity, StyleSheet, TextStyle, ViewStyle } from "react-native";

interface AuthLinkProps {
  text: string;
  linkText: string;
  onPress: () => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  linkStyle?: TextStyle;
}

// Link de navegação entre login e cadastro
export default function AuthLink({
  text,
  linkText,
  onPress,
  containerStyle,
  textStyle,
  linkStyle,
}: AuthLinkProps) {
  return (
    <Text style={[styles.container, containerStyle]}>
      <Text style={[styles.text, textStyle]}>{text} </Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Text style={[styles.link, linkStyle]}>{linkText}</Text>
      </TouchableOpacity>
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
    color: "#4b5563",
  },
  text: {
    color: "#4b5563",
  },
  link: {
    color: "#3b82f6",
    fontWeight: "600",
  },
});

