import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "../components/BottomNavigation";

const { width } = Dimensions.get("window");

const continueExercises = [
  {
    id: "1",
    title: "Lorem ipsum dolor sit amet",
    description: "Lorem ipsum dolor sit amet consectetur.",
    progress: 60,
  },
  {
    id: "2", 
    title: "Lorem ipsum dolor sit amet",
    description: "Lorem ipsum dolor sit amet consectetur.",
    progress: 30,
  },
  {
    id: "3",
    title: "Lorem ipsum dolor sit amet", 
    description: "Lorem ipsum dolor sit amet consectetur.",
    progress: 80,
  },
];

const topExercises = [
  {
    id: "1",
    title: "Lorem ipsum dolor sit amet",
    description: "Lorem ipsum dolor sit amet consectetur.",
    difficulty: "Fácil",
  },
  {
    id: "2",
    title: "Lorem ipsum dolor sit amet", 
    description: "Lorem ipsum dolor sit amet consectetur.",
    difficulty: "Médio",
  },
  {
    id: "3",
    title: "Lorem ipsum dolor sit amet",
    description: "Lorem ipsum dolor sit amet consectetur.", 
    difficulty: "Difícil",
  },
];


export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  if (!user) {
    return null;
  }

  const renderContinueExercise = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.exerciseCard}
      onPress={() => navigation.navigate("Exercises")}
    >
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseHeaderText}>{item.title}</Text>
      </View>
      <View style={styles.exerciseContent}>
        <Text style={styles.exerciseDescription}>{item.description}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
        </View>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => navigation.navigate("Exercises")}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderTopExercise = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.exerciseCard}
      onPress={() => navigation.navigate("Exercises")}
    >
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseHeaderText}>{item.title}</Text>
      </View>
      <View style={styles.exerciseContent}>
        <Text style={styles.exerciseDescription}>{item.description}</Text>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => navigation.navigate("Exercises")}
        >
          <Text style={styles.continueButtonText}>Faça também</Text>
          <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            onSubmitEditing={(e) => {
              if (e.nativeEvent.text.trim()) {
                navigation.navigate("Exercises");
              }
            }}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity 
          style={styles.profileContainer}
          onPress={() => navigation.navigate("Settings")}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>7</Text>
          </View>
          <Text style={styles.levelLabel}>Lvl.</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercicios</Text>
          
          <View style={styles.exercisesOptions}>
            <TouchableOpacity 
              style={styles.exerciseOption}
              onPress={() => navigation.navigate("Exercises")}
            >
              <View style={styles.exerciseOptionIcon}>
                <Ionicons name="document-text" size={24} color="#4A90E2" />
              </View>
              <View style={styles.exerciseOptionText}>
                <Text style={styles.exerciseOptionTitle}>Exercicios</Text>
                <Text style={styles.exerciseOptionSubtitle}>02 Iniciadas</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.exerciseOption}
              onPress={() => navigation.navigate("Exercises")}
            >
              <View style={styles.exerciseOptionIcon}>
                <Ionicons name="add-circle" size={24} color="#4A90E2" />
              </View>
              <View style={styles.exerciseOptionText}>
                <Text style={styles.exerciseOptionTitle}>Criar novo Exercicio</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continuar exercicios</Text>
          <FlatList
            data={continueExercises}
            renderItem={renderContinueExercise}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top exercicios</Text>
          <FlatList
            data={topExercises}
            renderItem={renderTopExercise}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      </ScrollView>

      <BottomNavigation activeRoute="Home" />
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

  exercisesOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  exerciseOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  exerciseOptionIcon: {
    marginRight: 10,
  },
  exerciseOptionText: {
    flex: 1,
  },
  exerciseOptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  exerciseOptionSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  horizontalList: {
    paddingRight: 20,
  },

  exerciseCard: {
    width: width * 0.7,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    marginRight: 15,
    overflow: "hidden",
  },
  exerciseHeader: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  exerciseHeaderText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  exerciseContent: {
    padding: 15,
  },
  exerciseDescription: {
    fontSize: 13,
    color: "#1A1A1A",
    marginBottom: 10,
    lineHeight: 18,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: 15,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 2,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginRight: 5,
  },
});