import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../models/User";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const storedUser = await AsyncStorage.getItem("@user");
      if (storedUser) setUser(JSON.parse(storedUser));
      setLoading(false);
    }
    loadUser();
  }, []);

  async function login(email: string, password: string) {
    if (!email || !password) {
      alert("Preencha todos os campos!");
      return;
    }
    const loggedUser: User = { id: "1", email, name: "Usuário Teste" };
    await AsyncStorage.setItem("@user", JSON.stringify(loggedUser));
    setUser(loggedUser);
  }

  async function signup(email: string, password: string, name?: string) {
    if (!email || !password) {
      alert("Preencha todos os campos!");
      return;
    }
    const newUser: User = { id: Date.now().toString(), email, name };
    await AsyncStorage.setItem("@user", JSON.stringify(newUser));
    setUser(newUser);
  }

  async function logout() {
    await AsyncStorage.removeItem("@user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
