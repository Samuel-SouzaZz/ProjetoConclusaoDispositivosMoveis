import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
}

export default function TabButton({
  icon,
  label,
  active,
  onPress,
  activeColor,
  inactiveColor,
  accessibilityLabel,
  accessibilityHint,
}: TabButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.tab,
        active && { borderBottomColor: activeColor, borderBottomWidth: 3 }
      ]}
      onPress={onPress}
      accessible={true}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected: active }}
    >
      <Ionicons
        name={icon}
        size={20}
        color={active ? activeColor : inactiveColor}
      />
      <Text
        style={[
          styles.tabText,
          { color: active ? activeColor : inactiveColor }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

