import React, { useEffect, useState } from "react";
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
import { useTheme } from "../contexts/ThemeContext";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import ApiService from "../services/ApiService";
import BottomNavigation from "../components/BottomNavigation";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const { user, loading } = useAuth();
  const { colors, commonStyles } = useTheme();
  const navigation = useNavigation<any>();
  const [discussionsCount, setDiscussionsCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const stats = await ApiService.getStats();
        if (stats && typeof stats.discussionsCount === 'number') {
          setDiscussionsCount(stats.discussionsCount);
        }
      } catch {}
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loginContainer}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Bem-vindo!</Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>Faça login para continuar</Text>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Fazer Login</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.signupButton, { borderColor: colors.primary }]}
            onPress={() => navigation.navigate("Signup")}
          >
            <Text style={[styles.signupButtonText, { color: colors.primary }]}>Criar Conta</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.cardSecondary }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <TouchableOpacity style={styles.profileContainer} onPress={() => navigation.navigate('ProfileTab')} activeOpacity={0.7}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
          <View style={[styles.levelBadge, { backgroundColor: colors.text }]}>
            <Text style={styles.levelText}>{user?.level || 1}</Text>
          </View>
          <Text style={[styles.levelLabel, { color: colors.textSecondary }]}>Level</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingContainer}>
          <Text style={[styles.greetingTitle, { color: colors.text }]}>
            Olá {user?.name?.split(' ')[0] || 'Marcos'}!
          </Text>
          <Text style={[styles.greetingSubtitle, { color: colors.textSecondary }]}>Boas vindas de volta!</Text>
        </View>

        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('DiscussionsTab')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="chatbubbles" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Discussões</Text>
              <View style={[styles.notificationBadge, { backgroundColor: colors.text }]}>
                <Text style={styles.notificationText}>{discussionsCount}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('ExercisesTab')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="school" size={28} color={colors.xp} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Desafio</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('ExercisesTab', { openCreate: true })}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="add-circle" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Criar{'\n'}desafio</Text>
            </TouchableOpacity>
            
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{'{'}<Text style={[styles.sectionTitleHighlight, { color: colors.xp }]}>Em Destaque</Text>{'}'}</Text>
          
          <View style={styles.cardsRow}>
            <TouchableOpacity style={[styles.featuredCard, { backgroundColor: colors.card }]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color={colors.text} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Lorem ipsum dolor sit amet consectetur.</Text>
              <TouchableOpacity style={[styles.cardButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.cardButtonText, { color: '#fff' }]}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featuredCard, { backgroundColor: colors.card }]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color={colors.text} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Lorem ipsum dolor sit amet consectetur.</Text>
              <TouchableOpacity style={[styles.cardButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.cardButtonText, { color: '#fff' }]}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          <View style={styles.cardsRow}>
            <TouchableOpacity style={[styles.featuredCard, { backgroundColor: colors.card }]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color={colors.text} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Lorem ipsum dolor sit amet consectetur.</Text>
              <TouchableOpacity style={[styles.cardButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.cardButtonText, { color: '#fff' }]}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featuredCard, { backgroundColor: colors.card }]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color={colors.text} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Lorem ipsum dolor sit amet consectetur.</Text>
              <TouchableOpacity style={[styles.cardButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.cardButtonText, { color: '#fff' }]}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{'{'}<Text style={[styles.sectionTitleHighlight, { color: colors.xp }]}>Recomendações</Text>{'}'}</Text>
          
          <View style={styles.cardsRow}>
            <TouchableOpacity style={[styles.featuredCard, { backgroundColor: colors.xp }]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color={colors.text} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Novos exercícios sobre árvore de decisão</Text>
              <TouchableOpacity style={[styles.cardButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.cardButtonText, { color: '#fff' }]}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featuredCard, { backgroundColor: colors.cardSecondary }]}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="football-ball" size={24} color={colors.text} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Lorem ipsum dolor sit amet consectetur.</Text>
              <TouchableOpacity style={[styles.cardButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.cardButtonText, { color: '#fff' }]}>Comece agora</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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

  greetingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  greetingSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },

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
    borderRadius: 20,
    padding: 20,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
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

  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sectionTitleHighlight: {},

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
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    marginBottom: 15,
    lineHeight: 18,
  },
  cardButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 5,
  },
  cardButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
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
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
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
