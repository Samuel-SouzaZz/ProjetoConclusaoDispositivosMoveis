import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import SafeScreen from './SafeScreen';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

// Tela/componente de loading padronizado (fullScreen ou inline)
export default function LoadingScreen({
  message = 'Carregando...',
  fullScreen = true,
  style,
}: LoadingScreenProps) {
  const { colors } = useTheme();

  const content = (
    <View
      style={[
        styles.container,
        fullScreen ? styles.fullScreen : styles.inline,
        style,
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return <SafeScreen>{content}</SafeScreen>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  fullScreen: {
    flex: 1,
  },
  inline: {
    padding: 32,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});

