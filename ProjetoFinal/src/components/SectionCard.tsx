import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SectionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: ReactNode;
  iconColor: string;
  titleColor: string;
  backgroundColor: string;
  accessibilityLabel: string;
}

export default function SectionCard({
  icon,
  title,
  children,
  iconColor,
  titleColor,
  backgroundColor,
  accessibilityLabel,
}: SectionCardProps) {
  return (
    <View
      style={[styles.section, { backgroundColor }]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={iconColor} />
        <Text style={[styles.sectionTitle, { color: titleColor }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

