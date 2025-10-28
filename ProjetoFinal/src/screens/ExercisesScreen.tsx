import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert,
  ActivityIndicator 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const initialExercises = [
  {
    id: "1",
    title: "Algoritmos de Ordenação",
    description: "Bubble Sort, Quick Sort, Merge Sort",
    difficulty: "Médio",
    progress: 60,
    isPublic: true,
    xp: 100,
  },
  {
    id: "2", 
    title: "Estruturas de Dados",
    description: "Arrays, Listas, Pilhas, Filas",
    difficulty: "Fácil",
    progress: 30,
    isPublic: true,
    xp: 80,
  },
  {
    id: "3",
    title: "Árvores e Grafos",
    description: "BST, AVL, Dijkstra, BFS/DFS",
    difficulty: "Difícil",
    progress: 80,
    isPublic: false,
    xp: 150,
  },
];

const difficultyOptions = [
  { value: 1, label: "Fácil", color: "#4CAF50" },
  { value: 2, label: "Médio", color: "#FF9800" },
  { value: 3, label: "Difícil", color: "#F44336" },
];

const ScreenHeader = ({ title, onAddPress }: { title: string; onAddPress: () => void }) => (
  <View style={styles.header}>
    <Text style={styles.title}>{title}</Text>
    <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
      <Text style={styles.addButtonText}>Criar</Text>
    </TouchableOpacity>
  </View>
);

const DetailedExerciseCard = ({ 
  title, 
  description, 
  difficulty, 
  progress, 
  isPublic,
  xp,
  onPress,
  onEdit,
  onDelete
}: {
  title: string;
  description: string;
  difficulty: string;
  progress: number;
  isPublic: boolean;
  xp: number;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
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
    <View style={styles.exerciseCard}>
      <TouchableOpacity onPress={onPress} style={styles.exerciseContent}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseTitle}>{title}</Text>
        <View style={[styles.difficultyBadge, getDifficultyStyle()]}>
          <Text style={styles.difficultyText}>{difficulty}</Text>
        </View>
      </View>
      <Text style={styles.exerciseDescription}>{description}</Text>
        <View style={styles.exerciseFooter}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.xpText}>{xp} XP</Text>
            <Text style={[styles.visibilityText, { color: isPublic ? "#4CAF50" : "#666" }]}>
              {isPublic ? "Público" : "Privado"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.exerciseActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Text style={[styles.actionButtonText, { color: "#F44336" }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState(initialExercises);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Formulário de criação/edição
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 1,
    xp: 100,
    isPublic: true,
    codeTemplate: '// Seu código aqui\n'
  });

  const handleAddPress = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 1,
      xp: 100,
      isPublic: true,
      codeTemplate: '// Seu código aqui\n'
    });
    setEditingExercise(null);
    setShowCreateModal(true);
  };

  const handleEditPress = (exercise: any) => {
    setFormData({
      title: exercise.title,
      description: exercise.description,
      difficulty: difficultyOptions.find(d => d.label === exercise.difficulty)?.value || 1,
      xp: exercise.xp,
      isPublic: exercise.isPublic,
      codeTemplate: '// Seu código aqui\n'
    });
    setEditingExercise(exercise);
    setShowCreateModal(true);
  };

  const handleDeletePress = (exercise: any) => {
    Alert.alert(
      'Excluir Exercício',
      `Tem certeza que deseja excluir "${exercise.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            setExercises(exercises.filter(e => e.id !== exercise.id));
            Alert.alert('Sucesso', 'Exercício excluído com sucesso!');
          }
        }
      ]
    );
  };

  const handleExercisePress = (exercise: any) => {
    Alert.alert('Exercício', `Abrir "${exercise.title}"`);
  };

  const handleSaveExercise = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return;
    }

    setLoading(true);
    
    // Simula salvamento
    setTimeout(() => {
      const difficultyLabel = difficultyOptions.find(d => d.value === formData.difficulty)?.label || 'Fácil';
      
      const newExercise = {
        id: editingExercise ? editingExercise.id : Date.now().toString(),
        title: formData.title,
        description: formData.description,
        difficulty: difficultyLabel,
        progress: 0,
        isPublic: formData.isPublic,
        xp: formData.xp,
      };

      if (editingExercise) {
        setExercises(exercises.map(e => e.id === editingExercise.id ? newExercise : e));
        Alert.alert('Sucesso', 'Exercício atualizado com sucesso!');
      } else {
        setExercises([...exercises, newExercise]);
        Alert.alert('Sucesso', 'Exercício criado com sucesso!');
      }

      setShowCreateModal(false);
      setLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader 
        title="Meus Desafios" 
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
            isPublic={exercise.isPublic}
            xp={exercise.xp}
            onPress={() => handleExercisePress(exercise)}
            onEdit={() => handleEditPress(exercise)}
            onDelete={() => handleDeletePress(exercise)}
          />
        ))}
      </ScrollView>
      
      {/* Modal de Criação/Edição */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingExercise ? 'Editar Exercício' : 'Criar Exercício'}
            </Text>
            <TouchableOpacity onPress={handleSaveExercise} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#4A90E2" />
              ) : (
                <Text style={styles.saveButton}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({...formData, title: text})}
                placeholder="Digite o título do exercício"
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholder="Descreva o exercício"
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dificuldade</Text>
              <View style={styles.difficultySelector}>
                {difficultyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.difficultyOption,
                      formData.difficulty === option.value && styles.difficultyOptionSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => setFormData({...formData, difficulty: option.value})}
                  >
                    <Text style={[
                      styles.difficultyOptionText,
                      formData.difficulty === option.value && { color: option.color }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>XP Base</Text>
              <TextInput
                style={styles.input}
                value={formData.xp.toString()}
                onChangeText={(text) => setFormData({...formData, xp: parseInt(text) || 0})}
                placeholder="100"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Template de Código</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={formData.codeTemplate}
                onChangeText={(text) => setFormData({...formData, codeTemplate: text})}
                placeholder="// Seu código aqui"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, formData.isPublic && styles.checkboxSelected]}
                onPress={() => setFormData({...formData, isPublic: !formData.isPublic})}
              >
                {formData.isPublic && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Desafio público (visível para todos)</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    backgroundColor: "#4A90E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  exerciseContent: {
    padding: 16,
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
    marginRight: 8,
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
    lineHeight: 20,
  },
  exerciseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginRight: 8,
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
  exerciseInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  xpText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFD700",
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  exerciseActions: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  cancelButton: {
    fontSize: 16,
    color: "#666",
  },
  saveButton: {
    fontSize: 16,
    color: "#4A90E2",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  codeInput: {
    fontFamily: "monospace",
    backgroundColor: "#F5F5F5",
    height: 120,
  },
  difficultySelector: {
    flexDirection: "row",
    gap: 8,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  difficultyOptionSelected: {
    backgroundColor: "#F0F8FF",
  },
  difficultyOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#4A90E2",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#1A1A1A",
    flex: 1,
  },
});

