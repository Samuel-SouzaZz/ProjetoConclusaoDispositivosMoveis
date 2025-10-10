import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";

export default function SignupScreen() {
  const navigation = useNavigation();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function handleSignup() {
    await signup(email, password, name);
    alert("Cadastro realizado!");
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crie sua conta</Text>
      <Input placeholder="Nome" value={name} onChangeText={setName} />
      <Input placeholder="Email" value={email} onChangeText={setEmail} />
      <Input placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Cadastrar" onPress={handleSignup} />
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Voltar para o login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  link: { color: "#007AFF", textAlign: "center", marginTop: 16 },
});
