import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/ApiService";
import DatabaseService from "../services/DatabaseService";

const { width } = Dimensions.get("window");

interface StatCard {
  id: string;
  label: string;
  value: number | string;
  icon: string;
  color: string;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  status: "Draft" | "Published";
  createdAt: string;
}

interface Submission {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  score: number;
  status: "Accepted" | "Rejected" | "Pending";
  xp: number;
  submittedAt: string;
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"exercises" | "solved">("exercises");
  const [filter, setFilter] = useState<"all" | "drafts" | "published">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [profile, setProfile] = useState<any>(null);
  const [statCards, setStatCards] = useState<StatCard[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getUserCompleteProfile();
      
      setProfile(data.user);
      
      // Cards de estatísticas
      setStatCards([
        { id: "1", label: "Criados", value: data.stats.exercisesCreated || 0, icon: "create", color: "#4A90E2" },
        { id: "2", label: "Resolvidos", value: data.stats.exercisesSolved || 0, icon: "checkmark-circle", color: "#4CAF50" },
        { id: "3", label: "XP Total", value: data.user.xpTotal || 0, icon: "flash", color: "#FFD700" },
        { id: "4", label: "Taxa Sucesso", value: `${data.stats.successRate || 0}%`, icon: "stats-chart", color: "#FF9800" },
      ]);
      
      setExercises(data.exercises || []);
      setSubmissions(data.submissions || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const navigateToExercise = (exerciseId: string, isEdit: boolean) => {
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredExercises = exercises.filter(ex => {
    if (filter === "drafts") return ex.status === "Draft";
    if (filter === "published") return ex.status === "Published";
    return true;
  });

  const StatCard = ({ item }: { item: StatCard }) => (
    <View style={[styles.statCard, { shadowColor: item.color }]}>
      <Ionicons name={item.icon as any} size={24} color={item.color} />
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  );

  const ExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => navigateToExercise(item.id, true)}
    >
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, item.status === "Published" ? styles.badgePublished : styles.badgeDraft]}>
          <Text style={styles.badgeText}>{item.status === "Published" ? "📢 Publicado" : "📝 Rascunho"}</Text>
        </View>
      </View>
      <Text style={styles.exerciseDescription} numberOfLines={2}>{item.description}</Text>
      <View style={styles.exerciseFooter}>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const SubmissionItem = ({ item }: { item: Submission }) => (
    <TouchableOpacity
      style={styles.submissionItem}
      onPress={() => navigateToExercise(item.exerciseId, false)}
    >
      <View style={styles.submissionHeader}>
        <Text style={styles.submissionTitle}>{item.exerciseTitle}</Text>
        <View style={[styles.statusBadge, item.status === "Accepted" ? styles.badgeAccepted : styles.badgeRejected]}>
          <Text style={styles.badgeText}>{item.status === "Accepted" ? "✅ Aceito" : "❌ Rejeitado"}</Text>
        </View>
      </View>
      <View style={styles.submissionFooter}>
        <View style={styles.submissionStats}>
          <Text style={styles.scoreText}>{item.score}%</Text>
          <Text style={styles.xpText}>+{item.xp} XP</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.submittedAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil": return "#E8F5E8";
      case "Médio": return "#FFF3E0";
      case "Difícil": return "#FFEBEE";
      default: return "#E8F5E8";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={40} color="#fff" />
              )}
            </View>
            <View style={styles.editIcon}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{profile?.name || "Usuário"}</Text>
          <Text style={styles.userHandle}>@{profile?.handle || "user"}</Text>
          
          {/* Nível e XP */}
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Nível {profile?.level || 1}</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpBarFill, { width: `${(profile?.xpTotal || 0) % 1000 / 10}%` }]} />
            </View>
            <Text style={styles.xpText}>{profile?.xpTotal || 0} XP</Text>
          </View>
          
          {profile?.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}
        </View>

        {/* Cards de Estatísticas */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
          contentContainerStyle={styles.statsContent}
        >
          {statCards.map((card) => (
            <StatCard key={card.id} item={card} />
          ))}
        </ScrollView>

        {/* Abas */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "exercises" && styles.tabActive]}
            onPress={() => setActiveTab("exercises")}
          >
            <Text style={[styles.tabText, activeTab === "exercises" && styles.tabTextActive]}>
              Meus Exercícios
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "solved" && styles.tabActive]}
            onPress={() => setActiveTab("solved")}
          >
            <Text style={[styles.tabText, activeTab === "solved" && styles.tabTextActive]}>
              Resolvidos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtros (apenas para aba de exercícios) */}
        {activeTab === "exercises" && (
          <View style={styles.filtersContainer}>
            <TouchableOpacity
              style={[styles.filter, filter === "all" && styles.filterActive]}
              onPress={() => setFilter("all")}
            >
              <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filter, filter === "drafts" && styles.filterActive]}
              onPress={() => setFilter("drafts")}
            >
              <Text style={[styles.filterText, filter === "drafts" && styles.filterTextActive]}>
                Rascunhos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filter, filter === "published" && styles.filterActive]}
              onPress={() => setFilter("published")}
            >
              <Text style={[styles.filterText, filter === "published" && styles.filterTextActive]}>
                Publicados
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Conteúdo */}
        <View style={styles.contentContainer}>
          {activeTab === "exercises" ? (
            filteredExercises.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhum exercício encontrado</Text>
              </View>
            ) : (
              <FlatList
                data={filteredExercises}
                renderItem={({ item }) => <ExerciseItem item={item} />}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )
          ) : (
            submissions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhuma submissão encontrada</Text>
              </View>
            ) : (
              <FlatList
                data={submissions}
                renderItem={({ item }) => <SubmissionItem item={item} />}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )
          )}
        </View>

        {/* Badges (placeholder) */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.badgeItem}>
              <Ionicons name="trophy" size={32} color="#FFD700" />
              <Text style={styles.badgeLabel}>Primeiro Exercício</Text>
            </View>
            <View style={styles.badgeItem}>
              <Ionicons name="star" size={32} color="#FF9800" />
              <Text style={styles.badgeLabel}>10 Resolvidos</Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4A90E2",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  levelContainer: {
    width: "100%",
    maxWidth: 300,
    marginBottom: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  xpBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 8,
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  bio: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  statsScroll: {
    paddingVertical: 20,
  },
  statsContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  statCard: {
    width: width * 0.35,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#4A90E2",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  tabTextActive: {
    color: "#4A90E2",
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filter: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterActive: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: 200,
  },
  exerciseItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
    marginRight: 8,
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  exerciseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  submissionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  submissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  submissionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
    marginRight: 8,
  },
  submissionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  submissionStats: {
    flexDirection: "row",
    gap: 16,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A90E2",
  },
  xpText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFD700",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePublished: {
    backgroundColor: "#E8F5E8",
  },
  badgeDraft: {
    backgroundColor: "#FFF3E0",
  },
  badgeAccepted: {
    backgroundColor: "#E8F5E8",
  },
  badgeRejected: {
    backgroundColor: "#FFEBEE",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
  badgesSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  badgeItem: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginRight: 12,
    width: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});


