import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type SocialVariant = "google" | "facebook";

interface AuthSocialButtonProps {
  variant: SocialVariant;
  onPress: () => void;
  label: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// Botão de login social (Google/Facebook)
export default function AuthSocialButton({
  variant,
  onPress,
  label,
  style,
  textStyle,
}: AuthSocialButtonProps) {
  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    return variant === "google" ? "logo-google" : "logo-facebook";
  };

  const getIconColor = (): string => {
    return variant === "google" ? "#ea4335" : "#1877f2";
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "google" ? styles.buttonGoogle : styles.buttonFacebook,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Entrar com ${variant === "google" ? "Google" : "Facebook"}`}
    >
      <Ionicons name={getIconName()} size={20} color={getIconColor()} />
      <Text style={[styles.buttonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  buttonGoogle: {
    borderColor: "#d1d5db",
  },
  buttonFacebook: {
    borderColor: "#d1d5db",
  },
  buttonText: {
    fontSize: 15,
    color: "#4b5563",
    fontWeight: "500",
  },
});

