import React, { useState, useEffect,useCallback } from "react";
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
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";
import DatabaseService from "../services/DatabaseService";
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get("window");

interface StatCard {
  id: string;
  label: string;
  value: number | string;
  icon: string;
  color: string;
}

interface Challenge {
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
  const { commonStyles, colors } = useTheme();
  const [activeTab, setActiveTab] = useState<"challenges" | "solved">("challenges");
  const [filter, setFilter] = useState<"all" | "drafts" | "published">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [statCards, setStatCards] = useState<StatCard[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getUserCompleteProfile();
      
      setProfile(data.user);
      
      setStatCards([
        { id: "1", label: "Criados", value: data.stats.exercisesCreated || 0, icon: "create", color: colors.primary },
        { id: "2", label: "Resolvidos", value: data.stats.exercisesSolved || 0, icon: "checkmark-circle", color: "#4CAF50" },
        { id: "3", label: "XP Total", value: data.user.xpTotal || 0, icon: "flash", color: colors.xp },
        { id: "4", label: "Taxa Sucesso", value: `${data.stats.successRate || 0}%`, icon: "stats-chart", color: "#FF9800" },
      ]);
      
    setChallenges(data.exercises || []);
    setSubmissions(data.submissions || []);
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const navigateToChallenge = (challengeId: string, isEdit: boolean) => {
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredChallenges = challenges.filter(ch => {
    if (filter === "drafts") return ch.status === "Draft";
    if (filter === "published") return ch.status === "Published";
    return true;
  });

  const StatCard = ({ item }: { item: StatCard }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: item.color }]}>
      <Ionicons name={item.icon as any} size={24} color={item.color} />
      <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{item.label}</Text>
    </View>
  );

  const ChallengeItem = ({ item }: { item: Challenge }) => (
    <TouchableOpacity
      style={[styles.challengeItem, { backgroundColor: colors.card }]}
      onPress={() => navigateToChallenge(item.id, true)}
    >
      <View style={styles.challengeHeader}>
        <Text style={[styles.challengeTitle, { color: colors.text }]}>{item.title}</Text>
        <View style={[styles.statusBadge, item.status === "Published" ? styles.badgePublished : styles.badgeDraft]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>{item.status === "Published" ? "Publicado" : "Rascunho"}</Text>
        </View>
      </View>
      <Text style={[styles.challengeDescription, { color: colors.text }]} numberOfLines={2}>{item.description}</Text>
      <View style={styles.challengeFooter}>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
          <Text style={[styles.difficultyText, { color: colors.text }]}>{item.difficulty}</Text>
        </View>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const SubmissionItem = ({ item }: { item: Submission }) => (
    <TouchableOpacity
      style={[styles.submissionItem, { backgroundColor: colors.card }]}
      onPress={() => navigateToChallenge(item.exerciseId, false)}
    >
      <View style={styles.submissionHeader}>
        <Text style={[styles.submissionTitle, { color: colors.text }]}>{item.exerciseTitle}</Text>
        <View style={[styles.statusBadge, item.status === "Accepted" ? styles.badgeAccepted : styles.badgeRejected]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>{item.status === "Accepted" ? "Aceito" : "Rejeitado"}</Text>
        </View>
      </View>
      <View style={styles.submissionFooter}>
        <View style={styles.submissionStats}>
          <Text style={[styles.scoreText, { color: colors.primary }]}>{item.score}%</Text>
          <Text style={[styles.submissionXpText, { color: colors.xp }]}>+{item.xp} XP</Text>
        </View>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>{new Date(item.submittedAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil": return colors.easy;
      case "Médio": return colors.medium;
      case "Difícil": return colors.hard;
      default: return colors.easy;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={40} color="#fff" />
              )}
            </View>
            <View style={[styles.editIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.userName, { color: colors.text }]}>{profile?.name || "Usuário"}</Text>
          <Text style={[styles.userHandle, { color: colors.textSecondary }]}>@{profile?.handle || "user"}</Text>
          
          <View style={styles.levelContainer}>
            <Text style={[styles.levelText, { color: colors.text }]}>Nível {profile?.level || 1}</Text>
            <View style={[styles.xpBar, { backgroundColor: colors.border }]}>
              <View style={[styles.xpBarFill, { width: `${(profile?.xpTotal || 0) % 1000 / 10}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.levelXpText, { color: colors.textSecondary }]}>{profile?.xpTotal || 0} XP</Text>
          </View>
          
          {profile?.bio && (
            <Text style={[styles.bio, { color: colors.textSecondary }]}>{profile.bio}</Text>
          )}
        </View>

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

        <View style={[styles.tabsContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "challenges" && [styles.tabActive, { borderBottomColor: colors.primary }]]}
            onPress={() => setActiveTab("challenges")}
          >
            <Text style={[styles.tabText, activeTab === "challenges" && [styles.tabTextActive, { color: colors.primary }], { color: colors.textSecondary }]}>
              Meus Desafios
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "solved" && [styles.tabActive, { borderBottomColor: colors.primary }]]}
            onPress={() => setActiveTab("solved")}
          >
            <Text style={[styles.tabText, activeTab === "solved" && [styles.tabTextActive, { color: colors.primary }], { color: colors.textSecondary }]}>
              Resolvidos
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "challenges" && (
          <View style={[styles.filtersContainer, { backgroundColor: colors.background }]}>
            <TouchableOpacity
              style={[styles.filter, filter === "all" && [styles.filterActive, { backgroundColor: colors.primary }], { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setFilter("all")}
            >
              <Text style={[styles.filterText, filter === "all" && styles.filterTextActive, { color: colors.text }]}>
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filter, filter === "drafts" && [styles.filterActive, { backgroundColor: colors.primary }], { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setFilter("drafts")}
            >
              <Text style={[styles.filterText, filter === "drafts" && styles.filterTextActive, { color: colors.text }]}>
                Rascunhos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filter, filter === "published" && [styles.filterActive, { backgroundColor: colors.primary }], { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setFilter("published")}
            >
              <Text style={[styles.filterText, filter === "published" && styles.filterTextActive, { color: colors.text }]}>
                Publicados
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
          {activeTab === "challenges" ? (
            filteredChallenges.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhum desafio encontrado</Text>
              </View>
            ) : (
              <FlatList
                data={filteredChallenges}
                renderItem={({ item }) => <ChallengeItem item={item} />}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )
          ) : (
            submissions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhuma submissão encontrada</Text>
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

        <View style={[styles.badgesSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Conquistas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.badgeItem, { backgroundColor: colors.card }]}>
              <Ionicons name="trophy" size={32} color={colors.xp} />
              <Text style={[styles.badgeLabel, { color: colors.text }]}>Primeiro Desafio</Text>
            </View>
            <View style={[styles.badgeItem, { backgroundColor: colors.card }]}>
              <Ionicons name="star" size={32} color="#FF9800" />
              <Text style={[styles.badgeLabel, { color: colors.text }]}>10 Resolvidos</Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
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
    marginBottom: 8,
    textAlign: "center",
  },
  xpBar: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  xpBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  levelXpText: {
    fontSize: 12,
    textAlign: "center",
  },
  bio: {
    fontSize: 14,
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
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
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
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  tabTextActive: {
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
    borderWidth: 1,
  },
  filterActive: {
  },
  filterText: {
    fontSize: 14,
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
  challengeItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  challengeDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  challengeFooter: {
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
  },
  dateText: {
    fontSize: 12,
  },
  submissionItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  },
  submissionXpText: {
    fontSize: 14,
    fontWeight: "600",
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
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  badgesSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  badgeItem: {
    alignItems: "center",
    borderRadius: 12,
    padding: 20,
    marginRight: 12,
    width: 120,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
});

