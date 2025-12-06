import { StyleSheet } from "react-native";

// Cores do tema baseadas no FrontEnd
const colors = {
  background: "#f9fafb",
  surface: "#ffffff",
  textPrimary: "#111827",
  textSecondary: "#4b5563",
  blue400: "#3b82f6",
  border: "#d1d5db",
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
