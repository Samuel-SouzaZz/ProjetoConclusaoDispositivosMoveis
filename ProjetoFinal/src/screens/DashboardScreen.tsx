import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from "react-native";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../services/ApiService";
import { deriveLevelFromXp } from "../utils/levels";
import type { RootStackParamList } from "../navigation/AppNavigator";
import SafeScreen from "../components/SafeScreen";
import LoadingScreen from "../components/LoadingScreen";
import EmptyState from "../components/EmptyState";
import UserProfileButton from "../components/UserProfileButton";
import SearchBar from "../components/SearchBar";
import HeroSection from "../components/HeroSection";
import DashboardCard from "../components/DashboardCard";
import ExerciseCard from "../components/ExerciseCard";
import RankingModal from "../components/RankingModal";

// Tipo para navegação entre tabs
type TabParamList = {
  DashboardTab: undefined;
  ChallengesTab: { openCreate?: boolean } | undefined;
  ForumTab: undefined;
  GroupsTab: undefined;
  RankingTab: undefined;
  SettingsTab: undefined;
  ProfileTab: undefined;
};

type TabNavigationProp = BottomTabNavigationProp<TabParamList>;
type StackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AppNavigationProp = CompositeNavigationProp<TabNavigationProp, StackNavigationProp>;

interface DashboardStats {
  languages: number;
  challenges: number;
  forumsCreated: number;
  totalXp: number;
  level: number;
  weekProgress: number;
}

export default function DashboardScreen() {
  const { user, loading: authLoading } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<AppNavigationProp>();
  const { width } = useWindowDimensions();

  const [stats, setStats] = useState<DashboardStats>({
    languages: 0,
    challenges: 0,
    forumsCreated: 0,
    totalXp: 0,
    level: 1,
    weekProgress: 0,
  });
  interface Exercise {
    id: string;
    title: string;
    description?: string;
    difficulty: number;
    baseXp?: number;
    xp?: number;
    language?: { name: string };
    isCompleted?: boolean;
  }

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<{id: string; title: string} | null>(null);

  // Responsive layout metrics
  const layout = useMemo(() => {
    const gutter = 12;
    const horizontalPadding = 20 * 2;
    const availableWidth = width - horizontalPadding - gutter;
    const cardWidth = Math.max(280, Math.min(320, availableWidth * 0.85)); // 85% da largura disponível, mínimo 280, máximo 320
    return { gutter, cardWidth };
  }, [width]);

  // Calcular level baseado no XP
  const currentXpTotal = user?.xpTotal || 0;
  const currentLevel = useMemo(() => {
    return user?.level || deriveLevelFromXp(currentXpTotal);
  }, [user?.level, currentXpTotal]);

  const avatarUrl = useMemo(() => {
    if (!user?.avatarUrl) {
      return null;
    }
    
    if (user.avatarUrl.startsWith('http://') || user.avatarUrl.startsWith('https://')) {
      return user.avatarUrl;
    }
    
    const baseUrl = ApiService.getBaseUrl();
    const avatarPath = user.avatarUrl.startsWith('/') ? user.avatarUrl : `/${user.avatarUrl}`;
    return `${baseUrl}${avatarPath}`;
  }, [user?.avatarUrl]);

  // Filtrar exercícios baseado na busca (com debounce para melhor performance)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchQuery.trim()) {
        setExercises(allExercises);
      } else {
        const filtered = allExercises.filter((exercise) => {
          const title = exercise.title?.toLowerCase() || "";
          const description = exercise.description?.toLowerCase() || "";
          const query = searchQuery.toLowerCase();
          return title.includes(query) || description.includes(query);
        });
        setExercises(filtered);
      }
    }, 300); // Debounce de 300ms para melhor performance

    return () => clearTimeout(timeoutId);
  }, [searchQuery, allExercises]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const [statsData, exercisesData, completedIds] = await Promise.all([
        ApiService.getDashboardStats(user.id).catch(() => {
          return { languages: 0, challenges: 0, forumsCreated: 0, weekProgress: 0 };
        }),
        ApiService.getChallenges({ page: 1, limit: 8 }).catch(() => {
          return { items: [], total: 0 };
        }),
        ApiService.getMyCompletedExercises().catch(() => {
          return [];
        }),
      ]);

      setStats({
        ...statsData,
        totalXp: user.xpTotal || 0,
        level: user.level || deriveLevelFromXp(user.xpTotal || 0),
      });
      
      const exercisesList = exercisesData?.items || [];
      const normalizedExercises: Exercise[] = exercisesList.map((ex: Exercise) => ({
        ...ex,
        id: ex.id || (ex as any)._id || (ex as any).publicCode,
      }));
      
      setAllExercises(normalizedExercises);
      setExercises(normalizedExercises);
      setCompletedExerciseIds(completedIds || []);
    } catch (err) {
      setError(ApiService.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingScreen message="Carregando dashboard..." />;
  }

  if (!user) {
    return (
      <SafeScreen>
        <EmptyState
          icon="code-slash"
          title="Bem-vindo!"
          message="Faça login para continuar e acessar todos os recursos da plataforma."
          actionLabel="Fazer Login"
          onAction={() => navigation.navigate("Login")}
        />
      </SafeScreen>
    );
  }

  const completedIdsSet = new Set(completedExerciseIds);

  const handleOpenRanking = (exerciseId: string, exerciseTitle: string) => {
    setSelectedExercise({ id: exerciseId, title: exerciseTitle });
    setRankingModalVisible(true);
  };

  const handleCloseRanking = () => {
    setRankingModalVisible(false);
    setSelectedExercise(null);
  };

  return (
    <SafeScreen edges={['top']}>
      {/* Header com Perfil */}
      <View
        style={[styles.topHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        accessible={true}
        accessibilityRole="header"
      >
        <UserProfileButton
          avatarUrl={avatarUrl}
          avatarError={avatarError}
          userName={user?.name || 'Usuário'}
          userLevel={currentLevel}
          onPress={() => navigation.navigate("ProfileTab")}
          onAvatarError={() => setAvatarError(true)}
          onAvatarLoad={() => setAvatarError(false)}
          primaryColor={colors.primary}
          textColor={colors.text}
          secondaryTextColor={colors.textSecondary}
        />
      </View>

      {/* Barra de Pesquisa */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery("")}
        placeholder="Buscar..."
        backgroundColor={isDarkMode ? colors.cardSecondary : "#F0F0F0"}
        borderColor={colors.border}
        textColor={colors.text}
        iconColor={colors.textSecondary}
      />

      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <HeroSection
          userName={user?.name || 'Usuário'}
          userLevel={currentLevel}
          userXp={currentXpTotal}
          onCreateChallenge={() => navigation.navigate("ChallengesTab", { openCreate: true })}
          primaryColor={colors.primary}
          cardColor={colors.card}
        />

        {error && (
          <View
            style={[styles.errorAlert, { backgroundColor: colors.card }]}
            accessible={true}
            accessibilityRole="alert"
            accessibilityLabel={`Erro ao carregar dados: ${error}`}
            accessibilityLiveRegion="polite"
          >
            <Text style={[styles.errorText, { color: "#F44336" }]}>
              <Text style={styles.errorBold}>Erro ao carregar dados:</Text> {error}
            </Text>
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: colors.primary }]}
              onPress={loadDashboardData}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Tentar novamente"
              accessibilityHint="Toque duas vezes para recarregar os dados do dashboard"
            >
              <Text style={styles.refreshButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Seção Em Andamento */}
        <View
          style={styles.section}
          accessible={true}
          accessibilityRole="group"
          accessibilityLabel="Seção Em Andamento"
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="flame" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Em Andamento</Text>
          </View>
          <View style={styles.progressGrid}>
            <DashboardCard
              icon="code-slash"
              iconColor="#fff"
              iconBackgroundColor="#667eea"
              title={loading ? "..." : stats.languages.toString()}
              subtitle="Linguagens"
              onPress={() => navigation.navigate("ChallengesTab")}
              backgroundColor={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textSecondary}
              accessibilityLabel={`${stats.languages} linguagens utilizadas`}
              accessibilityHint="Toque duas vezes para ver a lista de desafios"
            />
            <DashboardCard
              icon="trophy"
              iconColor="#fff"
              iconBackgroundColor="#3b82f6"
              title={loading ? "..." : stats.challenges.toString()}
              subtitle="Desafios Publicados"
              onPress={() => navigation.navigate("ChallengesTab")}
              backgroundColor={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textSecondary}
              accessibilityLabel={`${stats.challenges} desafios publicados`}
              accessibilityHint="Toque duas vezes para ver seus desafios"
              style={{ marginLeft: 12 }}
            />
          </View>
        </View>

        {/* Seção Comunidade */}
        <View
          style={styles.section}
          accessible={true}
          accessibilityRole="group"
          accessibilityLabel="Seção Comunidade"
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Comunidade</Text>
          </View>
          <Text
            style={[styles.sectionDescription, { color: colors.textSecondary }]}
            accessible={true}
            accessibilityRole="text"
          >
            Participe de grupos de estudo e fóruns de discussão
          </Text>
          <View style={styles.progressGrid}>
            <DashboardCard
              icon="people"
              iconColor="#fff"
              iconBackgroundColor="#10b981"
              title="Grupos"
              subtitle="Estude em grupo e compartilhe conhecimento"
              onPress={() => navigation.navigate("GroupsTab")}
              backgroundColor={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textSecondary}
              accessibilityLabel="Acessar grupos de estudo"
              accessibilityHint="Toque duas vezes para ver e participar de grupos"
            />
            <DashboardCard
              icon="chatbubbles"
              iconColor="#fff"
              iconBackgroundColor="#667eea"
              title={loading ? "..." : stats.forumsCreated.toString()}
              subtitle="Fóruns Criados"
              onPress={() => navigation.navigate("ForumTab")}
              backgroundColor={colors.card}
              textColor={colors.text}
              subtitleColor={colors.textSecondary}
              accessibilityLabel={`${stats.forumsCreated} fóruns criados por você`}
              accessibilityHint="Toque duas vezes para acessar fóruns de discussão"
              style={{ marginLeft: 12 }}
            />
          </View>
        </View>

        {/* Seção Desafios Publicados */}
        <View
          style={[styles.section, { marginBottom: 100 }]}
          accessible={true}
          accessibilityRole="group"
          accessibilityLabel="Seção Desafios Publicados"
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="code-slash" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Desafios Publicados</Text>
          </View>
          <Text
            style={[styles.sectionDescription, { color: colors.textSecondary }]}
            accessible={true}
            accessibilityRole="text"
          >
            Todos os desafios disponíveis na plataforma
          </Text>
          {loading ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              style={styles.carouselScrollView}
              accessible={true}
              accessibilityRole="list"
              accessibilityLabel="Carregando desafios"
            >
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[styles.exerciseCardSkeleton, { backgroundColor: colors.card, marginRight: 12, width: layout.cardWidth }]}
                  accessible={true}
                  accessibilityLabel={`Carregando desafio ${i} de 4`}
                >
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ))}
            </ScrollView>
          ) : exercises.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              style={styles.carouselScrollView}
              accessible={true}
              accessibilityRole="list"
              accessibilityLabel={`Lista de ${exercises.length} desafios disponíveis`}
            >
              {exercises.map((exercise) => {
                const exerciseId = exercise.id || exercise._id || exercise.publicCode;
                const isCompleted = completedIdsSet.has(String(exerciseId)) || exercise.isCompleted === true;

                return (
                  <ExerciseCard
                    key={exerciseId || exercise.publicCode || `exercise-${Math.random()}`}
                    title={exercise.title}
                    description={exercise.description}
                    difficulty={exercise.difficulty}
                    xp={exercise.baseXp || exercise.xp || 0}
                    language={exercise.language?.name}
                    isCompleted={isCompleted}
                    onPress={() => {
                      if (exerciseId) {
                        try {
                          navigation.navigate("ChallengeDetails", { exerciseId: String(exerciseId) });
                        } catch (navError) {
                          Alert.alert('Erro', 'Não foi possível abrir o desafio. Tente novamente.');
                        }
                      } else {
                        Alert.alert('Erro', 'ID do desafio não encontrado.');
                      }
                    }}
                    onRankingPress={() => handleOpenRanking(String(exerciseId), exercise.title)}
                    width={layout.cardWidth}
                    backgroundColor={colors.card}
                    textColor={colors.text}
                    secondaryTextColor={colors.textSecondary}
                    primaryColor={colors.primary}
                    borderColor={colors.border}
                    cardSecondaryColor={colors.cardSecondary}
                  />
                );
              })}
            </ScrollView>
          ) : (
            <View
              style={[styles.noExercises, { backgroundColor: colors.card }]}
              accessible={true}
              accessibilityRole="alert"
              accessibilityLabel="Nenhum desafio disponível no momento"
            >
              <Ionicons name="folder-open-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.noExercisesText, { color: colors.textSecondary }]}>
                Nenhum desafio disponível no momento.
              </Text>
              <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: colors.primary }]}
                onPress={loadDashboardData}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Recarregar desafios"
                accessibilityHint="Toque duas vezes para tentar carregar os desafios novamente"
              >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.refreshButtonText}>Recarregar</Text>
            </TouchableOpacity>
          </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Ranking */}
      {selectedExercise && (
        <RankingModal
          visible={rankingModalVisible}
          onClose={handleCloseRanking}
          exerciseId={selectedExercise.id}
          exerciseTitle={selectedExercise.title}
        />
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  // Top Header
  topHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  // Sections
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  sectionDescription: {
    fontSize: 12,
    marginBottom: 12,
    marginTop: -6,
  },
  // Progress Grid
  progressGrid: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  // Exercises Carousel
  carouselScrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  carouselContainer: {
    paddingRight: 20,
  },
  exerciseCardSkeleton: {
    width: 280,
    borderRadius: 16,
    padding: 16,
    minHeight: 240,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  noExercises: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  noExercisesText: {
    fontSize: 16,
    textAlign: "center",
  },
  errorAlert: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F44336",
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
  },
  errorBold: {
    fontWeight: "bold",
  },
  refreshButton: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
