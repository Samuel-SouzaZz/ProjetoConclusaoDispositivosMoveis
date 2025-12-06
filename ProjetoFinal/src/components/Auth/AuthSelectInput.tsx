import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AuthSelectInputProps {
  label?: string;
  value?: string;
  placeholder?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

// Input de seleção (para faculdades, etc)
export default function AuthSelectInput({
  label,
  value,
  placeholder = "Selecione uma opção",
  onPress,
  disabled = false,
  loading = false,
  containerStyle,
  inputStyle,
  labelStyle,
}: AuthSelectInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[styles.label, labelStyle]}
          accessible={true}
          accessibilityRole="text"
        >
          {label}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.selectInput,
          disabled && styles.selectDisabled,
          inputStyle,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={label || "Selecionar opção"}
        accessibilityHint="Abre a lista de opções"
        accessibilityState={{ disabled: disabled || loading }}
      >
        <Text
          style={[
            value ? styles.selectText : styles.selectPlaceholder,
            loading && styles.selectLoading,
          ]}
        >
          {loading
            ? "Carregando..."
            : value || placeholder}
        </Text>
        {!loading && (
          <Ionicons name="chevron-down" size={20} color="#6b7280" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 8,
    fontWeight: "600",
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  selectDisabled: {
    opacity: 0.6,
  },
  selectPlaceholder: {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "400",
  },
  selectText: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  selectLoading: {
    color: "#6b7280",
    fontStyle: "italic",
  },
});

