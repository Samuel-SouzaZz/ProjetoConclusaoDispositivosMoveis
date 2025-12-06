import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  showCloseButton?: boolean;
  subtitle?: string;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

// Header padronizado para modais
export default function ModalHeader({
  title,
  onClose,
  icon,
  iconColor,
  showCloseButton = true,
  subtitle,
  headerStyle,
  titleStyle,
  subtitleStyle,
}: ModalHeaderProps) {
  const { colors } = useTheme();
  const finalIconColor = iconColor || colors.primary;

  return (
    <View
      style={[
        styles.header,
        { borderBottomColor: colors.border },
        headerStyle,
      ]}
      accessible={true}
      accessibilityRole="header"
    >
      <View style={styles.headerContent}>
        {icon && (
          <Ionicons
            name={icon}
            size={24}
            color={finalIconColor}
            style={styles.headerIcon}
          />
        )}
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, { color: colors.text }, titleStyle]}
            numberOfLines={2}
            accessible={true}
            accessibilityRole="header"
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                { color: colors.textSecondary },
                subtitleStyle,
              ]}
              numberOfLines={2}
              accessible={true}
              accessibilityRole="text"
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showCloseButton && (
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          accessibilityHint="Fecha o modal"
        >
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  headerIcon: {
    marginRight: 4,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
});

