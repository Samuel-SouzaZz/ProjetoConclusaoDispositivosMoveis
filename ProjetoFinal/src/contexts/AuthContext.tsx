import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import ApiService from "../services/ApiService";
import UserService from "../services/UserService";
import DatabaseService from "../services/DatabaseService";
import { RootStackParamList } from "../navigation/AppNavigator";
import { isBiometricEnabled, clearBiometricPreference } from "../utils/biometricPreferences";

export interface User {
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
  enableBiometricAuth: () => Promise<boolean>;
  disableBiometricAuth: () => Promise<void>;
  loginWithBiometrics: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const USER_ID_KEY = "@app:user_id";
const BIOMETRIC_TOKEN_KEY = "app_biometric_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    try {
      await DatabaseService.initDatabase();

      // Não fazer login biométrico automático no AuthContext
      // Deixar o LoginScreen fazer isso para ter melhor controle
      // Isso evita conflitos e garante que o Face ID seja solicitado corretamente

      // Não fazer login automático baseado apenas em token
      // O usuário deve fazer login manualmente ou via Face ID no LoginScreen

      const biometricEnabled = await isBiometricEnabled();
      if (biometricEnabled) {
        await loginWithBiometrics();
      }
    } catch (error) {
      await ApiService.clearTokens();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    // Se email e password estão vazios, verificar se já está autenticado (login biométrico)
    if (!email && !password) {
      // Validar token antes de fazer login automático
      const token = await ApiService.getToken();
      if (!token) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      // Validar se o token ainda é válido
      try {
        const userData = await ApiService.getMe();
        if (userData && userData.id) {
          await AsyncStorage.setItem(USER_ID_KEY, userData.id);
          try {
            await UserService.syncUserFromBackend(userData);
          } catch (syncError) {
            console.warn("Erro ao sincronizar com banco local:", syncError);
          }
          setUser(userData);
          return;
        }
      } catch (error: any) {
        // Token inválido ou expirado
        await ApiService.clearTokens();
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        throw error;
      }
    }

    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const { user: userData, tokens } = await ApiService.login(email, password);

      let me;
      try {
        me = await ApiService.getMe();
        if (!me || !me.id) {
          throw new Error("Dados do usuário inválidos");
        }
      } catch (getMeError) {
        me = userData;
        if (!me || !me.id) {
          throw new Error("Não foi possível obter dados do usuário");
        }
      }

      await AsyncStorage.setItem(USER_ID_KEY, me.id);

      try {
        await UserService.syncUserFromBackend(me);
      } catch (syncError) {
        // Erro no sync não deve impedir o login
      }

      setUser(me);
      Alert.alert("Sucesso", `Bem-vindo(a), ${me.name || 'Usuário'}!`);
    } catch (error) {
      const message = ApiService.handleError(error);
      Alert.alert("Erro no Login", message);
      throw error;
    }
  }

  async function enableBiometricAuth(): Promise<boolean> {
    try {

      const refreshToken = await ApiService.getRefreshToken?.();
      const accessToken = await ApiService.getToken();
      const tokenToSave = refreshToken || accessToken;

      if (!tokenToSave) {
        return false;
      }

      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, tokenToSave);
      } else {
        await AsyncStorage.setItem(BIOMETRIC_TOKEN_KEY, tokenToSave);
      }

      await AsyncStorage.setItem("@biometric_enabled", "true");
      return true;
    } catch (error) {
      console.warn("enableBiometricAuth error:", error);
      return false;
    }
  }

  async function disableBiometricAuth() {
    await clearBiometricPreference();
    await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
  }

  async function loginWithBiometrics(): Promise<boolean> {
    try {
      const enabled = await isBiometricEnabled();
      if (!enabled) return false;

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) return false;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Autentique-se para entrar",
        fallbackLabel: "Usar senha",
      });

      if (!result.success) return false;

      // ler token salvo
      const storedToken = Platform.OS !== "web"
        ? await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY)
        : await AsyncStorage.getItem(BIOMETRIC_TOKEN_KEY);

      if (!storedToken) return false;

      // configura ApiService com o token (usa setToken existente)
      await ApiService.setToken(storedToken);

      // obtém dados do usuário e define no estado
      const me = await ApiService.getMe();
      if (me && me.id) {
        setUser(me);
        return true;
      }

      return false;
    } catch (error) {
      console.warn("loginWithBiometrics error:", error);
      return false;
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
      const { user: userData } = await ApiService.signup({ name, email, password, handle, collegeId });

      let me;
      try {
        me = await ApiService.getMe();
        if (!me || !me.id) {
          throw new Error("Dados do usuário inválidos");
        }
      } catch (getMeError) {
        me = userData;
        if (!me || !me.id) {
          throw new Error("Não foi possível obter dados do usuário");
        }
      }

      await AsyncStorage.setItem(USER_ID_KEY, me.id);

      try {
        await UserService.syncUserFromBackend(me);
      } catch (syncError) {
        // Erro no sync não deve impedir o cadastro
      }

      setUser(me);
      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
    } catch (error) {
      const message = ApiService.handleError(error);
      Alert.alert("Erro no Cadastro", message);
      throw error;
    }
  }

  async function logout() {
    try {
      await ApiService.clearTokens();
      await AsyncStorage.removeItem(USER_ID_KEY);

      // SecureStore só funciona em plataformas móveis
      if (Platform.OS !== 'web') {
        try {
          await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
        } catch (secureStoreError) {
          // Ignora erros ao deletar token biométrico
        }
      }

      // Limpar preferência de biometria também
      try {
        await clearBiometricPreference();
      } catch (error) {
        // Ignora erros
      }

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
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser, enableBiometricAuth, disableBiometricAuth, loginWithBiometrics }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}