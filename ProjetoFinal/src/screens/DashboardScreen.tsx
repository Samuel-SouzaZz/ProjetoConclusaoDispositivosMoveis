import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import BottomNavigation from "../components/BottomNavigation";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const { user, loading } = useAuth();
  const navigation = useNavigation<any>();

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
    <SafeAreaView style={styles.safeArea}>
      {/* Header com busca e perfil */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>1</Text>
          </View>
          <Text style={styles.levelLabel}>Level</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Saudação */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>
            Olá {user?.name?.split(' ')[0] || 'Marcos'}!
          </Text>
          <Text style={styles.greetingSubtitle}>Boas vindas de volta!</Text>
        </View>

        {/* Cards de ação rápida */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={[styles.quickActionCard, styles.discussionsCard]}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="chatbubbles" size={28} color="#4A90E2" />
              </View>
              <Text style={styles.quickActionText}>Discussões</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>2</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickActionCard, styles.exerciseCard]}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="school" size={28} color="#F5A623" />
              </View>
              <Text style={styles.quickActionText}>Exercício</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={[styles.quickActionCard, styles.createCard]}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="add-circle" size={28} color="#4A90E2" />
              </View>
              <Text style={styles.quickActionText}>Criar{'\n'}exercício</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickActionCard, styles.examplesCard]}>
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
          <Text style={styles.sectionTitle}>{'{'}<Text style={styles.sectionTitleHighlight}>Em Destaque</Text>{'}'}</Text>
          
          <View style={styles.cardsRow}>
            <TouchableOpacity style={[styles.featuredCard, styles.darkCard]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>Lorem ipsum dolor sit amet consectetur.</Text>
              <TouchableOpacity style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featuredCard, styles.darkCard]}>
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
            <TouchableOpacity style={[styles.featuredCard, styles.darkCard]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>Lorem ipsum dolor sit amet consectetur.</Text>
              <TouchableOpacity style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featuredCard, styles.darkCard]}>
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
            <TouchableOpacity style={[styles.featuredCard, styles.yellowCard]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color="#000" />
              </View>
              <Text style={[styles.cardTitle, { color: '#1A1A1A' }]}>Novos exercícios sobre árvore de decisão</Text>
              <TouchableOpacity style={[styles.cardButton, styles.yellowButton]}>
                <Text style={[styles.cardButtonText, { color: '#1A1A1A' }]}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featuredCard, styles.lightCard]}>
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
    backgroundColor: "#FAFAFA",
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  profileContainer: {
    alignItems: "center",
    position: "relative",
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
    width: (width - 55) / 2,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  discussionsCard: {
    backgroundColor: "#E3F2FD",
  },
  exerciseCard: {
    backgroundColor: "#FFF3E0",
  },
  createCard: {
    backgroundColor: "#E3F2FD",
  },
  examplesCard: {
    backgroundColor: "#FFF3E0",
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
    width: (width - 55) / 2,
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
