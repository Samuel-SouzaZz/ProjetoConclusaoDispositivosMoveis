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
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext"; // garante que você tenha esse contexto

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

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
      // Simulação de carregamento
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>
          👋 Olá, <Text style={styles.username}>{user?.name || "Usuário"}</Text>!
        </Text>
        <Text style={styles.subtitle}>Continue sua jornada e conquiste novos desafios.</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
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
            <Text style={styles.sectionTitle}>🔥 Progresso da Semana</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${weekProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{weekProgress}% concluído</Text>
          </View>

          {/* Recomendações */}
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>⭐ Recomendações</Text>
            {recommendations.map((rec) => (
              <View key={rec.id} style={styles.recommendationCard}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recInfo}>
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

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.navigate("Login" as never)}
      >
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  header: { marginTop: 30, marginBottom: 20 },
  welcome: { fontSize: 22, fontWeight: "700", color: "#333" },
  username: { color: "#6C63FF" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
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
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#333" },
  progressBar: {
    height: 12,
    borderRadius: 8,
    backgroundColor: "#ddd",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#6C63FF" },
  progressText: { textAlign: "right", marginTop: 6, color: "#666" },
  recommendationsSection: { marginVertical: 20 },
  recommendationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  recTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  recInfo: { fontSize: 13, color: "#666", marginVertical: 6 },
  btnStart: {
    backgroundColor: "#6C63FF",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
  logoutButton: {
    marginTop: 30,
    marginBottom: 40,
    alignSelf: "center",
    backgroundColor: "#ff4757",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
