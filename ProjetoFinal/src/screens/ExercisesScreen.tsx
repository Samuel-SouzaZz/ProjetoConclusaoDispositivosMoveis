import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "../components/BottomNavigation";

const exercises = [
  {
    id: "1",
    title: "Algoritmos de Ordenação",
    description: "Bubble Sort, Quick Sort, Merge Sort",
    difficulty: "Médio",
    progress: 60,
  },
  {
    id: "2", 
    title: "Estruturas de Dados",
    description: "Arrays, Listas, Pilhas, Filas",
    difficulty: "Fácil",
    progress: 30,
  },
  {
    id: "3",
    title: "Árvores e Grafos",
    description: "BST, AVL, Dijkstra, BFS/DFS",
    difficulty: "Difícil",
    progress: 80,
  },
];

const ScreenHeader = ({ title, onAddPress }: { title: string; onAddPress: () => void }) => (
  <View style={styles.header}>
    <Text style={styles.title}>{title}</Text>
    <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
      <Ionicons name="add" size={24} color="#4A90E2" />
    </TouchableOpacity>
  </View>
);

const DetailedExerciseCard = ({ 
  title, 
  description, 
  difficulty, 
  progress, 
  onPress 
}: {
  title: string;
  description: string;
  difficulty: string;
  progress: number;
  onPress: () => void;
}) => {
  const getDifficultyStyle = () => {
    switch (difficulty) {
      case 'Fácil': return styles.easyBadge;
      case 'Médio': return styles.mediumBadge;
      case 'Difícil': return styles.hardBadge;
      default: return styles.easyBadge;
    }
  };

  return (
    <TouchableOpacity key={title} style={styles.exerciseCard} onPress={onPress}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseTitle}>{title}</Text>
        <View style={[styles.difficultyBadge, getDifficultyStyle()]}>
          <Text style={styles.difficultyText}>{difficulty}</Text>
        </View>
      </View>
      <Text style={styles.exerciseDescription}>{description}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ExercisesScreen() {
  const handleAddPress = () => {
    // Implementar criação de novo exercício
  };

  const handleExercisePress = (exercise: any) => {
    // Implementar navegação para detalhes do exercício
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader 
        title="Exercícios" 
        onAddPress={handleAddPress}
      />
      
      <ScrollView style={styles.scrollView}>
        {exercises.map((exercise) => (
          <DetailedExerciseCard
            key={exercise.id}
            title={exercise.title}
            description={exercise.description}
            difficulty={exercise.difficulty}
            progress={exercise.progress}
            onPress={() => handleExercisePress(exercise)}
          />
        ))}
      </ScrollView>
      
      <BottomNavigation activeRoute="Exercises" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  easyBadge: {
    backgroundColor: "#E8F5E8",
  },
  mediumBadge: {
    backgroundColor: "#FFF3E0",
  },
  hardBadge: {
    backgroundColor: "#FFEBEE",
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A90E2",
  },
});

