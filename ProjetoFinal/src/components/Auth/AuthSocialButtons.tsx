import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import AuthSocialButton from "./AuthSocialButton";

interface AuthSocialButtonsProps {
  onGooglePress?: () => void;
  onFacebookPress?: () => void;
  style?: ViewStyle;
}

// Container para botões sociais
export default function AuthSocialButtons({
  onGooglePress,
  onFacebookPress,
  style,
}: AuthSocialButtonsProps) {
  return (
    <View style={[styles.container, style]}>
      {onGooglePress && (
        <AuthSocialButton
          variant="google"
          label="Entrar com Google"
          onPress={onGooglePress}
        />
      )}
      {onFacebookPress && (
        <AuthSocialButton
          variant="facebook"
          label="Entrar com Facebook"
          onPress={onFacebookPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    gap: 12,
  },
});

