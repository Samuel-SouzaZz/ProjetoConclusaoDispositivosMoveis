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
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/authStyles";

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível realizar o login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Forma decorativa azul no topo */}
      <View style={styles.blueShape} />
      
      {/* Forma decorativa amarela no rodapé */}
      <View style={styles.yellowShape} />

      <View style={styles.container}>
        {/* Conteúdo principal */}
        <View style={styles.content}>
          <Text style={styles.title}>Entrar</Text>
          <Text style={styles.subtitle}>
            Aprenda estrutura de dados de forma cativante
          </Text>

          {/* Campo E-mail */}
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@mail.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Campo Senha */}
          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Sua senha de acesso"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Continuar conectado */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={styles.checkbox}>
              {rememberMe && <Ionicons name="checkmark" size={16} color="#3B5BDB" />}
            </View>
            <Text style={styles.checkboxLabel}>Continuar conectado</Text>
          </TouchableOpacity>

          {/* Botão Acessar */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Acessar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Rodapé - Criar conta */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.footerLink}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
