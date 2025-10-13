// src/styles/authStyles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f7f7f7",
  },

  // Card (uso genérico). card alias para compatibilidade com versões antigas.
  cardSmall: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    // alias -> mantém compatibilidade com códigos que usam styles.card
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },

  message: {
    textAlign: "center",
    marginBottom: 12,
    color: "#ff3b30",
  },

  // Inputs
  inputSmall: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  input: {
    // alias para compatibilidade
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },

  // Picker wrapper e estilo do picker
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  picker: {
    height: 44,
    width: "100%",
  },

  // Botões
  buttonPrimarySmall: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  buttonPrimary: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  // Links
  linkText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
    color: "#333",
  },
  linkHighlight: {
    color: "#007AFF",
    fontWeight: "bold",
  },

  // Social
  socialContainerSmall: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  socialButtonSmall: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  socialTextSmall: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

pickerLabel: {
  fontSize: 14,
  color: "#333",
  paddingHorizontal: 10,
  paddingTop: 8,
},


});
