import React from "react";
import { View, StyleSheet, Dimensions, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

type ShapeVariant = "blue-top" | "yellow-bottom" | "yellow-top" | "orange-bottom";

interface AuthShapeProps {
  variant: ShapeVariant;
  style?: ViewStyle;
}

// Forma decorativa com gradiente para telas de autenticação
export default function AuthShape({ variant, style }: AuthShapeProps) {
  const getColors = (): string[] => {
    switch (variant) {
      case "blue-top":
        return ["#93c5fd", "#60a5fa"];
      case "yellow-bottom":
        return ["#fde68a", "#fbbf24"];
      case "yellow-top":
        return ["#fde68a", "#fbbf24"];
      case "orange-bottom":
        return ["#fb923c", "#f97316"];
      default:
        return ["#93c5fd", "#60a5fa"];
    }
  };

  const getShapeStyle = () => {
    const baseSize = width < 640 ? { width: 300, height: 250 } : { width: 500, height: 400 };

    switch (variant) {
      case "blue-top":
        return [
          styles.blueTop,
          baseSize,
        ];
      case "yellow-bottom":
        return [
          styles.yellowBottom,
          baseSize,
        ];
      case "yellow-top":
        return [
          styles.yellowTop,
          baseSize,
        ];
      case "orange-bottom":
        return [
          styles.orangeBottom,
          baseSize,
        ];
      default:
        return [styles.blueTop, baseSize];
    }
  };

  return (
    <LinearGradient
      colors={getColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[getShapeStyle(), style]}
    />
  );
}

const styles = StyleSheet.create({
  blueTop: {
    position: "absolute",
    top: -200,
    right: -150,
    borderBottomLeftRadius: 200,
    overflow: "hidden",
  },
  yellowBottom: {
    position: "absolute",
    bottom: -200,
    left: -150,
    borderTopRightRadius: 200,
    overflow: "hidden",
  },
  yellowTop: {
    position: "absolute",
    top: -200,
    right: -150,
    borderBottomLeftRadius: 200,
    overflow: "hidden",
  },
  orangeBottom: {
    position: "absolute",
    bottom: -200,
    left: -150,
    borderTopRightRadius: 200,
    overflow: "hidden",
  },
});

