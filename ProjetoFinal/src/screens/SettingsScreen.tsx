import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme, colors, commonStyles } = useTheme();

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.content}>
        <Text style={[commonStyles.text, styles.title]}>Configurações</Text>
        
        <View style={[commonStyles.card, styles.settingItem]}>
          <Text style={[commonStyles.text, styles.settingText]}>Modo Escuro</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  settingText: {
    fontSize: 18,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#ff4757",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
