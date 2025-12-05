import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ScreenHeader from './ScreenHeader';

interface ScreenHeaderWithActionProps {
  title: string;
  actionLabel: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onAction: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  backgroundColor?: string;
  borderBottom?: boolean;
}

// Header com botão de ação integrado à direita
export default function ScreenHeaderWithAction({
  title,
  actionLabel,
  actionIcon = 'add-circle-outline',
  onAction,
  showBackButton = false,
  onBackPress,
  backgroundColor,
  borderBottom = true,
}: ScreenHeaderWithActionProps) {
  const { colors } = useTheme();

  const rightAction = (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: colors.primary }]}
      onPress={onAction}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={actionLabel}
      accessibilityHint="Toque duas vezes para abrir o formulário"
    >
      <Ionicons name={actionIcon} size={18} color="#fff" />
      <Text style={styles.actionButtonText}>{actionLabel}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenHeader
      title={title}
      showBackButton={showBackButton}
      onBackPress={onBackPress}
      rightAction={rightAction}
      backgroundColor={backgroundColor}
      borderBottom={borderBottom}
    />
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

