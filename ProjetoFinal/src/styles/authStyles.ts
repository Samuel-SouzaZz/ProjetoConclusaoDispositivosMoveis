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
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  biometricButtonText: {
    color: colors.blue400,
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 8,
  },
});
