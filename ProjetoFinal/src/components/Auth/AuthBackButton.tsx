import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AuthBackButtonProps {
  onPress: () => void;
  label?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// Botão de voltar para telas de autenticação
export default function AuthBackButton({
  onPress,
  label = "Voltar para Home",
  style,
  textStyle,
}: AuthBackButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Retorna para a tela anterior"
    >
      <Ionicons name="arrow-back" size={18} color="#4b5563" />
      <Text style={[styles.buttonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
});

