import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type ButtonVariant = "primary" | "secondary" | "danger" | "success";

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  useGradient?: boolean;
}

// Componente de botão reutilizável com variantes
export default function Button({
  onPress,
  label,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
  useGradient = false,
}: ButtonProps) {
  const isDisabled = loading || disabled;

  const getButtonColors = () => {
    switch (variant) {
      case "primary":
        return { bg: "#3B5BDB", text: "#fff", border: "transparent" };
      case "secondary":
        return { bg: "transparent", text: "#3B5BDB", border: "#3B5BDB" };
      case "danger":
        return { bg: "#ef4444", text: "#fff", border: "transparent" };
      case "success":
        return { bg: "#22c55e", text: "#fff", border: "transparent" };
      default:
        return { bg: "#3B5BDB", text: "#fff", border: "transparent" };
    }
  };

  const colors = getButtonColors();

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "secondary" ? colors.text : "#fff"}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.buttonText, { color: colors.text }, textStyle]}>
            {label}
          </Text>
        </>
      )}
    </>
  );

  if (useGradient && variant === "primary" && !isDisabled) {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          fullWidth && styles.fullWidth,
          isDisabled && styles.buttonDisabled,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: isDisabled ? "#9ca3af" : colors.bg,
          borderColor: colors.border,
          borderWidth: variant === "secondary" ? 2 : 0,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {buttonContent}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    minHeight: 44,
  },
  fullWidth: {
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  gradient: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    minHeight: 44,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});

