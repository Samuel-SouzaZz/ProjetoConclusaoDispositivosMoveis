import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "../services/ApiService";
import UserService from "../services/UserService";
import DatabaseService from "../services/DatabaseService";
import { RootStackParamList } from "../navigation/AppNavigator";

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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, name: string, handle: string, collegeId?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const USER_ID_KEY = "app_user_id";

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

      const tokens = await ApiService.getTokens();
      if (tokens.accessToken) {
        try {
          const userData = await ApiService.getMe();
          if (userData && userData.id) {
            await AsyncStorage.setItem(USER_ID_KEY, userData.id);
            try {
              await UserService.syncUserFromBackend(userData);
            } catch (syncError) {}
            setUser(userData);
          }
        } catch (error: any) {
          if (tokens.refreshToken) {
            try {
              const newTokens = await ApiService.refreshTokens(tokens.refreshToken);
              await ApiService.saveTokens(newTokens.accessToken, newTokens.refreshToken);
              
              const userData = await ApiService.getMe();
              if (userData && userData.id) {
                await AsyncStorage.setItem(USER_ID_KEY, userData.id);
                try {
                  await UserService.syncUserFromBackend(userData);
                } catch (syncError) {
                  // Ignora erro
                }
                setUser(userData);
              }
            } catch (refreshError) {
              await ApiService.clearTokens();
            }
          } else {
            await ApiService.clearTokens();
          }
        }
      }
    } catch (error) {
      await ApiService.clearTokens();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string, rememberMe: boolean = true) {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const { user: userData, tokens } = await ApiService.login(email, password, rememberMe);

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
        // Ignora erro
      }

      setUser(me);
      Alert.alert("Sucesso", `Bem-vindo(a), ${me.name || 'Usuário'}!`);
    } catch (error) {
      const message = ApiService.handleError(error);
      Alert.alert("Erro no Login", message);
      throw error;
    }
  }

  async function signup(email: string, password: string, name: string, handle: string, collegeId?: string) {
    if (!email || !password || !name) {
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

    if (handle && handle.trim().length > 0 && handle.trim().length < 3) {
      Alert.alert("Erro", "O nome de usuário deve ter no mínimo 3 caracteres!");
      return;
    }

    const finalHandle = handle && handle.trim() ? handle.trim() : email.split("@")[0];

    try {
      const { user: userData } = await ApiService.signup({ name, email, password, handle: finalHandle, collegeId });

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
        // Ignora erro
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
      await ApiService.logout();
      await AsyncStorage.removeItem(USER_ID_KEY);

      if (user?.id) await UserService.clearUserCache(user.id);

      setUser(null);
    } catch (error) {
      try {
        await ApiService.clearTokens();
        await AsyncStorage.removeItem(USER_ID_KEY);
        setUser(null);
      } catch (clearError) {}
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}