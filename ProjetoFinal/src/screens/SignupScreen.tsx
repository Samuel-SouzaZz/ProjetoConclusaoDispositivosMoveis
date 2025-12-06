import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/ApiService";
import {
  AuthContainer,
  AuthShapesContainer,
  AuthCard,
  AuthBackButton,
  AuthTitle,
  AuthLink,
  AuthFormRow,
  AuthFormGroup,
  CollegeSelectModal,
} from "../components/Auth";
import { Button } from "../components/common";

interface College {
  id: string;
  name: string;
  acronym?: string;
  city?: string;
  state?: string;
}

function displayCollege(c: College): string {
  const acronym = (c.acronym || "").trim();
  const hasAcronymInName = acronym
    ? (c.name || "").toLowerCase().includes(`(${acronym.toLowerCase()})`)
    : false;
  return hasAcronymInName
    ? c.name
    : `${c.name}${acronym ? ` (${acronym})` : ""}`;
}

export default function SignupScreen() {
  const { signup } = useAuth();
  const navigation = useNavigation<any>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [college, setCollege] = useState<College | null>(null);
  const [collegesList, setCollegesList] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [collegeModalVisible, setCollegeModalVisible] = useState(false);

  useEffect(() => {
    loadColleges();
  }, []);

  async function loadColleges() {
    setLoadingColleges(true);
    try {
      const response: any = await ApiService.getColleges();
      const items = Array.isArray(response) ? response : response?.items || [];
      
      const mappedColleges: College[] = items.map((c: any) => ({
        id: c.id || c._id,
        name: c.name || "",
        acronym: c.acronym || null,
        city: c.city || null,
        state: c.state || null,
      }));
      
      setCollegesList(mappedColleges);
    } catch (error) {
      setCollegesList([
        { id: "1", name: "Faculdade de Minas", acronym: "FAMINAS", city: "Muriaé", state: "MG" },
        { id: "2", name: "Universidade de São Paulo", acronym: "USP", city: "São Paulo", state: "SP" },
        { id: "3", name: "Universidade Federal de Minas Gerais", acronym: "UFMG", city: "Belo Horizonte", state: "MG" },
        { id: "4", name: "Pontifícia Universidade Católica", acronym: "PUC-SP", city: "São Paulo", state: "SP" },
      ]);
    } finally {
      setLoadingColleges(false);
    }
  }

  async function handleSignup() {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Email inválido!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres!");
      return;
    }

    if (handle && handle.length > 0 && handle.length < 3) {
      Alert.alert("Erro", "O nome de usuário deve ter no mínimo 3 caracteres!");
      return;
    }

    setLoading(true);
    try {
      const finalHandle = handle.trim() || email.split("@")[0];
      const fullName = `${firstName} ${lastName}`.trim();

      await signup(
        email,
        password,
        fullName,
        finalHandle,
        college?.id
      );
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthShapesContainer shapes={["yellow-top", "orange-bottom"]} />

        <AuthContainer style={{ paddingTop: 40 }}>
          <AuthCard isSignup>
            <AuthBackButton onPress={() => navigation.navigate("Home")} />

            <AuthTitle title="Cadastro" />

            <View style={{ gap: 20 }}>
              <AuthFormRow>
                <AuthFormGroup>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome</Text>
                    <TextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Primeiro nome"
                      placeholderTextColor="#9ca3af"
                      textContentType="givenName"
                      autoComplete="name-given"
                    />
                  </View>
                </AuthFormGroup>
                <AuthFormGroup>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Sobrenome</Text>
                    <TextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Sobrenome"
                      placeholderTextColor="#9ca3af"
                      textContentType="familyName"
                      autoComplete="name-family"
                    />
                  </View>
                </AuthFormGroup>
              </AuthFormRow>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome de usuário (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={handle}
                  onChangeText={(text) => setHandle(text.toLowerCase().replace(/\s/g, ""))}
                  placeholder="joaosilva"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  textContentType="username"
                  autoComplete="username"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Faculdade</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setCollegeModalVisible(true)}
                  disabled={loadingColleges}
                >
                  <Text style={[styles.selectText, !college && styles.selectPlaceholder]}>
                    {loadingColleges
                      ? "Carregando..."
                      : college
                      ? displayCollege(college)
                      : "Selecione sua faculdade"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@mail.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textContentType="emailAddress"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    textContentType="newPassword"
                    autoComplete="password-new"
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repita sua senha"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    textContentType="newPassword"
                    autoComplete="password-new"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Button
              onPress={handleSignup}
              label="Cadastrar"
              loading={loading}
              disabled={loading}
              useGradient
              fullWidth
              style={{ marginTop: 8 }}
            />

            <AuthLink
              text="Já tem conta? "
              linkText="Fazer login"
              onPress={() => navigation.navigate("Login")}
            />
          </AuthCard>
        </AuthContainer>
      </ScrollView>

      <CollegeSelectModal
        visible={collegeModalVisible}
        onClose={() => setCollegeModalVisible(false)}
        colleges={collegesList}
        selectedCollegeId={college?.id}
        onSelect={setCollege}
        loading={loadingColleges}
        displayCollege={displayCollege}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 0,
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
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },
  selectPlaceholder: {
    color: "#9ca3af",
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
