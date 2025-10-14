import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext"; // 🌙 Importa o contexto de tema
import { FontAwesome } from "@expo/vector-icons";

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const { theme, toggleTheme, isDarkMode } = useTheme(); // 🔥 Controle de tema

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    languages: 0,
    challenges: 0,
    exercises: 0,
  });
  const [weekProgress, setWeekProgress] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setTimeout(() => {
        setStats({ languages: 3, challenges: 5, exercises: 8 });
        setWeekProgress(60);
        setRecommendations([
          { id: 1, title: "Desafio React Native", difficulty: "Médio", xp: 120 },
          { id: 2, title: "API com Node.js", difficulty: "Difícil", xp: 200 },
        ]);
        setLoading(false);
      }, 1200);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar dados do Dashboard.");
    }
  }

  const colors = {
    background: isDarkMode ? "#121212" : "#f8f9fa",
    text: isDarkMode ? "#f1f1f1" : "#333",
    subtext: isDarkMode ? "#aaa" : "#666",
    card: isDarkMode ? "#1e1e1e" : "#fff",
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.welcome, { color: colors.text }]}>
              👋 Olá, <Text style={{ color: "#6C63FF" }}>{user?.name || "Usuário"}</Text>!
            </Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
              Continue sua jornada e conquiste novos desafios.
            </Text>

            {/* Botão de alternar tema */}
            <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
              <FontAwesome
                name={isDarkMode ? "sun-o" : "moon-o"}
                size={22}
                color={isDarkMode ? "#FFD700" : "#333"}
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 50 }} />
          ) : (
            <>
              {/* Estatísticas */}
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: "#6C63FF" }]}>
                  <Text style={styles.statNumber}>{stats.languages}</Text>
                  <Text style={styles.statLabel}>Linguagens</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: "#00BFA6" }]}>
                  <Text style={styles.statNumber}>{stats.challenges}</Text>
                  <Text style={styles.statLabel}>Desafios</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: "#FF6584" }]}>
                  <Text style={styles.statNumber}>{stats.exercises}</Text>
                  <Text style={styles.statLabel}>Exercícios</Text>
                </View>
              </View>

              {/* Progresso semanal */}
              <View style={styles.progressSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  🔥 Progresso da Semana
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${weekProgress}%` }]} />
                </View>
                <Text style={[styles.progressText, { color: colors.subtext }]}>
                  {weekProgress}% concluído
                </Text>
              </View>

              {/* Recomendações */}
              <View style={styles.recommendationsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  ⭐ Recomendações
                </Text>
                {recommendations.map((rec) => (
                  <View
                    key={rec.id}
                    style={[styles.recommendationCard, { backgroundColor: colors.card }]}
                  >
                    <Text style={[styles.recTitle, { color: colors.text }]}>
                      {rec.title}
                    </Text>
                    <Text style={[styles.recInfo, { color: colors.subtext }]}>
                      Dificuldade: {rec.difficulty} | {rec.xp} XP
                    </Text>
                    <TouchableOpacity
                      style={styles.btnStart}
                      onPress={() => Alert.alert("Iniciar", `Iniciando ${rec.title}...`)}
                    >
                      <Text style={styles.btnText}>Começar</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Botão de Logout */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
          >
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 50,
  },
  header: { marginBottom: 30, position: "relative" },
  themeButton: {
    position: "absolute",
    right: 5,
    top: 0,
    padding: 8,
  },
  welcome: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 14, marginTop: 4 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  statNumber: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  statLabel: { fontSize: 13, color: "#fff", marginTop: 4 },
  progressSection: { marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  progressBar: {
    height: 12,
    borderRadius: 8,
    backgroundColor: "#ddd",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#6C63FF" },
  progressText: { textAlign: "right", marginTop: 6 },
  recommendationsSection: { marginVertical: 20 },
  recommendationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  recTitle: { fontSize: 16, fontWeight: "600" },
  recInfo: { fontSize: 13, marginVertical: 6 },
  btnStart: {
    backgroundColor: "#6C63FF",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
  logoutButton: {
    marginTop: 30,
    alignSelf: "center",
    backgroundColor: "#ff4757",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
