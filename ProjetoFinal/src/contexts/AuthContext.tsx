// AuthContext.tsx
import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import ApiService from "../services/ApiService";
import UserService from "../services/UserService";
import DatabaseService from "../services/DatabaseService";
import { RootStackParamList } from "../navigation/AppNavigator";

interface User {
  id: string;
  name: string;
  email: string;
  handle?: string;
  collegeId?: string | null;
  level: number;
  xpTotal: number;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, handle: string, collegeId?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const USER_ID_KEY = "@app:user_id";
const BIOMETRIC_TOKEN_KEY = "app_biometric_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    try {
      await DatabaseService.initDatabase();

      const biometricToken = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
      if (biometricToken) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && enrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Autentique-se para continuar",
          });

          if (result.success) {
            const userData = await ApiService.getMe();
            setUser(userData);
            setLoading(false);
            return;
          }
        }
      }

      const isAuth = await ApiService.isAuthenticated();
      if (isAuth) {
        const userData = await ApiService.getMe();
        await AsyncStorage.setItem(USER_ID_KEY, userData.id);
        await UserService.syncUserFromBackend(userData);
        setUser(userData);
      }
    } catch (error) {
      await ApiService.clearTokens();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const { user: userData, tokens } = await ApiService.login(email, password);

      // Garante usuário consistente do backend
      const me = await ApiService.getMe();

      await AsyncStorage.setItem(USER_ID_KEY, me.id);
      await UserService.syncUserFromBackend(me);

      setUser(me);
      Alert.alert("Sucesso", `Bem-vindo(a), ${me.name}!`);

      // Pergunta ao usuário se quer salvar para biometria
      Alert.alert(
        "Acesso Biométrico",
        "Deseja permitir login por biometria nas próximas vezes?",
        [
          { text: "Não", style: "cancel" },
          {
            text: "Sim",
            onPress: async () => {
              await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, tokens.accessToken);
            },
          },
        ]
      );
    } catch (error: any) {
      const message = ApiService.handleError(error);
      Alert.alert("Erro no Login", message);
      
    }
  }

  async function signup(email: string, password: string, name: string, handle: string, collegeId?: string) {
    if (!email || !password || !name || !handle) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Email inválido!");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres!");
      return;
    }

    if (handle.length < 3) {
      Alert.alert("Erro", "O nome de usuário deve ter no mínimo 3 caracteres!");
      return;
    }

    try {
      const { user: userData, tokens } = await ApiService.signup({ name, email, password, handle, collegeId });
      await AsyncStorage.setItem(USER_ID_KEY, userData.id);
      await UserService.syncUserFromBackend(userData);

      setUser(userData);
      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");

      // Pergunta biometria após cadastro
      Alert.alert(
        "Acesso Biométrico",
        "Deseja permitir login por biometria nas próximas vezes?",
        [
          { text: "Não", style: "cancel" },
          {
            text: "Sim",
            onPress: async () => {
              await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, tokens.accessToken);
            },
          },
        ]
      );
    } catch (error: any) {
      const message = ApiService.handleError(error);
      Alert.alert("Erro no Cadastro", message);
      
    }
  }

  async function logout() {
    try {
      await ApiService.clearTokens();
      await AsyncStorage.removeItem(USER_ID_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);

      if (user?.id) await UserService.clearUserCache(user.id);

      setUser(null);
    } catch (error) {
      
    }
  }

  async function refreshUser() {
    try {
      const userData = await ApiService.getMe();
      await UserService.syncUserFromBackend(userData);
      setUser(userData);
    } catch (error) {
      
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Export nomeado correto para o LoginScreen
export function useAuth() {
  return useContext(AuthContext);
}
