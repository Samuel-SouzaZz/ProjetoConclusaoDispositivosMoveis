import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BadgeChipProps {
  label: string;
  backgroundColor: string;
  textColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  style?: ViewStyle;
  accessibilityLabel: string;
}

export default function BadgeChip({
  label,
  backgroundColor,
  textColor = '#fff',
  icon,
  iconColor,
  style,
  accessibilityLabel,
}: BadgeChipProps) {
  return (
    <View
      style={[styles.badge, { backgroundColor }, style]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      {icon && (
        <Ionicons name={icon} size={16} color={iconColor || textColor} />
      )}
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

