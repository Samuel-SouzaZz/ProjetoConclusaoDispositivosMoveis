import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import BottomNavigation from "../components/BottomNavigation";
import type { RootStackParamList } from "../navigation/AppNavigator";

const { width: initialWidth } = Dimensions.get("window");

// Tipo para navegação entre tabs
type TabParamList = {
  DashboardTab: undefined;
  ChallengesTab: { openCreate?: boolean } | undefined;
  DiscussionsTab: undefined;
  RankingTab: undefined;
  SettingsTab: undefined;
};

type TabNavigationProp = BottomTabNavigationProp<TabParamList>;

type StackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AppNavigationProp = CompositeNavigationProp<TabNavigationProp, StackNavigationProp>;

export default function DashboardScreen() {
  const { user, loading } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<AppNavigationProp>();
  const { width } = useWindowDimensions();

  // Responsive layout metrics
  const layout = useMemo(() => {
    // Keep 2 columns (UI already structured em linhas de 2 cards)
    const gutter = 15;
    const horizontalPadding = 20 * 2;

    // Quick Actions: metade da largura útil, com limites
    const qaRaw = (width - horizontalPadding - gutter) / 2;
    const qaCardWidth = Math.max(220, qaRaw);

    // Featured cards: metade da largura útil, com limites um pouco maiores
    const fcRaw = (width - horizontalPadding - gutter) / 2;
    const featuredCardWidth = Math.max(260, fcRaw);

    return { qaCardWidth, featuredCardWidth };
  }, [width]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loginContainer}>
          <Text style={styles.welcomeTitle}>Bem-vindo!</Text>
          <Text style={styles.welcomeSubtitle}>Faça login para continuar</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Fazer Login</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => navigation.navigate("Signup")}
          >
            <Text style={styles.signupButtonText}>Criar Conta</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: colors.background}]}>
      {/* Header com busca e perfil */}
      <View style={[styles.header, {backgroundColor: colors.card, borderBottomColor: isDarkMode ? colors.border : "#f0f0f0"}]}>
        <View style={[styles.searchContainer, {backgroundColor: isDarkMode ? colors.cardSecondary : "#F5F5F5"}]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, {color: colors.text}]}
            placeholder="Search"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <TouchableOpacity 
          style={styles.profileContainer}
          onPress={() => navigation.navigate('ProfileTab')}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{user?.level || 1}</Text>
          </View>
          <Text style={[styles.levelLabel, {color: colors.textSecondary}]}>Level</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scrollView, {backgroundColor: colors.background}]}
        showsVerticalScrollIndicator={false}
      >
        {/* Saudação */}
        <View style={styles.greetingContainer}>
          <Text style={[styles.greetingTitle, {color: colors.text}]}>
            Olá {user?.name?.split(' ')[0] || 'Marcos'}!
          </Text>
          <Text style={[styles.greetingSubtitle, {color: colors.textSecondary}]}>Boas vindas de volta!</Text>
        </View>

        {/* Cards de ação rápida */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={[styles.quickActionCard, styles.discussionsCard, { width: layout.qaCardWidth }]} onPress={() => navigation.navigate('DiscussionsTab')}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="chatbubbles" size={28} color="#4A90E2" />
              </View>
              <Text style={styles.quickActionText}>Discussões</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>2</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickActionCard, styles.challengeCard, { width: layout.qaCardWidth }]} onPress={() => navigation.navigate('ChallengesTab')}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="school" size={28} color="#F5A623" />
              </View>
              <Text style={styles.quickActionText}>Desafio</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={[styles.quickActionCard, styles.createCard, { width: layout.qaCardWidth }]}
              onPress={() => navigation.navigate('ChallengesTab', { openCreate: true })}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="add-circle" size={28} color="#4A90E2" />
              </View>
              <Text style={styles.quickActionText}>Criar{'\n'}desafio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickActionCard, styles.examplesCard, { width: layout.qaCardWidth }]}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="book" size={28} color="#F5A623" />
              </View>
              <Text style={styles.quickActionText}>Exemplos</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção Em Destaque */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>{'{'}<Text style={styles.sectionTitleHighlight}>Em Destaque</Text>{'}'}</Text>
          
          <View style={styles.cardsRow}>
            <TouchableOpacity style={[styles.featuredCard, styles.darkCard, { width: layout.featuredCardWidth, backgroundColor: isDarkMode ? colors.cardSecondary : "#1A1A1A" }]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color="#fff" />
              </View>
              <Text style={[styles.cardTitle, {color: "#fff"}]}>Lorem ipsum dolor sit amet consectetur.</Text>
              <TouchableOpacity style={[styles.cardButton, {backgroundColor: colors.primary}]}>
                <Text style={[styles.cardButtonText, {color: isDarkMode ? "#1A1A1A" : "#fff"}]}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color={isDarkMode ? "#1A1A1A" : "#fff"} />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featuredCard, styles.darkCard, { width: layout.featuredCardWidth }]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>Lorem ipsum dolor sit amet consectetur.</Text>
              <TouchableOpacity style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          <View style={styles.cardsRow}>
            <TouchableOpacity style={[styles.featuredCard, styles.darkCard, { width: layout.featuredCardWidth }]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>Lorem ipsum dolor sit amet consectetur.</Text>
              <TouchableOpacity style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featuredCard, styles.darkCard, { width: layout.featuredCardWidth }]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>Lorem ipsum dolor sit amet consectetur.</Text>
              <TouchableOpacity style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção Recomendações */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitle}>{'{'}<Text style={styles.sectionTitleHighlight}>Recomendações</Text>{'}'}</Text>
          
          <View style={styles.cardsRow}>
            <TouchableOpacity style={[styles.featuredCard, styles.yellowCard, { width: layout.featuredCardWidth }]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color="#000" />
              </View>
              <Text style={[styles.cardTitle, { color: '#1A1A1A' }]}>Novos desafios sobre árvore de decisão</Text>
              <TouchableOpacity style={[styles.cardButton, styles.yellowButton]}>
                <Text style={[styles.cardButtonText, { color: '#1A1A1A' }]}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featuredCard, styles.lightCard, { width: layout.featuredCardWidth }]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color="#000" />
              </View>
              <Text style={[styles.cardTitle, { color: '#1A1A1A' }]}>Lorem ipsum dolor sit amet consectetur.</Text>
              <TouchableOpacity style={[styles.cardButton, styles.lightButton]}>
                <Text style={[styles.cardButtonText, { color: '#1A1A1A' }]}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation - Removida porque agora usamos Tab Navigator nativo */}
      {/* <BottomNavigation activeRoute="Dashboard" /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  profileContainer: {
    alignItems: "center",
    position: "relative",
    padding: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  levelBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  levelText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  levelLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },

  // Saudação
  greetingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  greetingSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  // Quick Actions
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  quickActionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    position: "relative",
    minHeight: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  discussionsCard: {
    backgroundColor: "#E3F2FD",
  },
  challengeCard: {
    backgroundColor: "#FFF3E0",
  },
  createCard: {
    backgroundColor: "#E3F2FD",
  },
  createCardFull: {
    width: '100%',
    alignItems: 'center',
  },
  quickActionIcon: {
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  notificationBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
  },
  sectionTitleHighlight: {
    color: "#F5A623",
  },

  // Cards
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  featuredCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: "#1A1A1A",
  },
  yellowCard: {
    backgroundColor: "#FFE66D",
  },
  lightCard: {
    backgroundColor: "#E0E0E0",
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    color: "#fff",
    marginBottom: 15,
    lineHeight: 18,
  },
  cardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 5,
  },
  yellowButton: {
    backgroundColor: "#FFE66D",
  },
  lightButton: {
    backgroundColor: "#fff",
  },
  cardButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
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
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signupButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4A90E2",
  },
  signupButtonText: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "600",
  },
});
