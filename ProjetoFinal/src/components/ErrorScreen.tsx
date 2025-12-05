import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import SafeScreen from './SafeScreen';

interface ErrorScreenProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

// Tela/componente de erro padronizado com opção de retry
export default function ErrorScreen({
  message,
  onRetry,
  retryLabel = 'Tentar novamente',
  fullScreen = true,
  style,
}: ErrorScreenProps) {
  const { colors } = useTheme();

  const content = (
    <View
      style={[
        styles.container,
        fullScreen ? styles.fullScreen : styles.inline,
        style,
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`Erro: ${message}`}
      accessibilityLiveRegion="polite"
    >
      <Ionicons name="alert-circle" size={48} color={colors.textSecondary} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
        >
          <Text style={styles.retryButtonText}>{retryLabel}</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    gap: 16,
  },
  fullScreen: {
    flex: 1,
  },
  inline: {
    paddingVertical: 32,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

