import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../navigation/AppNavigator";
import ApiService from "../services/ApiService";
import UserService from "../services/UserService";
import DatabaseService from "../services/DatabaseService";

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

const USER_ID_KEY = '@app:user_id';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Inicializa banco e verifica sessão ao carregar o app
  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    try {
      // 1. Inicializa o SQLite (cache local)
      await DatabaseService.initDatabase();
      
      // 2. Verifica se há token JWT salvo
      const isAuth = await ApiService.isAuthenticated();
      
      if (isAuth) {
        // 3. Busca dados atualizados do backend
        const userData = await ApiService.getMe();
        
        // 4. Salva ID do usuário
        await AsyncStorage.setItem(USER_ID_KEY, userData.id);
        
        // 5. Sincroniza dados no cache local (SQLite)
        await UserService.syncUserFromBackend(userData);
        
        setUser(userData);
        navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
      }
    } catch (error) {
      console.log("Não autenticado ou token expirado");
      // Limpa tokens inválidos
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
      // 1. Autentica no BACKEND (retorna token + dados do usuário)
      const userData = await ApiService.login(email, password);
      
      // 2. Salva ID do usuário
      await AsyncStorage.setItem(USER_ID_KEY, userData.id);
      
      // 3. Sincroniza dados no cache local (SQLite)
      await UserService.syncUserFromBackend(userData);
      
      setUser(userData);
      Alert.alert("Sucesso", `Bem-vindo(a), ${userData.name}!`);
      navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
    } catch (error: any) {
      const message = ApiService.handleError(error);
      Alert.alert("Erro no Login", message);
      console.error("Erro no login:", error);
    }
  }

  async function signup(
    email: string,
    password: string,
    name: string,
    handle: string,
    collegeId?: string
  ) {
    if (!email || !password || !name || !handle) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios!");
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Email inválido!");
      return;
    }

    // Validação de senha
    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres!");
      return;
    }

    // Validação de handle
    if (handle.length < 3) {
      Alert.alert("Erro", "O nome de usuário deve ter no mínimo 3 caracteres!");
      return;
    }

    try {
      // 1. Cadastra no BACKEND (retorna token + dados do usuário)
      const userData = await ApiService.signup({
        name,
        email,
        password,
        handle,
        collegeId,
      });

      // 2. Salva ID do usuário
      await AsyncStorage.setItem(USER_ID_KEY, userData.id);

      // 3. Sincroniza dados no cache local (SQLite)
      await UserService.syncUserFromBackend(userData);

      setUser(userData);
      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
      navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
    } catch (error: any) {
      const message = ApiService.handleError(error);
      Alert.alert("Erro no Cadastro", message);
      console.error("Erro no cadastro:", error);
    }
  }

  async function logout() {
    try {
      // 1. Limpa tokens JWT
      await ApiService.clearTokens();
      
      // 2. Limpa ID do AsyncStorage
      await AsyncStorage.removeItem(USER_ID_KEY);
      
      // 3. Limpa cache do SQLite (opcional - pode manter para próximo login)
      if (user?.id) {
        await UserService.clearUserCache(user.id);
      }
      
      setUser(null);
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  /**
   * Atualiza dados do usuário do backend
   */
  async function refreshUser() {
    try {
      const userData = await ApiService.getMe();
      await UserService.syncUserFromBackend(userData);
      setUser(userData);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
