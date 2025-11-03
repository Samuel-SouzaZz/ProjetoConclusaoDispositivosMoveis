import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme, colors, commonStyles } = useTheme();
  const navigation = useNavigation<any>();

  const [keepSignedIn, setKeepSignedIn] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[commonStyles.text, styles.sectionTitle]}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );

  const ItemRow = ({ label, right }: { label: string; right?: React.ReactNode }) => (
    <View style={[styles.itemRow, { borderBottomColor: colors.border }]}
      accessibilityRole="summary"
      accessibilityLabel={label}
    >
      <Text style={[commonStyles.text, styles.itemLabel]}>{label}</Text>
      <View>{right}</View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={[commonStyles.text, styles.title]}>Configurações</Text>

        <Section title="Aparência">
          <ItemRow
            label="Modo escuro"
            right={(
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
                accessibilityRole="switch"
                accessibilityLabel="Alternar modo escuro"
              />
            )}
          />
        </Section>

        <Section title="Preferências">
          <ItemRow
            label="Manter sessão ativa"
            right={(
              <Switch
                value={keepSignedIn}
                onValueChange={setKeepSignedIn}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={keepSignedIn ? colors.primary : '#f4f3f4'}
                accessibilityRole="switch"
                accessibilityLabel="Manter sessão ativa"
              />
            )}
          />
          <ItemRow
            label="Receber notificações"
            right={(
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
                accessibilityRole="switch"
                accessibilityLabel="Receber notificações"
              />
            )}
          />
        </Section>

        <Section title="Conta">
          <TouchableOpacity
            style={[styles.navButton, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('ProfileTab')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Ver perfil"
            accessibilityHint="Abrir a tela de perfil"
          >
            <Text style={[commonStyles.text, styles.navButtonText]}>Ver Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logoutButton]}
            onPress={logout}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            accessibilityHint="Encerrar sessão e voltar ao login"
          >
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </Section>

        <View style={styles.footerInfo}>
          <Text style={[commonStyles.text, styles.footerText]}>DevQuest · v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "700", opacity: 0.7, marginBottom: 8 },
  sectionCard: { borderRadius: 12, overflow: "hidden" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    backgroundColor: "transparent",
  },
  itemLabel: { fontSize: 16, fontWeight: "500" },
  logoutButton: {
    backgroundColor: "#ff4757",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  navButton: {
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  navButtonText: { fontSize: 16, fontWeight: "600" },
  footerInfo: { alignItems: "center", marginTop: 8 },
  footerText: { fontSize: 12, opacity: 0.6 },
});
