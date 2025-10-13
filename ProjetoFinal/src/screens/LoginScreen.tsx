import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import { styles } from "../styles/authStyles";

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      await login(email, password); // AuthContext já navega para Dashboard
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível realizar o login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardSmall}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.inputSmall}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.inputSmall}
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.buttonPrimarySmall}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.linkText}>
          Não tem uma conta?{" "}
          <Text
            style={styles.linkHighlight}
            onPress={() => navigation.navigate("Signup")}
          >
            Cadastrar
          </Text>
        </Text>

        <View style={styles.socialContainerSmall}>
          <TouchableOpacity
            style={[styles.socialButtonSmall, { backgroundColor: "#DB4437" }]}
            onPress={() => Alert.alert("Login com Google em breve!")}
          >
            <FontAwesome name="google" size={20} color="#fff" />
            <Text style={styles.socialTextSmall}> Entrar com Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButtonSmall, { backgroundColor: "#3b5998" }]}
            onPress={() => Alert.alert("Login com Facebook em breve!")}
          >
            <FontAwesome name="facebook" size={20} color="#fff" />
            <Text style={styles.socialTextSmall}> Entrar com Facebook</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
