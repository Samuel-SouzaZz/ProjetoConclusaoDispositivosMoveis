import React, { useEffect, useState } from "react";
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
import { useRoute, RouteProp } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/ApiService";
import ExerciseService from "../services/ExerciseService";


const difficultyOptions = [
  { value: 1, label: "Fácil", color: "#4CAF50" },
  { value: 2, label: "Médio", color: "#FF9800" },
  { value: 3, label: "Difícil", color: "#F44336" },
];

const ScreenHeader = ({ title, onAddPress }: { title: string; onAddPress: () => void }) => {
  const { colors, commonStyles } = useTheme();
  
  return (
    <View style={[commonStyles.header, styles.header]}>
      <Text style={[commonStyles.text, styles.title]}>{title}</Text>
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary }]} 
        onPress={onAddPress}
      >
        <Text style={styles.addButtonText}>Criar</Text>
      </TouchableOpacity>
    </View>
  );
};

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
}: any) => {
  const { colors, commonStyles } = useTheme();

  const getDifficultyStyle = () => {
    switch (difficulty) {
      case 'Fácil': return [styles.difficultyBadge, { backgroundColor: colors.easy }];
      case 'Médio': return [styles.difficultyBadge, { backgroundColor: colors.medium }];
      case 'Difícil': return [styles.difficultyBadge, { backgroundColor: colors.hard }];
      default: return [styles.difficultyBadge, { backgroundColor: colors.easy }];
    }
  };

  return (
    <View style={[commonStyles.card, styles.exerciseCard]}>
      <TouchableOpacity onPress={onPress} style={styles.exerciseContent}>
        <View style={styles.exerciseHeader}>
          <Text style={[commonStyles.text, styles.exerciseTitle]}>{title}</Text>
          <View style={getDifficultyStyle()}>
            <Text style={[styles.difficultyText, { color: colors.text }]}>{difficulty}</Text>
          </View>
        </View>
        <Text style={[commonStyles.text, styles.exerciseDescription]}>{description}</Text>
        <View style={styles.exerciseFooter}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.primary }]}>{progress}%</Text>
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={[styles.xpText, { color: colors.xp }]}>{xp} XP</Text>
            <Text style={[styles.visibilityText, { color: isPublic ? colors.primary : colors.textSecondary }]}>
              {isPublic ? "Público" : "Privado"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={[styles.exerciseActions, { backgroundColor: colors.cardSecondary }]}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Text style={[styles.actionButtonText, { color: "#F44336" }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ExercisesScreen() {
  const { commonStyles, colors } = useTheme();
  const { user } = useAuth();
  const route = useRoute<RouteProp<Record<string, { openCreate?: boolean }>, string>>();
  const [exercises, setExercises] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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

  useEffect(() => {
    loadExercises();
  }, [user]);

  useEffect(() => {
    if ((route.params as any)?.openCreate) {
      handleAddPress();
    }
  }, [route.params]);

  const loadExercises = async () => {
    if (!user?.id) {
      setInitialLoading(false);
      return;
    }

    try {
      setInitialLoading(true);
      const data = await ApiService.getMyExercises({ status: 'all' });
      
      if (data && data.exercises) {
        const exercisesList = data.exercises.map((ex: any) => ({
          id: ex.id,
          title: ex.title,
          description: ex.description || '',
          difficulty: ex.difficulty === 1 ? 'Fácil' : ex.difficulty === 2 ? 'Médio' : 'Difícil',
          progress: ex.progress || 0,
          isPublic: ex.isPublic !== false,
          xp: ex.xp || 100,
        }));

        setExercises(exercisesList);

        for (const exercise of exercisesList) {
          await ExerciseService.syncExerciseFromBackend({
            ...exercise,
            difficulty: exercise.difficulty === 'Fácil' ? 1 : exercise.difficulty === 'Médio' ? 2 : 3,
            userId: user.id,
          });
        }
      } else {
        const cachedExercises = await ExerciseService.getExercisesByUserId(user.id);
        if (cachedExercises.length > 0) {
          setExercises(cachedExercises.map(ex => ({
            ...ex,
            difficulty: ex.difficulty === 1 ? 'Fácil' : ex.difficulty === 2 ? 'Médio' : 'Difícil',
          })));
        }
      }
    } catch (error) {
      const cachedExercises = await ExerciseService.getExercisesByUserId(user?.id || '');
      if (cachedExercises.length > 0) {
        setExercises(cachedExercises.map(ex => ({
          ...ex,
          difficulty: ex.difficulty === 1 ? 'Fácil' : ex.difficulty === 2 ? 'Médio' : 'Difícil',
        })));
      }
    } finally {
      setInitialLoading(false);
    }
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
          onPress: async () => {
            try {
              await ApiService.deleteExercise(exercise.id);
              await ExerciseService.deleteExercise(exercise.id);
              setExercises(exercises.filter(e => e.id !== exercise.id));
              Alert.alert('Sucesso', 'Exercício excluído com sucesso!');
            } catch (error: any) {
              const message = ApiService.handleError(error);
              Alert.alert('Erro', message || 'Não foi possível excluir o exercício');
            }
          }
        }
      ]
    );
  };

  const handleExercisePress = (exercise: any) => {
    Alert.alert('Exercício', `Abrir "${exercise.title}"`);
  };

  const handleSaveExercise = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    setLoading(true);
    
    try {
      const exerciseData = {
        title: formData.title,
        description: formData.description || '',
        difficulty: formData.difficulty,
        xp: formData.xp,
        isPublic: formData.isPublic,
        codeTemplate: formData.codeTemplate || '',
      };

      if (editingExercise) {
        const response = await ApiService.updateExercise(editingExercise.id, exerciseData);
        
        const updatedExercise = {
          id: editingExercise.id,
          title: response.title || response.exercise?.title || formData.title,
          description: response.description || response.exercise?.description || formData.description,
          difficulty: difficultyOptions.find(d => d.value === formData.difficulty)?.label || 'Fácil',
          progress: editingExercise.progress || 0,
          isPublic: response.isPublic !== false && formData.isPublic,
          xp: response.xp || response.exercise?.xp || formData.xp,
        };

        await ExerciseService.syncExerciseFromBackend({
          ...updatedExercise,
          difficulty: formData.difficulty,
          userId: user.id,
          status: editingExercise.status || 'Draft',
        });

        Alert.alert('Sucesso', 'Exercício atualizado com sucesso!');
      } else {
        const response = await ApiService.createExercise(exerciseData);
        
        const newExercise = {
          id: response.id || response.exercise?.id,
          title: response.title || response.exercise?.title || formData.title,
          description: response.description || response.exercise?.description || formData.description,
          difficulty: difficultyOptions.find(d => d.value === formData.difficulty)?.label || 'Fácil',
          progress: 0,
          isPublic: response.isPublic !== false && formData.isPublic,
          xp: response.xp || response.exercise?.xp || formData.xp,
        };

        await ExerciseService.syncExerciseFromBackend({
          ...newExercise,
          difficulty: formData.difficulty,
          userId: user.id,
          status: 'Draft',
        });

        Alert.alert('Sucesso', 'Exercício criado com sucesso!');
      }

      await loadExercises();
      setShowCreateModal(false);
    } catch (error: any) {
      const message = ApiService.handleError(error);
      Alert.alert('Erro', message || 'Não foi possível salvar o exercício');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando desafios...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScreenHeader 
        title="Meus Desafios" 
        onAddPress={handleAddPress}
      />
      
      <ScrollView style={[commonStyles.scrollView, styles.scrollView]}>
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhum desafio criado ainda. Clique em "Criar" para começar!
            </Text>
          </View>
        ) : (
          exercises.map((exercise) => (
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
          ))
        )}
      </ScrollView>
      
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={commonStyles.container}>
          <View style={[commonStyles.header, styles.modalHeader]}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={[styles.cancelButton, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[commonStyles.text, styles.modalTitle]}>
              {editingExercise ? 'Editar Exercício' : 'Criar Exercício'}
            </Text>
            <TouchableOpacity onPress={handleSaveExercise} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.saveButton, { color: colors.primary }]}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={[commonStyles.scrollView, styles.modalContent]}>
            <View style={styles.inputGroup}>
              <Text style={[commonStyles.text, styles.label]}>Título *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={formData.title}
                onChangeText={(text) => setFormData({...formData, title: text})}
                placeholder="Digite o título do exercício"
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[commonStyles.text, styles.label]}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholder="Descreva o exercício"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[commonStyles.text, styles.label]}>Dificuldade</Text>
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
              <Text style={[commonStyles.text, styles.label]}>XP Base</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={formData.xp.toString()}
                onChangeText={(text) => setFormData({...formData, xp: parseInt(text) || 0})}
                placeholder="100"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[commonStyles.text, styles.label]}>Template de Código</Text>
              <TextInput
                style={[styles.input, styles.codeInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={formData.codeTemplate}
                onChangeText={(text) => setFormData({...formData, codeTemplate: text})}
                placeholder="// Seu código aqui"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, formData.isPublic && styles.checkboxSelected, { borderColor: colors.primary }]}
                onPress={() => setFormData({...formData, isPublic: !formData.isPublic})}
              >
                {formData.isPublic && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>Desafio público (visível para todos)</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  exerciseCard: {
    borderRadius: 12,
    marginBottom: 16,
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
    flex: 1,
    marginRight: 8,
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
  exerciseDescription: {
    fontSize: 14,
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
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },
  exerciseInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  xpText: {
    fontSize: 12,
    fontWeight: "600",
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  exerciseActions: {
    flexDirection: "row",
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  codeInput: {
    fontFamily: "monospace",
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
    alignItems: "center",
  },
  difficultyOptionSelected: {
    backgroundColor: "#F0F8FF",
  },
  difficultyOptionText: {
    fontSize: 14,
    fontWeight: "600",
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
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});

