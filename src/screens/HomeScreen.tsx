import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Formas decorativas */}
        <View style={styles.topShape} />
        <View style={styles.bottomShape} />

        <View style={styles.content}>
          {/* Logo/Ícone */}
          <View style={styles.iconContainer}>
            <FontAwesome name="graduation-cap" size={80} color="#6C63FF" />
          </View>

          {/* Título e Subtítulo */}
          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>
            Aprenda estrutura de dados e algoritmos de forma divertida e interativa
          </Text>

          {/* Botões de ação */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.buttonPrimaryText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => navigation.navigate("Signup")}
            >
              <Text style={styles.buttonSecondaryText}>Criar Conta</Text>
            </TouchableOpacity>
          </View>

          {/* Rodapé */}
          <Text style={styles.footerText}>
            Junte-se a milhares de estudantes que já estão aprendendo!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    position: "relative",
    overflow: "hidden",
  },
  topShape: {
    position: "absolute",
    top: -height * 0.15,
    left: -width * 0.2,
    width: width * 0.8,
    height: height * 0.4,
    backgroundColor: "#6C63FF",
    borderRadius: 999,
    opacity: 0.7,
    transform: [{ rotate: "-30deg" }],
  },
  bottomShape: {
    position: "absolute",
    bottom: -height * 0.1,
    right: -width * 0.2,
    width: width * 0.6,
    height: height * 0.3,
    backgroundColor: "#FFD700",
    borderRadius: 999,
    opacity: 0.6,
    transform: [{ rotate: "45deg" }],
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 30,
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 50,
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    width: "100%",
    maxWidth: 350,
    gap: 15,
  },
  buttonPrimary: {
    backgroundColor: "#6C63FF",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonPrimaryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6C63FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonSecondaryText: {
    color: "#6C63FF",
    fontWeight: "bold",
    fontSize: 18,
  },
  footerText: {
    marginTop: 40,
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
});

