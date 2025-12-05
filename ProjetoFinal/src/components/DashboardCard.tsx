import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DashboardCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackgroundColor: string;
  title: string | ReactNode;
  subtitle: string;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
  subtitleColor: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  style?: ViewStyle;
}

export default function DashboardCard({
  icon,
  iconColor,
  iconBackgroundColor,
  title,
  subtitle,
  onPress,
  backgroundColor,
  textColor,
  subtitleColor,
  accessibilityLabel,
  accessibilityHint,
  style,
}: DashboardCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.info}>
        {typeof title === 'string' ? (
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        ) : (
          title
        )}
        <Text style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 14,
  },
});

