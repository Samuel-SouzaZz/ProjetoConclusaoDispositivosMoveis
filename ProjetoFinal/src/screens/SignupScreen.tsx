import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../contexts/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import { styles } from "../styles/authStyles";

export default function SignupScreen() {
  const { signup } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSignup() {
    if (!email || !password) {
      setMessage("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await signup(email, password);
    } catch (err) {
      setMessage("Erro ao realizar cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f7f7f7" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.cardSmall}>
          <Text style={styles.title}>{"{ Cadastro }"}</Text>
          {message && <Text style={styles.message}>{message}</Text>}

          <TextInput
            style={styles.inputSmall}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.inputSmall}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.buttonPrimarySmall}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.linkText}>
            Já tem conta?{" "}
            <Text
              style={styles.linkHighlight}
              onPress={() => navigation.navigate("Login")}
            >
              Fazer Login
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
