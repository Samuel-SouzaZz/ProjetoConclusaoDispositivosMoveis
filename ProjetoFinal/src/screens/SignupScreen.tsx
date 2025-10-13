import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { styles } from "../styles/authStyles";
import { FontAwesome } from "@expo/vector-icons";

interface College {
  id: string;
  name: string;
}

const collegesList: College[] = [
  { id: "1", name: "Faculdade de Minas (FAMINAS)" },
  { id: "2", name: "Universidade de São Paulo (USP)" },
  { id: "3", name: "Universidade Federal de Minas Gerais (UFMG)" },
  { id: "4", name: "Pontifícia Universidade Católica (PUC-SP)" },
];

export default function SignupScreen() {
  const { signup } = useAuth();
  const navigation = useNavigation<any>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(false);
  const [collegeModalVisible, setCollegeModalVisible] = useState(false);

  async function handleSignup() {
    if (!firstName || !lastName || !email || !password || !college) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, firstName + " " + lastName);
      // Apenas alert, navegação já é feita no AuthContext
      Alert.alert("Sucesso", "Cadastro realizado!");
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardSmall}>
        <Text style={styles.title}>Cadastro</Text>

        <TextInput
          style={styles.inputSmall}
          placeholder="Nome"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.inputSmall}
          placeholder="Sobrenome"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.inputSmall}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.inputSmall}
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Seleção de faculdade */}
        <TouchableOpacity
          style={[styles.inputSmall, { justifyContent: "center" }]}
          onPress={() => setCollegeModalVisible(true)}
        >
          <Text style={{ color: college ? "#000" : "#000000ff" }}>
            {college ? college.name : "Selecione sua Faculdade"}
          </Text>
        </TouchableOpacity>

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
            Fazer login
          </Text>
        </Text>

        {/* Botões sociais */}
        <View style={styles.socialContainerSmall}>
          <TouchableOpacity
            style={[styles.socialButtonSmall, { backgroundColor: "#DB4437" }]}
            onPress={() => Alert.alert("Cadastro com Google em breve!")}
          >
            <FontAwesome name="google" size={16} color="#fff" />
            <Text style={styles.socialTextSmall}> Cadastrar-se com Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialButtonSmall, { backgroundColor: "#3b5998" }]}
            onPress={() => Alert.alert("Cadastro com Facebook em breve!")}
          >
            <FontAwesome name="facebook" size={16} color="#fff" />
            <Text style={styles.socialTextSmall}> Cadastrar-se com Facebook</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de seleção de faculdade */}
      <Modal visible={collegeModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback
          onPress={() => setCollegeModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                width: "80%",
                borderRadius: 8,
                maxHeight: "50%",
              }}
            >
              <FlatList
                data={collegesList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      padding: 15,
                      borderBottomWidth: 1,
                      borderBottomColor: "#ddd",
                    }}
                    onPress={() => {
                      setCollege(item);
                      setCollegeModalVisible(false);
                    }}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
