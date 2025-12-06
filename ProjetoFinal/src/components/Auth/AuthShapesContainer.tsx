import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import AuthShape from "./AuthShape";

type ShapeVariant = "blue-top" | "yellow-bottom" | "yellow-top" | "orange-bottom";

interface AuthShapesContainerProps {
  shapes: ShapeVariant[];
  style?: ViewStyle;
}

// Container para formas decorativas
export default function AuthShapesContainer({
  shapes,
  style,
}: AuthShapesContainerProps) {
  return (
    <View style={[styles.container, style]} accessible={false} pointerEvents="none">
      {shapes.map((variant, index) => (
        <AuthShape key={`${variant}-${index}`} variant={variant} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 0,
  },
});

