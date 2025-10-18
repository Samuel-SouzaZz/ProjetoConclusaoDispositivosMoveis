import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import BottomNavigation from "../components/BottomNavigation";

export default function SettingsScreen() {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Configurações</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
      <BottomNavigation activeRoute="Settings" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: "#ff4757",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
