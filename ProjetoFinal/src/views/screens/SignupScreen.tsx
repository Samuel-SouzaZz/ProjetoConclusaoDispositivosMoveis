import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker"; // npm install @react-native-picker/picker
import { useAuth } from "../../contexts/AuthContext"; // mesmo contexto que no web

export default function SignupScreen() {
  const navigation = useNavigation();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    handle: "",
    college: "",
  });

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock de faculdades
    setColleges([
      { _id: "1", name: "Universidade de São Paulo (USP)" },
      { _id: "2", name: "Universidade Federal do Rio de Janeiro (UFRJ)" },
      { _id: "3", name: "Universidade Estadual de Campinas (UNICAMP)" },
      { _id: "4", name: "Universidade Federal de Minas Gerais (UFMG)" },
      { _id: "5", name: "Pontifícia Universidade Católica (PUC)" },
    ]);
  }, []);

  async function handleSignup() {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.college
    ) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const signupData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        handle: formData.handle || formData.email.split("@")[0],
        college: formData.college,
      };

      await signup(signupData);

      Alert.alert("Sucesso", "Conta criada com sucesso!");
      navigation.navigate("Dashboard");
    } catch (err) {
      let errorMessage = "Erro ao criar conta.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 409) {
        errorMessage = "Este e-mail já está cadastrado.";
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={formData.firstName}
        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Sobrenome"
        value={formData.lastName}
        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.college}
          onValueChange={(value) => setFormData({ ...formData, college: value })}
        >
          <Picker.Item label="Selecione sua Faculdade" value="" />
          {colleges.map((college) => (
            <Picker.Item
              key={college._id}
              label={college.name}
              value={college._id}
            />
          ))}
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Concluir</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>
          Já tem conta? <Text style={styles.linkHighlight}>Faça login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff6600",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#ff6600",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  link: {
    textAlign: "center",
    color: "#555",
    marginTop: 20,
  },
  linkHighlight: {
    color: "#ff6600",
    fontWeight: "bold",
  },
});
