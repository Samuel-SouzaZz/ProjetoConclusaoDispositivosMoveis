import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"; // para guardar o usuário localmente
import axios from "axios";

// ⚙️ URL base da sua API (ajuste conforme seu backend)
const API_URL = "http://localhost:3000"; // se for usar no celular, troque por IP da máquina

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signup: (data: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Carrega usuário salvo ao abrir o app
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("@waveup:user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // 🧾 Função de cadastro (Signup)
  const signup = async (data: any) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, data);
      const userData = response.data;
      setUser(userData);
      await AsyncStorage.setItem("@waveup:user", JSON.stringify(userData));
    } catch (error: any) {
      console.error("Erro no signup:", error.response?.data || error.message);
      throw error;
    }
  };

  // 🔐 Função de login
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const userData = response.data;
      setUser(userData);
      await AsyncStorage.setItem("@waveup:user", JSON.stringify(userData));
    } catch (error: any) {
      console.error("Erro no login:", error.response?.data || error.message);
      throw error;
    }
  };

  // 🚪 Logout
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("@waveup:user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para consumir o contexto facilmente
export const useAuth = () => useContext(AuthContext);
