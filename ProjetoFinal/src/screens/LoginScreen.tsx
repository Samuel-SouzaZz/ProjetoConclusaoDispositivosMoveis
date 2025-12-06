import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import {
  AuthContainer,
  AuthShapesContainer,
  AuthCard,
  AuthBackButton,
  AuthTitle,
  AuthLink,
  AuthRememberMe,
} from "../components/Auth";
import { Button } from "../components/common";
import { styles as authStyles } from "../styles/authStyles";

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const passwordRef = useRef<TextInput>(null);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      await login(email, password, rememberMe);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Não foi possível realizar o login.";
      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthShapesContainer shapes={["blue-top", "yellow-bottom"]} />

        <AuthContainer style={{ paddingTop: 40 }}>
          <AuthCard>
            <AuthBackButton onPress={() => navigation.navigate("Home")} />

            <AuthTitle title="Login" />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu E-mail"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordRef}
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Digite sua Senha"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <AuthRememberMe value={rememberMe} onValueChange={setRememberMe} />

            <Button
              onPress={handleLogin}
              label="Entrar"
              loading={loading}
              disabled={loading}
              useGradient
              fullWidth
              style={{ marginTop: 8 }}
            />

            <AuthLink
              text="Não tem uma conta?"
              linkText="CADASTRE-SE!"
              onPress={() => navigation.navigate("Signup")}
            />
          </AuthCard>
        </AuthContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    minHeight: 44,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    minHeight: 44,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  eyeButton: {
    padding: 12,
  },
});
