import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/authStyles";

const { height } = Dimensions.get("window");

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
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [collegeModalVisible, setCollegeModalVisible] = useState(false);

  async function handleSignup() {
    if (!firstName || !lastName || !handle || !email || !password || !college) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      await signup(
        email,
        password,
        firstName + " " + lastName,
        handle,
        college.id
      );
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível cadastrar.");
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Botão Voltar */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.container}>
          <View style={styles.contentSignup}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>
              Junte-se a nós e comece sua jornada de aprendizado
            </Text>

            {/* Nome */}
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.inputSignup}
              placeholder="Seu primeiro nome"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
            />

            {/* Sobrenome */}
            <Text style={styles.label}>Sobrenome</Text>
            <TextInput
              style={styles.inputSignup}
              placeholder="Seu sobrenome"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
            />

            {/* Nome de usuário */}
            <Text style={styles.label}>Nome de usuário</Text>
            <TextInput
              style={styles.inputSignup}
              placeholder="joaosilva (sem espaços)"
              placeholderTextColor="#999"
              value={handle}
              onChangeText={(text) =>
                setHandle(text.toLowerCase().replace(/\s/g, ""))
              }
              autoCapitalize="none"
            />

            {/* E-mail */}
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.inputSignup}
              placeholder="seu@mail.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Senha */}
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainerSignup}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mínimo 6 caracteres"
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

            {/* Faculdade */}
            <Text style={styles.label}>Faculdade</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setCollegeModalVisible(true)}
            >
              <Text
                style={college ? styles.selectText : styles.selectPlaceholder}
              >
                {college ? college.name : "Selecione sua faculdade"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>

            {/* Botão Cadastrar */}
            <TouchableOpacity
              style={[styles.buttonSignup, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Rodapé */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerLink}>Fazer login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de seleção de faculdade */}
      <Modal
        visible={collegeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCollegeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione sua faculdade</Text>
              <TouchableOpacity
                onPress={() => setCollegeModalVisible(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={collegesList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.collegeItem}
                  onPress={() => {
                    setCollege(item);
                    setCollegeModalVisible(false);
                  }}
                >
                  <Text style={styles.collegeItemText}>{item.name}</Text>
                  {college?.id === item.id && (
                    <Ionicons name="checkmark" size={20} color="#3B5BDB" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
