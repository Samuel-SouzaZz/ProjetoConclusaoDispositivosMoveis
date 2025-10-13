import React, { createContext, useState, ReactNode, useContext } from "react";
import { Alert } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  async function login(email: string, password: string) {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }
    setUser({ name: "Usuário", email });
    Alert.alert("Sucesso", "Login realizado!");
    navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
  }

  async function signup(email: string, password: string) {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }
    setUser({ name: "Novo Usuário", email });
    Alert.alert("Sucesso", "Cadastro realizado!");
    navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
  }

  function logout() {
    setUser(null);
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
