// src/styles/authStyles.ts
import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  // Container principal
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },

  // Formas decorativas
  blueShape: {
    position: "absolute",
    top: -100,
    right: -50,
    width: width * 0.8,
    height: height * 0.35,
    backgroundColor: "#A8D8EA",
    borderBottomLeftRadius: width * 0.8,
    borderBottomRightRadius: width * 0.8,
  },
  yellowShape: {
    position: "absolute",
    bottom: -50,
    left: -50,
    width: width * 0.8,
    height: height * 0.35,
    backgroundColor: "#FFE66D",
    borderTopLeftRadius: width * 0.8,
    borderTopRightRadius: width * 0.8,
  },

  // Conteúdo
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 100,
    zIndex: 1,
  },
  contentSignup: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    zIndex: 1,
  },

  // Textos
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 40,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    color: "#1A1A1A",
    marginBottom: 8,
    fontWeight: "500",
  },

  // Inputs
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1A1A1A",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  inputSignup: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1A1A1A",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  // Password container
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  passwordContainerSignup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
    paddingVertical: 10,
  },
  eyeIcon: {
    padding: 4,
  },

  // Select (Picker)
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  selectPlaceholder: {
    fontSize: 15,
    color: "#999",
  },
  selectText: {
    fontSize: 15,
    color: "#1A1A1A",
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#3B5BDB",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#1A1A1A",
  },

  // Botões
  button: {
    backgroundColor: "#3B5BDB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B5BDB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonSignup: {
    backgroundColor: "#3B5BDB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#3B5BDB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Rodapé
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
    paddingBottom: 40,
    zIndex: 2,
  },
  footerText: {
    fontSize: 14,
    color: "#1A1A1A",
  },
  footerLink: {
    fontSize: 14,
    color: "#3B5BDB",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  modalClose: {
    padding: 4,
  },
  collegeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  collegeItemText: {
    fontSize: 15,
    color: "#1A1A1A",
    flex: 1,
  },

  // ==== ESTILOS ANTIGOS (mantidos para compatibilidade) ====
  
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
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  message: {
    textAlign: "center",
    marginBottom: 12,
    color: "#ff3b30",
  },

  // Inputs antigos
  inputSmall: {
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

  // Botões antigos
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

  // Links antigos
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

  // Social antigos
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
