import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
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
  inputSmall: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  buttonPrimarySmall: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
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
});
