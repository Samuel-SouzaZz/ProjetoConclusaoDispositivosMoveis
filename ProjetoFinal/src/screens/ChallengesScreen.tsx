import React, { useEffect, useState,useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert,
  ActivityIndicator, 
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/ApiService";
import ChallengeService from "../services/ChallengeService";
import { useFocusEffect } from '@react-navigation/native';
import DetailedChallengeCard from "../components/DetailedChallengeCard";


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

// DetailedChallengeCard moved to shared component ../components/DetailedChallengeCard

export default function ChallengesScreen() {
  const { commonStyles, colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, { openCreate?: boolean }>, string>>();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingChallenge, setDeletingChallenge] = useState<any>(null);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
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
    setEditingChallenge(null);
    setShowCreateModal(true);
  };

  useFocusEffect(
    useCallback(() => {
      loadChallenges();
    }, [user?.id])
  );

  useEffect(() => {
    loadChallenges();
  }, [user]);

  useEffect(() => {
    if ((route.params as any)?.openCreate) {
      handleAddPress();
    }
  }, [route.params]);

  const loadChallenges = async () => {
    setInitialLoading(true);
    try {
      const response = await ApiService.getMyChallenges();
      const items = response?.items || response?.data || (Array.isArray(response) ? response : []);
      setChallenges(items);
    } catch (err) {
      Alert.alert("Erro", ApiService.handleError(err));
    } finally {
      setInitialLoading(false);
    }
  };

  const handleEditPress = (challenge: any) => {
    const xp = challenge.xp ?? challenge.baseXp ?? 0;
    setFormData({
      title: challenge.title,
      description: challenge.description,
      difficulty: difficultyOptions.find(d => d.label === challenge.difficulty)?.value || 1,
      xp: typeof xp === 'number' ? xp : Number(xp) || 0,
      isPublic: challenge.isPublic,
      codeTemplate: '// Seu código aqui\n'
    });
    setEditingChallenge(challenge);
    setShowCreateModal(true);
  };

  const handleDeletePress = (challenge: any) => {
    setDeletingChallenge(challenge);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingChallenge) return;
    try {
      const challengeId = deletingChallenge.id || deletingChallenge._id;
      await ApiService.deleteChallenge(String(challengeId));
      if (ChallengeService.deleteChallenge) {
        try { await ChallengeService.deleteChallenge(String(challengeId)); } catch {}
      }
      setShowDeleteModal(false);
      setDeletingChallenge(null);
      await loadChallenges();
      Alert.alert('Sucesso', 'Desafio excluído com sucesso!');
    } catch (error: any) {
      setShowDeleteModal(false);
      setDeletingChallenge(null);
      Alert.alert('Erro', ApiService.handleError(error));
    }
  };

  const handleChallengePress = (challenge: any) => {
    const id = challenge?.id || challenge?._id;
    if (!id) return;
    // @ts-ignore
    navigation.navigate('ChallengeDetails', { exerciseId: String(id) });
  };

  const handleSaveChallenge = async () => {
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
      const created = await ApiService.createChallenge({
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        xp: formData.xp,
        isPublic: formData.isPublic,
        codeTemplate: formData.codeTemplate,
      });

      const ex = created?.exercise || created; // suporta { exercise: {...} } ou objeto direto
      const code = ex?.publicCode || ex?.public_code || ex?.code;
      const message = code
        ? `Desafio criado!\n\nCódigo do desafio: ${code}`
        : 'Desafio criado!';

      Alert.alert("Sucesso", message);
      await loadChallenges();
      setShowCreateModal(false);
  
    } catch (e) {
      Alert.alert("Erro", ApiService.handleError(e));
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
        {challenges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhum desafio criado ainda. Clique em "Criar" para começar!
            </Text>
          </View>
        ) : (
          challenges.map((challenge, idx) => {
            const diffNum = Number(challenge.difficulty ?? 1);
            const diffLabel = diffNum <= 1 ? 'Fácil' : diffNum === 2 ? 'Médio' : 'Difícil';
            const xp = challenge.xp ?? challenge.baseXp ?? 0;
            const code = challenge.publicCode || challenge.public_code || challenge.code;
            return (
              <DetailedChallengeCard
                key={String(challenge.id || challenge._id || idx)}
                title={challenge.title}
                description={challenge.description}
                difficulty={diffLabel}
                progress={challenge.progress}
                isPublic={challenge.isPublic}
                xp={xp}
                code={code}
                onPress={() => handleChallengePress(challenge)}
                onEdit={() => handleEditPress(challenge)}
                onDelete={() => handleDeletePress(challenge)}
                onCopyCode={() => handleCopyCode(code)}
              />
            );
          })
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
              {editingChallenge ? 'Editar Desafio' : 'Criar Desafio'}
            </Text>
            <TouchableOpacity onPress={handleSaveChallenge} disabled={loading}>
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
                placeholder="Digite o título do desafio"
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
                placeholder="Descreva o desafio"
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
                value={String(formData.xp ?? 0)}
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

      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent
      >
        <View style={styles.overlay}> 
          <View style={[styles.confirmBox, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={[styles.confirmTitle, { color: colors.text }]}>Excluir Desafio</Text>
            <Text style={[styles.confirmDesc, { color: colors.textSecondary }]}>Tem certeza que deseja excluir {deletingChallenge?.title ? `"${deletingChallenge.title}"` : 'este desafio'}?</Text>
            <View style={styles.confirmActions}> 
              <TouchableOpacity style={[styles.cancelBtn]} onPress={() => { setShowDeleteModal(false); setDeletingChallenge(null); }}>
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.deleteBtn]} onPress={confirmDelete}>
                <Text style={styles.deleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmBox: {
    width: '86%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  confirmTitle: { fontSize: 18, fontWeight: '800' },
  confirmDesc: { marginTop: 8, fontSize: 13 },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 16 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F44336', borderRadius: 8 },
  cancelText: { fontWeight: '700' },
  deleteText: { color: '#fff', fontWeight: '700' },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  challengeCard: {
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  challengeContent: {
    padding: 16,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  challengeTitle: {
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
  challengeInfo: {
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
  challengeActions: {
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

  const handleCopyCode = async (code?: string) => {
    if (!code) return;
    try {
      if (Platform.OS === 'web' && (navigator as any)?.clipboard) {
        await (navigator as any).clipboard.writeText(String(code));
        Alert.alert('Copiado', 'Código copiado para a área de transferência');
        return;
      }
      Alert.alert('Código do desafio', String(code));
    } catch {
      Alert.alert('Código do desafio', String(code));
    }
  };