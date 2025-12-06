import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, User } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";
import { useFocusEffect } from '@react-navigation/native';
import { deriveLevelFromXp, getProgressToNextLevel } from "../utils/levels";
import * as ImagePicker from "expo-image-picker";
import IconImage from "../components/IconImage";
import ImagePickerOptionsModal from "../components/ImagePickerOptionsModal";
import CameraModal from "../components/CameraModal";

const { width } = Dimensions.get("window");

// Interfaces
interface Badge {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  type?: "gold" | "silver" | "bronze" | "special";
  earned?: boolean;
}

interface Title {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  minLevel?: number;
  minXp?: number;
}

interface UserTitleItem {
  title: string | Title;
  awardedAt?: string;
  active?: boolean;
}

interface Exercise {
  id: string;
  title: string;
  description?: string;
  difficulty?: number;
  baseXp?: number;
  status?: string;
}

type TabType = 'completed' | 'badges' | 'titles' | 'created';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { commonStyles, colors, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('completed');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleUploadAvatar = async (imageData: string) => {
    try {
      const dataUrl = `data:image/jpeg;base64,${imageData}`;
      await ApiService.uploadMyAvatar(dataUrl);
      await loadProfile();
      Alert.alert("Sucesso", "Foto de perfil atualizada!");
    } catch (err) {
      Alert.alert("Erro", "Não foi possível atualizar a foto de perfil.");
    }
  };

  const pickImageFromGallery = async () => {
    setShowImageOptions(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão", "Acesso necessário para suas imagens da galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      if (asset.base64) {
        await handleUploadAvatar(asset.base64);
      }
    }
  };

  const takePhotoWithCamera = () => {
    setShowImageOptions(false);
    setShowCamera(true);
  };

  const handleCameraPhoto = async (uri: string, base64?: string) => {
    if (base64) {
      await handleUploadAvatar(base64);
    }
  };

  const [profile, setProfile] = useState<User | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loginStreak, setLoginStreak] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [allTitles, setAllTitles] = useState<Title[]>([]);
  const [userTitles, setUserTitles] = useState<UserTitleItem[]>([]);
  const [loadingTitles, setLoadingTitles] = useState(true);
  const [titleFilter, setTitleFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [completedExercises, setCompletedExercises] = useState<Exercise[]>([]);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [createdExercises, setCreatedExercises] = useState<Exercise[]>([]);
  const [loadingCreated, setLoadingCreated] = useState(false);

  const loadBadges = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoadingBadges(true);
      const [allBadgesData, userBadgesData] = await Promise.all([
        ApiService.getAllBadges(),
        ApiService.getUserBadges(user.id),
      ]);
      
      const earnedBadgeIds = userBadgesData
        .map((ub: any) => {
          if (typeof ub.badge === "string" && ub.badge.trim().length > 0) {
            return ub.badge.trim();
          }
          const badgeId = ub.badge?._id || ub.badge?.id;
          if (badgeId && (typeof badgeId === 'string' || typeof badgeId === 'number')) {
            return String(badgeId);
          }
          return null;
        })
        .filter((id: any): id is string => id != null && typeof id === 'string' && id.trim().length > 0);
      
      setAllBadges(Array.isArray(allBadgesData) ? allBadgesData : []);
      setUserBadges(earnedBadgeIds);
    } catch (error) {
      setAllBadges([]);
      setUserBadges([]);
    } finally {
      setLoadingBadges(false);
    }
  }, [user?.id]);

  const loadTitles = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoadingTitles(true);
      const [titlesRes, userTitlesRes] = await Promise.all([
        ApiService.getAllTitles(),
        ApiService.getUserTitles(user.id),
      ]);
      
      setAllTitles(Array.isArray(titlesRes) ? titlesRes : []);
      setUserTitles(Array.isArray(userTitlesRes) ? userTitlesRes : []);
    } catch (error) {
      setAllTitles([]);
      setUserTitles([]);
    } finally {
      setLoadingTitles(false);
    }
  }, [user?.id]);

  const loadCompletedExercises = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoadingCompleted(true);
      const completedIds = await ApiService.getMyCompletedExercises();
      const exercisesPromises = completedIds.map((id: string) =>
        ApiService.getChallengeById(id).catch(() => null)
      );
      
      const exercises = await Promise.all(exercisesPromises);
      const validExercises = exercises.filter((ex): ex is Exercise => ex !== null);
      
      setCompletedExercises(validExercises);
      setCompletedCount(validExercises.length);
    } catch (error) {
      setCompletedExercises([]);
    } finally {
      setLoadingCompleted(false);
    }
  }, [user?.id]);

  const loadCreatedExercises = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoadingCreated(true);
      const response = await ApiService.getMyChallenges({ page: 1, limit: 1000 });
      const exercises = response?.items || response?.data || [];
      setCreatedExercises(Array.isArray(exercises) ? exercises : []);
    } catch (error) {
      setCreatedExercises([]);
    } finally {
      setLoadingCreated(false);
    }
  }, [user?.id]);

  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Carregar dados do usuário
      const userData = await ApiService.getMe();
      setProfile(userData);
      
      // Calcular nível e progresso
      const xpTotal = userData?.xpTotal || 0;
      const level = deriveLevelFromXp(xpTotal);
      const progress = getProgressToNextLevel(xpTotal, level);
      
      // Carregar estatísticas completas
      let stats = null;
      try {
        stats = await ApiService.getUserStats(user.id);
        if (stats) {
          setCompletedCount(stats.exercisesSolvedCount || stats.exercisesSolved || 0);
        }
      } catch {}
      
      // Nota: O endpoint /users/me/profile/complete não existe no backend
      // As estatísticas já são obtidas via getUserStats acima
      
      // Carregar ranking
      try {
        const leaderboard = await ApiService.getGeneralLeaderboard({ page: 1, limit: 1000 });
        const userIndex = leaderboard.findIndex((u: any) => 
          String(u.userId || u._id || u.id) === String(user.id)
        );
        if (userIndex !== -1) {
          setUserRank(userIndex + 1);
        }
      } catch {}
      
      // Carregar streak (se disponível)
      try {
        const streakData = await ApiService.getUserStats(user.id);
        if (streakData?.loginStreakCurrent) {
          setLoginStreak(streakData.loginStreakCurrent);
        }
      } catch {}
      
      // Carregar badges
      loadBadges();
      
      // Carregar títulos
      loadTitles();
      
      // Carregar exercícios completos
      loadCompletedExercises();
      
      // Carregar exercícios criados
      loadCreatedExercises();
      
    } catch (error) {
      // Erro ao carregar perfil - garantir que o loading seja desativado
      // Se houver erro, usar dados do user do contexto como fallback
      if (user) {
        setProfile(user);
      }
    } finally {
      setLoading(false);
    }
  }, [user, loadBadges, loadTitles, loadCompletedExercises, loadCreatedExercises]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  // Construir URL completa do avatar (mesma lógica do DashboardScreen e frontend web)
  // IMPORTANTE: Todos os hooks devem ser chamados ANTES de qualquer return condicional
  const avatarUrl = useMemo(() => {
    try {
      const url = profile?.avatarUrl || user?.avatarUrl;
      if (!url || url === null || url === undefined) {
        return null;
      }
      
      // Garantir que é uma string
      const urlString = typeof url === 'string' ? url : String(url);
      const trimmed = urlString.trim();
      
      if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
        return null;
      }
      
      // Preservar data URLs e blob URLs como estão
      if (/^(data:|blob:)/i.test(trimmed)) {
        return trimmed;
      }
      
      // Se já é uma URL completa (http/https), retornar direto
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
      
      // Se não, construir URL completa usando a base URL da API
      // getBaseUrl() retorna a base sem /api, então precisamos adicionar o caminho do avatar
      const baseUrl = ApiService.getBaseUrl();
      const avatarPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
      
      // Se o avatarPath começa com /uploads, usar direto
      // Caso contrário, pode ser necessário adicionar /uploads/avatars
      if (avatarPath.startsWith('/uploads')) {
        return `${baseUrl}${avatarPath}`;
      }
      
      // Tentar com /uploads/avatars se não começar com /
      return `${baseUrl}${avatarPath.startsWith('/') ? avatarPath : `/uploads/avatars/${avatarPath}`}`;
    } catch (error) {
      // Em caso de erro, retornar null para mostrar o ícone padrão
      return null;
    }
  }, [profile?.avatarUrl, user?.avatarUrl]);

  // Computações que dependem de dados (devem vir depois dos hooks)
  const xpTotal = profile?.xpTotal || user?.xpTotal || 0;
  const level = deriveLevelFromXp(xpTotal);
  const progress = getProgressToNextLevel(xpTotal, level);
  const activeTitle = userTitles.find((ut) => ut.active)?.title;
  const titleName = typeof activeTitle === 'object' && activeTitle && activeTitle.name ? activeTitle.name : 
                    (typeof activeTitle === 'string' && activeTitle.trim() ? activeTitle.trim() : '');
  const badgesCount = userBadges.length;
  const earnedBadges = allBadges.filter((b: Badge) => {
    const badgeId = String(b._id || b.id || '');
    return badgeId && badgeId.trim().length > 0 && userBadges.includes(badgeId);
  });

  // Return condicional APÓS todos os hooks
  if (loading && !profile) {
    return (
      <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={commonStyles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                {avatarUrl && typeof avatarUrl === 'string' && avatarUrl.length > 0 ? (
                  <Image 
                    source={{ uri: avatarUrl }} 
                    style={styles.avatarImage}
                    onError={() => {
                      // Se a imagem falhar ao carregar, não fazer nada (já mostra o ícone padrão)
                    }}
                  />
                ) : (
                  <Ionicons name="person" size={50} color="#fff" />
                )}
              </View>
              <TouchableOpacity
                onPress={() => setShowImageOptions(true)}
                style={[styles.editButton, { backgroundColor: colors.secondary || '#4A90E2' }]}
                accessibilityLabel="Editar foto de perfil"
                accessibilityRole="button"
              >
                <Ionicons name="pencil" size={14} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
              <View style={styles.usernameContainer}>
                <Text style={styles.username}>{profile?.name || user?.name || "Usuário"}</Text>
                {titleName && typeof titleName === 'string' && titleName.trim().length > 0 && (
                  <Text style={styles.userTitle}>[{titleName.trim()}]</Text>
                )}
              </View>
              <View style={styles.levelInfo}>
                <View style={styles.levelItem}>
                  <Text style={styles.levelLabel}>Nível</Text>
                  <Text style={styles.levelValue}>{level}</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>Próximo Nível</Text>
                  <Text style={styles.progressValue}>
                    {Math.max(0, progress.nextRequirement - progress.withinLevelXp)} XP
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statsCards}>
            <StatCard
              icon="trophy"
              value={userRank || 'N/A'}
              label="Rank"
              color="#FFD700"
              accessibilityLabel={`Rank ${userRank || 'não disponível'}`}
            />
            <StatCard
              icon="medal"
              value={badgesCount}
              label="Emblemas"
              color="#C0C0C0"
              accessibilityLabel={`${badgesCount} emblemas conquistados`}
            />
            <StatCard
              icon="flame"
              value={loginStreak}
              label="Streak"
              color="#FF6B6B"
              accessibilityLabel={`${loginStreak} dias de streak`}
            />
            <StatCard
              icon="checkmark-circle"
              value={completedCount}
              label="Completos"
              color="#4CAF50"
              accessibilityLabel={`${completedCount} desafios completos`}
            />
          </View>
        </View>

        <View style={[styles.tabsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            <TabButton
              icon="checkmark-circle"
              label="Completos"
              active={activeTab === 'completed'}
              onPress={() => setActiveTab('completed')}
              colors={colors}
              accessibilityLabel="Desafios completos"
            />
            <TabButton
              icon="medal"
              label="Badges"
              active={activeTab === 'badges'}
              onPress={() => setActiveTab('badges')}
              colors={colors}
              accessibilityLabel="Emblemas conquistados"
            />
            <TabButton
              icon="trophy"
              label="Títulos"
              active={activeTab === 'titles'}
              onPress={() => setActiveTab('titles')}
              colors={colors}
              accessibilityLabel="Títulos conquistados"
            />
            <TabButton
              icon="code"
              label="Criados"
              active={activeTab === 'created'}
              onPress={() => setActiveTab('created')}
              colors={colors}
              accessibilityLabel="Desafios criados"
            />
          </ScrollView>
        </View>

        <View style={[styles.contentArea, { backgroundColor: colors.background }]}>
          {activeTab === 'completed' && (
            <CompletedTab
              exercises={completedExercises}
              loading={loadingCompleted}
              colors={colors}
              isDarkMode={isDarkMode}
            />
          )}
          
          {activeTab === 'badges' && (
            <BadgesTab
              badges={earnedBadges}
              loading={loadingBadges}
              colors={colors}
              isDarkMode={isDarkMode}
            />
          )}
          
          {activeTab === 'titles' && (
            <TitlesTab
              allTitles={allTitles}
              userTitles={userTitles}
              filter={titleFilter}
              onFilterChange={setTitleFilter}
              loading={loadingTitles}
              colors={colors}
              isDarkMode={isDarkMode}
              userStats={profile?.stats || profile}
            />
          )}
          
          {activeTab === 'created' && (
            <CreatedTab
              exercises={createdExercises}
              loading={loadingCreated}
              colors={colors}
              isDarkMode={isDarkMode}
            />
          )}
        </View>
      </ScrollView>

      <ImagePickerOptionsModal
        visible={showImageOptions}
        onClose={() => setShowImageOptions(false)}
        onTakePhoto={takePhotoWithCamera}
        onPickFromGallery={pickImageFromGallery}
      />

      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onPhotoTaken={handleCameraPhoto}
      />
    </SafeAreaView>
  );
}

// Componente de Card de Estatística
const StatCard = ({ icon, value, label, color, accessibilityLabel }: {
  icon: string;
  value: string | number;
  label: string;
  color: string;
  accessibilityLabel?: string;
}) => {
  return (
    <View
      style={[styles.statCard, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="none"
    >
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={styles.statValue}>{value != null ? String(value) : ''}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

// Componente de Tab Button
const TabButton = ({ icon, label, active, onPress, colors, accessibilityLabel }: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
  colors: any;
  accessibilityLabel?: string;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.tab,
        active && [styles.tabActive, { borderBottomColor: colors.primary }],
      ]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={active ? colors.primary : colors.textSecondary}
      />
      <Text
        style={[
          styles.tabText,
          { color: active ? colors.primary : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Tab: Desafios Completos
const CompletedTab = ({ exercises, loading, colors, isDarkMode }: {
  exercises: Exercise[];
  loading: boolean;
  colors: any;
  isDarkMode: boolean;
}) => {
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Carregando desafios completos...
        </Text>
      </View>
    );
  }

  if (exercises.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-circle-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Nenhum desafio completo ainda
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.exercisesGrid}>
      {exercises.map((exercise, index) => (
        <ExerciseCard key={exercise.id || `exercise-${index}`} exercise={exercise} colors={colors} isDarkMode={isDarkMode} />
      ))}
    </View>
  );
};

// Tab: Badges
const BadgesTab = ({ badges, loading, colors, isDarkMode }: {
  badges: Badge[];
  loading: boolean;
  colors: any;
  isDarkMode: boolean;
}) => {
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Carregando emblemas...
        </Text>
      </View>
    );
  }

  if (badges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="lock-closed" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Nenhum emblema conquistado ainda
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.badgesGrid}>
      {badges.map((badge, index) => (
        <BadgeItem key={badge._id || badge.id || `badge-${index}`} badge={badge} colors={colors} isDarkMode={isDarkMode} />
      ))}
    </View>
  );
};

// Tab: Títulos
const TitlesTab = ({ allTitles, userTitles, filter, onFilterChange, loading, colors, isDarkMode, userStats }: {
  allTitles: Title[];
  userTitles: UserTitleItem[];
  filter: 'all' | 'earned' | 'locked';
  onFilterChange: (filter: 'all' | 'earned' | 'locked') => void;
  loading: boolean;
  colors: any;
  isDarkMode: boolean;
  userStats?: any;
}) => {
  // Função para calcular progresso do título (completa, baseada no web)
  const getTitleProgress = (title: Title) => {
    // Verificar se já foi conquistado
    const earned = userTitles.some((ut) => {
      const tid = typeof ut.title === 'string' ? ut.title : (ut.title as any)?._id || (ut.title as any)?.id;
      return tid && String(tid) === String(title._id || title.id);
    });
    
    if (earned) {
      return { earned: true, percent: 100, label: 'Conquistado' };
    }
    
    // Obter estatísticas do usuário
    const solved = Number(userStats?.exercisesSolvedCount || userStats?.exercisesSolved || 0);
    const created = Number(userStats?.exercisesCreatedCount || userStats?.exercisesCreated || 0);
    const forumComments = Number(userStats?.forumCommentsCount || userStats?.forumComments || 0);
    const forumTopics = Number(userStats?.forumTopicsCount || userStats?.forumTopics || 0);
    const groupsJoined = Number(userStats?.groupsJoinedCount || userStats?.groupsJoined || 0);
    const groupsCreated = Number(userStats?.groupsCreatedCount || userStats?.groupsCreated || 0);
    const loginStreak = Number(userStats?.loginStreakCurrent || userStats?.loginStreak || 0);
    
    const name = (title.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Resolver Desafios
    if (name === 'primeiro de muitos' || name.includes('primeiro de muitos')) {
      const needed = 1;
      const done = solved;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Falta ${falta} desafio` : 'Quase lá') };
    }
    if (name === 'dev em ascensao' || name.includes('dev em ascensao')) {
      const needed = 10;
      const done = solved;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} desafios` : 'Quase lá') };
    }
    if (name === 'destrava codigos' || name.includes('destrava codigos')) {
      const needed = 5;
      const done = solved;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} desafios` : 'Quase lá') };
    }
    if (name === 'mao na massa' || name.includes('mao na massa')) {
      const needed = 25;
      const done = solved;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} desafios` : 'Quase lá') };
    }
    if (name === 'ligeirinho da logica' || name.includes('ligeirinho da logica')) {
      const needed = 50;
      const done = solved;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} desafios` : 'Quase lá') };
    }
    if (name === 'lenda do terminal' || name.includes('lenda do terminal')) {
      const needed = 100;
      const done = solved;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} desafios` : 'Quase lá') };
    }
    
    // Criar Desafios
    if (name.includes('criador de bugs')) {
      const needed = 1;
      const done = created;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Falta ${falta} desafio criado` : 'Quase lá') };
    }
    if (name === 'arquiteto de ideias' || name.includes('arquiteto de ideias')) {
      const needed = 5;
      const done = created;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} desafios criados` : 'Quase lá') };
    }
    if (name === 'engenheiro de logica' || name.includes('engenheiro de logica')) {
      const needed = 10;
      const done = created;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} desafios criados` : 'Quase lá') };
    }
    if (name === 'sensei do codigo' || name.includes('sensei do codigo')) {
      const needed = 25;
      const done = created;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} desafios criados` : 'Quase lá') };
    }
    
    // Comentários no Fórum
    if (name === 'palpiteiro de primeira viagem' || name.includes('palpiteiro de primeira viagem')) {
      const needed = 1;
      const done = forumComments;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Falta ${falta} comentário` : 'Quase lá') };
    }
    if (name === 'conselheiro de plantao' || name.includes('conselheiro de plantao')) {
      const needed = 10;
      const done = forumComments;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} comentários` : 'Quase lá') };
    }
    if (name === 'guru da comunidade' || name.includes('guru da comunidade')) {
      const needed = 25;
      const done = forumComments;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} comentários` : 'Quase lá') };
    }
    
    // Tópicos do Fórum
    if (name === 'quebrador de gelo' || name.includes('quebrador de gelo')) {
      const needed = 1;
      const done = forumTopics;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Falta ${falta} tópico` : 'Quase lá') };
    }
    if (name === 'gerador de ideias' || name.includes('gerador de ideias')) {
      const needed = 5;
      const done = forumTopics;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} tópicos` : 'Quase lá') };
    }
    if (name === 'debatedor nato' || name.includes('debatedor nato')) {
      const needed = 10;
      const done = forumTopics;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} tópicos` : 'Quase lá') };
    }
    if (name === 'voz do forum' || name.includes('voz do forum')) {
      const needed = 25;
      const done = forumTopics;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} tópicos` : 'Quase lá') };
    }
    
    // Entrar em Grupos
    if (name === 'recruta do codigo' || name.includes('recruta do codigo')) {
      const needed = 1;
      const done = groupsJoined;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Falta ${falta} grupo` : 'Quase lá') };
    }
    if (name === 'integrador' || name.includes('integrador')) {
      const needed = 5;
      const done = groupsJoined;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} grupos` : 'Quase lá') };
    }
    if (name === 'conectadao' || name.includes('conectadao')) {
      const needed = 10;
      const done = groupsJoined;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} grupos` : 'Quase lá') };
    }
    
    // Criar Grupos
    if (name === 'fundador de equipe' || name.includes('fundador de equipe')) {
      const needed = 1;
      const done = groupsCreated;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Falta ${falta} grupo criado` : 'Quase lá') };
    }
    if (name === 'lider de stack' || name.includes('lider de stack')) {
      const needed = 3;
      const done = groupsCreated;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} grupos criados` : 'Quase lá') };
    }
    if (name === 'gestor do caos' || name.includes('gestor do caos')) {
      const needed = 5;
      const done = groupsCreated;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} grupos criados` : 'Quase lá') };
    }
    if (name === 'senhor das comunidades' || name.includes('senhor das comunidades')) {
      const needed = 10;
      const done = groupsCreated;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} grupos criados` : 'Quase lá') };
    }
    
    // Login consecutivo (streak)
    if (name === 'explorador do codigo' || name.includes('explorador do codigo')) {
      const needed = 1;
      const done = loginStreak;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Falta ${falta} dia` : 'Quase lá') };
    }
    if (name === 'dev constante' || name.includes('dev constante')) {
      const needed = 7;
      const done = loginStreak;
      const percent = Math.max(0, Math.min(100, Math.round((done / needed) * 100)));
      const falta = Math.max(0, needed - done);
      const earnedNow = done >= needed;
      return { earned: earnedNow, percent, label: earnedNow ? 'Conquistado' : (falta > 0 ? `Faltam ${falta} dias` : 'Quase lá') };
    }
    
    // Fallback para títulos não mapeados
    return { earned: false, percent: 0, label: 'Ação necessária' };
  };

  // Garantir que getTitleProgress sempre retorna um objeto válido com label sempre sendo string
  const safeGetTitleProgress = (title: Title) => {
    try {
      const result = getTitleProgress(title);
      if (!result || typeof result !== 'object') {
        return { earned: false, percent: 0, label: 'Ação necessária' };
      }
      return {
        earned: Boolean(result.earned),
        percent: typeof result.percent === 'number' && !isNaN(result.percent) ? Math.max(0, Math.min(100, result.percent)) : 0,
        label: typeof result.label === 'string' && result.label.trim().length > 0 ? result.label.trim() : 'Ação necessária'
      };
    } catch (error) {
      return { earned: false, percent: 0, label: 'Ação necessária' };
    }
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Carregando títulos...
        </Text>
      </View>
    );
  }

  // Sempre mostrar os filtros, mesmo quando não há resultados
  const filteredTitles = allTitles.filter((t) => {
    const { earned } = safeGetTitleProgress(t);
    if (filter === 'earned') return earned;
    if (filter === 'locked') return !earned;
    return true;
  });

  return (
    <View>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && [styles.filterButtonActive, { backgroundColor: colors.primary }],
            { borderColor: colors.border },
          ]}
          onPress={() => onFilterChange('all')}
          accessibilityLabel="Filtrar todos os títulos"
          accessibilityRole="button"
          accessibilityState={{ selected: filter === 'all' }}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'earned' && [styles.filterButtonActive, { backgroundColor: colors.primary }],
            { borderColor: colors.border },
          ]}
          onPress={() => onFilterChange('earned')}
          accessibilityLabel="Filtrar títulos conquistados"
          accessibilityRole="button"
          accessibilityState={{ selected: filter === 'earned' }}
        >
          <Text style={[styles.filterText, filter === 'earned' && styles.filterTextActive]}>
            Conquistados
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'locked' && [styles.filterButtonActive, { backgroundColor: colors.primary }],
            { borderColor: colors.border },
          ]}
          onPress={() => onFilterChange('locked')}
          accessibilityLabel="Filtrar títulos bloqueados"
          accessibilityRole="button"
          accessibilityState={{ selected: filter === 'locked' }}
        >
          <Text style={[styles.filterText, filter === 'locked' && styles.filterTextActive]}>
            Bloqueados
          </Text>
        </TouchableOpacity>
      </View>

      {filteredTitles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {filter === 'earned' 
              ? 'Nenhum título conquistado ainda'
              : filter === 'locked'
              ? 'Nenhum título bloqueado'
              : 'Nenhum título encontrado'}
          </Text>
          {filter !== 'all' && (
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Toque em "Todos" para ver todos os títulos
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.titlesGrid}>
          {filteredTitles.map((title, index) => {
            const { earned, percent, label } = safeGetTitleProgress(title);
            return (
              <TitleCard
                key={title._id || title.id || `title-${index}`}
                title={title}
                earned={earned}
                percent={percent}
                label={label}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

// Tab: Desafios Criados
const CreatedTab = ({ exercises, loading, colors, isDarkMode }: {
  exercises: Exercise[];
  loading: boolean;
  colors: any;
  isDarkMode: boolean;
}) => {
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Carregando desafios criados...
        </Text>
      </View>
    );
  }

  if (exercises.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="code-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Nenhum desafio criado ainda
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.exercisesGrid}>
      {exercises.map((exercise, index) => (
        <ExerciseCard key={exercise.id || `exercise-${index}`} exercise={exercise} colors={colors} isDarkMode={isDarkMode} />
      ))}
    </View>
  );
};

// Componente de Card de Exercício
const ExerciseCard = ({ exercise, colors, isDarkMode }: {
  exercise: Exercise;
  colors: any;
  isDarkMode: boolean;
}) => {
  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return colors.easy || '#4CAF50';
    if (difficulty <= 2) return colors.easy || '#4CAF50';
    if (difficulty <= 3) return colors.medium || '#FF9800';
    return colors.hard || '#F44336';
  };

  return (
    <View
      style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      accessibilityLabel={`Desafio ${exercise.title || ''}`}
      accessibilityRole="button"
    >
      <View style={styles.exerciseHeader}>
        <Text style={[styles.exerciseTitle, { color: colors.text }]} numberOfLines={2}>
          {exercise.title || ''}
        </Text>
        {exercise.difficulty && (
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) }]}>
            <Text style={styles.difficultyText}>
              Dificuldade: {exercise.difficulty}/5
            </Text>
          </View>
        )}
      </View>
      
      {exercise.description && typeof exercise.description === 'string' && exercise.description.trim().length > 0 && (
        <Text style={[styles.exerciseDescription, { color: colors.textSecondary }]} numberOfLines={3}>
          {exercise.description}
        </Text>
      )}
      
      <View style={[styles.exerciseFooter, { borderTopColor: colors.border }]}>
        {exercise.baseXp && (
          <View style={styles.xpContainer}>
            <Ionicons name="star" size={16} color={colors.xp || '#FFD700'} />
            <Text style={[styles.xpText, { color: colors.xp || '#FFD700' }]}>
              {exercise.baseXp} XP
            </Text>
          </View>
        )}
        {exercise.status && (
          <View style={[styles.statusBadge, { backgroundColor: colors.border }]}>
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {exercise.status === 'PUBLISHED' ? 'Publicado' : 
               exercise.status === 'DRAFT' ? 'Rascunho' : 'Arquivado'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Componente de Badge
const BadgeItem = ({ badge, colors, isDarkMode }: {
  badge: Badge;
  colors: any;
  isDarkMode: boolean;
}) => {
  return (
    <View
      style={[styles.badgeItem, { backgroundColor: colors.card }]}
      accessibilityLabel={`Emblema ${badge.name || ''}`}
      accessibilityRole="image"
    >
      {(() => {
        const iconUri = (badge.iconUrl && typeof badge.iconUrl === 'string' && badge.iconUrl.trim().length > 0) 
          ? badge.iconUrl.trim() 
          : (badge.icon && typeof badge.icon === 'string' && badge.icon.trim().length > 0) 
            ? badge.icon.trim() 
            : null;
        
        return iconUri ? (
          <Image
            source={{ uri: iconUri }}
            style={styles.badgeImage}
          />
        ) : (
          <Ionicons name="medal" size={48} color={colors.primary} />
        );
      })()}
      <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={2}>
        {badge.name || ''}
      </Text>
    </View>
  );
};

// Componente de Card de Título
const TitleCard = ({ title, earned, percent, label, colors, isDarkMode }: {
  title: Title;
  earned: boolean;
  percent: number;
  label: string;
  colors: any;
  isDarkMode: boolean;
}) => {
  return (
    <View
      style={[styles.titleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      accessibilityLabel={`Título ${title.name || ''}, ${label || ''}`}
      accessibilityRole="none"
    >
      {earned && (
        <View style={[styles.earnedChip, { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.earnedChipText}>Conquistado</Text>
        </View>
      )}
      
      <Text style={[styles.titleName, { color: colors.text }]} numberOfLines={2}>
        {title.name || ''}
      </Text>
      
      {title.description && typeof title.description === 'string' && title.description.trim().length > 0 && (
        <Text style={[styles.titleDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {title.description}
        </Text>
      )}
      
      <View style={styles.titleProgressWrapper}>
        <View style={[styles.titleProgressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.titleProgressFill,
              { width: `${Math.max(0, Math.min(100, percent))}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {earned ? (
            <IconImage type="checkmark" size={16} style={{ marginRight: 0 }} />
          ) : (
            <Image
              source={{ uri: 'https://img.icons8.com/?size=100&id=SxREtE5iZLQg&format=png&color=000000' }}
              style={{ width: 16, height: 16 }}
              resizeMode="contain"
              onError={() => {}}
            />
          )}
          <Text style={[styles.titleLabel, { color: earned ? '#4CAF50' : colors.textSecondary }]}>
            {label || ''}
          </Text>
        </View>
      </View>
    </View>
  );
};

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
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userInfo: {
    flex: 1,
    gap: 8,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  userTitle: {
    fontSize: 18,
    color: "#FFD700",
    fontWeight: "600",
  },
  levelInfo: {
    flexDirection: "row",
    gap: 24,
  },
  levelItem: {
    alignItems: "center",
    gap: 4,
  },
  levelLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  levelValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  progressItem: {
    alignItems: "center",
    gap: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  progressValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statsCards: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: width * 0.2,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  tabsContainer: {
    borderBottomWidth: 2,
  },
  tabs: {
    paddingHorizontal: 20,
    gap: 0,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  contentArea: {
    padding: 20,
    minHeight: 400,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  exercisesGrid: {
    gap: 16,
  },
  exerciseCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  exerciseDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  exerciseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  xpContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  xpText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  badgeItem: {
    width: (width - 60) / 3,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  badgeImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  filterButtonActive: {
    borderWidth: 0,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  titlesGrid: {
    gap: 12,
  },
  titleCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    position: "relative",
  },
  earnedChip: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  earnedChipText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  titleName: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  titleDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  titleProgressWrapper: {
    gap: 6,
  },
  titleProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  titleProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  titleLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});
