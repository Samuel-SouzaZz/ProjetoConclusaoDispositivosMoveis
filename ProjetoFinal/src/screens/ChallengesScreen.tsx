import React, { useEffect, useState, useCallback, useRef } from "react";
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
import ChallengeService from "../services/ChallengeService";
import { useFocusEffect } from '@react-navigation/native';


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

// Componente Modal para Resolver Desafio
const SolveChallengeModal = ({ challenge, onClose, colors, commonStyles }: any) => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0); // em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!challenge) return;
    
    // Inicializar código com template
    setCode(challenge.codeTemplate || '// Seu código aqui\n');
    
    // Inicializar tempo (em minutos, converter para segundos)
    const timeLimitMinutes = challenge.timeLimit || 60;
    setTimeLeft(timeLimitMinutes * 60);
    setIsRunning(true);
    startTimeRef.current = Date.now();

    // Timer countdown
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          Alert.alert('Tempo Esgotado!', 'O tempo limite foi atingido.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [challenge]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      Alert.alert('Erro', 'Por favor, escreva seu código antes de submeter.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erro', 'Você precisa estar autenticado para submeter.');
      return;
    }

    setSubmitting(true);
    try {
      const timeSpent = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      
      const result = await ApiService.submitChallenge({
        challengeId: challenge.id,
        code: code,
        languageId: challenge.languageId || '1', // Usar languageId do desafio ou padrão
      });

      // Parar o timer
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const status = result.status || result.data?.status;
      const score = result.score || result.data?.score || 0;
      const xpAwarded = result.xpAwarded || result.data?.xpAwarded || 0;

      Alert.alert(
        status === 'ACCEPTED' || status === 'Accepted' ? 'Parabéns! 🎉' : 'Tente Novamente',
        status === 'ACCEPTED' || status === 'Accepted'
          ? `Sua solução foi aceita!\nPontuação: ${score}%\nXP Ganho: ${xpAwarded}`
          : `Sua solução não passou em todos os testes.\nPontuação: ${score}%`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error: any) {
      Alert.alert('Erro', ApiService.handleError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (!challenge) return null;

  const timePercentage = challenge.timeLimit 
    ? (timeLeft / (challenge.timeLimit * 60)) * 100 
    : 100;

  return (
    <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.cancelButton, { color: colors.textSecondary }]}>Fechar</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{challenge.title}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={[commonStyles.scrollView, { flex: 1 }]}>
        {/* Timer */}
        <View style={[styles.timerContainer, { backgroundColor: colors.card }]}>
          <View style={styles.timerHeader}>
            <Text style={[styles.timerLabel, { color: colors.text }]}>Tempo Restante</Text>
            <Text style={[
              styles.timerText, 
              { color: timeLeft < 300 ? '#F44336' : colors.primary } // Vermelho se menos de 5 min
            ]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <View style={[styles.timerBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.timerBarFill, 
                { 
                  width: `${timePercentage}%`, 
                  backgroundColor: timeLeft < 300 ? '#F44336' : colors.primary 
                }
              ]} 
            />
          </View>
        </View>

        {/* Descrição do Desafio */}
        {challenge.description && (
          <View style={[styles.descriptionContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.descriptionTitle, { color: colors.text }]}>Descrição</Text>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              {challenge.description}
            </Text>
          </View>
        )}

        {/* Editor de Código */}
        <View style={[styles.codeEditorContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.codeEditorLabel, { color: colors.text }]}>Seu Código</Text>
          <TextInput
            style={[styles.codeEditor, { 
              backgroundColor: colors.background, 
              color: colors.text, 
              borderColor: colors.border 
            }]}
            value={code}
            onChangeText={setCode}
            placeholder="// Escreva sua solução aqui"
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
            editable={isRunning && timeLeft > 0}
          />
        </View>
      </ScrollView>

      {/* Botão de Submeter */}
      <View style={[styles.submitContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: isRunning && timeLeft > 0 ? colors.primary : colors.textSecondary,
              opacity: (isRunning && timeLeft > 0 && !submitting) ? 1 : 0.5
            }
          ]}
          onPress={handleSubmit}
          disabled={!isRunning || timeLeft === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {timeLeft === 0 ? 'Tempo Esgotado' : 'Submeter Solução'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const DetailedChallengeCard = ({ 
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
    <View style={[commonStyles.card, styles.challengeCard]}>
      <TouchableOpacity onPress={onPress} style={styles.challengeContent}>
        <View style={styles.challengeHeader}>
          <Text style={[commonStyles.text, styles.challengeTitle]}>{title}</Text>
          <View style={getDifficultyStyle()}>
            <Text style={[styles.difficultyText, { color: colors.text }]}>{difficulty}</Text>
          </View>
        </View>
        <Text style={[commonStyles.text, styles.challengeDescription]}>{description}</Text>
        <View style={styles.challengeFooter}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.primary }]}>{progress}%</Text>
          </View>
          <View style={styles.challengeInfo}>
            <Text style={[styles.xpText, { color: colors.xp }]}>{xp} XP</Text>
            <Text style={[styles.visibilityText, { color: isPublic ? colors.primary : colors.textSecondary }]}>
              {isPublic ? "Público" : "Privado"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={[styles.challengeActions, { backgroundColor: colors.cardSecondary }]}>
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

export default function ChallengesScreen() {
  const { commonStyles, colors } = useTheme();
  const { user } = useAuth();
  const route = useRoute<RouteProp<Record<string, { openCreate?: boolean }>, string>>();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSolveModal, setShowSolveModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 1,
    baseXp: 100, // ⚠️ Backend espera 'baseXp', não 'xp'
    isPublic: true,
    codeTemplate: '// Seu código aqui\n',
    timeLimit: 60 // Tempo limite em minutos (padrão: 60 minutos)
  });
  const [timeLimitInput, setTimeLimitInput] = useState('60'); // Estado separado para o input de tempo

  const handleAddPress = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 1,
      baseXp: 100, // ⚠️ Backend espera 'baseXp', não 'xp'
      isPublic: true,
      codeTemplate: '// Seu código aqui\n',
      timeLimit: 60 // Tempo limite em minutos (padrão: 60 minutos)
    });
    setTimeLimitInput('60');
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
      const response = await ApiService.getChallenges();
      setChallenges(response.items || response.data || []);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível carregar desafios");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleEditPress = (challenge: any) => {
    // Backend retorna difficulty como número (1-5), não como string
    // Se vier como string, tentar converter; caso contrário, usar o valor numérico
    let difficultyValue = challenge.difficulty;
    if (typeof difficultyValue === 'string') {
      // Se for string, tentar encontrar o valor correspondente
      const found = difficultyOptions.find(d => d.label === difficultyValue);
      difficultyValue = found ? found.value : 1;
    } else if (typeof difficultyValue === 'number') {
      // Se for número, usar diretamente (mas garantir que está no range 1-3)
      difficultyValue = difficultyValue >= 1 && difficultyValue <= 3 ? difficultyValue : 1;
    } else {
      difficultyValue = 1;
    }
    
    setFormData({
      title: challenge.title,
      description: challenge.description,
      difficulty: difficultyValue,
      baseXp: challenge.baseXp || challenge.xp || 100, // Backend retorna 'baseXp', mas mantém compatibilidade com 'xp'
      isPublic: challenge.isPublic,
      codeTemplate: challenge.codeTemplate || '// Seu código aqui\n',
      timeLimit: challenge.timeLimit || 60 // Tempo limite em minutos
    });
    setTimeLimitInput((challenge.timeLimit || 60).toString());
    setEditingChallenge(challenge);
    setShowCreateModal(true);
  };

  const handleDeletePress = (challenge: any) => {
    Alert.alert(
      'Excluir Desafio',
      `Tem certeza que deseja excluir "${challenge.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              const challengeId = challenge.id || challenge._id;
          
              await ApiService.deleteChallenge(challengeId);
              if (ChallengeService.deleteChallenge) {
                try { await ChallengeService.deleteChallenge(challengeId); } catch {}
              }
              await loadChallenges();
              Alert.alert("Sucesso", "Desafio excluído com sucesso!");
            } catch (error: any) {
              Alert.alert("Erro", ApiService.handleError(error));
            }
          }
        }
      ]
    );
  };

  const handleChallengePress = (challenge: any) => {
    // Abrir modal para resolver o desafio
    setSelectedChallenge(challenge);
    setShowSolveModal(true);
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
      // Se estiver editando, usar updateChallenge
      if (editingChallenge) {
        const challengeId = editingChallenge.id || editingChallenge._id;
        await ApiService.updateChallenge(challengeId, {
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty,
          baseXp: formData.baseXp, // ⚠️ Backend espera 'baseXp'
          isPublic: formData.isPublic,
          codeTemplate: formData.codeTemplate,
        });
        Alert.alert("Sucesso", "Desafio atualizado!");
      } else {
        await ApiService.createChallenge({
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty,
          baseXp: formData.baseXp, // ⚠️ Backend espera 'baseXp'
          isPublic: formData.isPublic,
          codeTemplate: formData.codeTemplate,
        });
      }
  
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
          challenges.map((challenge) => (
          <DetailedChallengeCard
            key={challenge.id}
            title={challenge.title}
            description={challenge.description}
            // Backend retorna difficulty como número (1-5), mas o componente espera string
            difficulty={typeof challenge.difficulty === 'number' 
              ? difficultyOptions.find(d => d.value === challenge.difficulty)?.label || 'Fácil'
              : challenge.difficulty || 'Fácil'}
            progress={challenge.progress}
            isPublic={challenge.isPublic}
            xp={challenge.baseXp || challenge.xp || 0} // Backend retorna 'baseXp', mas mantém compatibilidade
            onPress={() => handleChallengePress(challenge)}
            onEdit={() => handleEditPress(challenge)}
            onDelete={() => handleDeletePress(challenge)}
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
                      formData.difficulty === option.value && {
                        backgroundColor: option.color,
                        borderColor: option.color
                      },
                      { borderColor: option.color }
                    ]}
                    onPress={() => setFormData({...formData, difficulty: option.value})}
                  >
                    <Text style={[
                      styles.difficultyOptionText,
                      formData.difficulty === option.value 
                        ? { color: '#FFFFFF' } // Texto branco quando selecionado
                        : { color: option.color } // Texto na cor da borda quando não selecionado
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
                value={formData.baseXp.toString()}
                onChangeText={(text) => setFormData({...formData, baseXp: parseInt(text) || 0})}
                placeholder="100"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[commonStyles.text, styles.label]}>Tempo Limite (minutos)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={timeLimitInput}
                onChangeText={(text) => {
                  // Remover caracteres não numéricos
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setTimeLimitInput(numericValue);
                  
                  // Atualizar formData apenas se for um número válido
                  if (numericValue === '') {
                    setFormData({...formData, timeLimit: 0});
                  } else {
                    const parsed = parseInt(numericValue, 10);
                    if (!isNaN(parsed) && parsed >= 0) {
                      setFormData({...formData, timeLimit: parsed});
                    }
                  }
                }}
                onBlur={() => {
                  // Quando sair do campo, garantir que tenha um valor mínimo
                  if (timeLimitInput === '' || parseInt(timeLimitInput, 10) <= 0) {
                    setTimeLimitInput('60');
                    setFormData({...formData, timeLimit: 60});
                  }
                }}
                placeholder="60"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                Tempo máximo que o usuário terá para resolver o desafio
              </Text>
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

      {/* Modal para Resolver Desafio */}
      <Modal
        visible={showSolveModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SolveChallengeModal
          challenge={selectedChallenge}
          onClose={() => {
            setShowSolveModal(false);
            setSelectedChallenge(null);
          }}
          colors={colors}
          commonStyles={commonStyles}
        />
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
    // Background será definido dinamicamente com a cor da opção
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
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Estilos do Modal de Resolver Desafio
  timerContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  timerBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  descriptionContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  codeEditorContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  codeEditorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  codeEditor: {
    minHeight: 300,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  submitContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

