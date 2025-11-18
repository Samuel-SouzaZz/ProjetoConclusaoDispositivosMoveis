import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';
import { RootStackParamList } from '../navigation/AppNavigator';

type ChallengeDetailsRoute = RouteProp<RootStackParamList, 'ChallengeDetails'>;

export default function ChallengeDetailsScreen() {
  const { colors, commonStyles } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<ChallengeDetailsRoute>();
  const { exerciseId } = route.params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<any | null>(null);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0); // em segundos
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = React.useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const challengeData = await ApiService.getChallengeById(exerciseId);
        if (!mounted) return;
        setChallenge(challengeData);
        setCode(challengeData.codeTemplate || '// Seu código aqui\n');
        
        const timeLimitMinutes = 60;
        setTimeLeft(timeLimitMinutes * 60);
        setIsRunning(true);
        startTimeRef.current = Date.now();
      } catch (err: any) {
        if (!mounted) return;
        setError(ApiService.handleError(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [exerciseId]);

  // Timer countdown
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

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
  }, [isRunning, timeLeft]);

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
      const result = await ApiService.submitChallenge({
        exerciseId: challenge.id || challenge._id || challenge.publicCode,
        code: code,
        languageId: challenge.languageId || '1',
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
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', ApiService.handleError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando desafio...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !challenge) {
    return (
      <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Desafio não encontrado'}
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const timeLimitMinutes = 60;
  const timePercentage = (timeLeft / (timeLimitMinutes * 60)) * 100;
  const difficultyMap: Record<number, string> = {
    1: "Fácil",
    2: "Médio",
    3: "Difícil",
    4: "Expert",
    5: "Master",
  };
  const difficultyText = difficultyMap[challenge.difficulty] || "Médio";
  const difficultyColor =
    difficultyText === "Fácil"
      ? "#4CAF50"
      : difficultyText === "Médio"
      ? "#FF9800"
      : "#F44336";

  return (
    <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Detalhes do Desafio</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={commonStyles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Timer */}
        <View style={[styles.timerContainer, { backgroundColor: colors.card }]}>
          <View style={styles.timerHeader}>
            <Text style={[styles.timerLabel, { color: colors.text }]}>Tempo Restante</Text>
            <Text style={[
              styles.timerText,
              { color: timeLeft < 300 ? '#F44336' : colors.primary }
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

        {/* Informações do Desafio */}
        <View style={[styles.challengeInfo, { backgroundColor: colors.card }]}>
          <Text style={[styles.challengeTitle, { color: colors.text }]}>{challenge.title}</Text>
          
          <View style={styles.challengeMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
              <Text style={styles.difficultyBadgeText}>{difficultyText}</Text>
            </View>
            <View style={styles.xpBadge}>
              <Ionicons name="trophy" size={16} color={colors.primary} />
              <Text style={[styles.xpBadgeText, { color: colors.primary }]}>
                {challenge.baseXp || challenge.xp || 0} XP
              </Text>
            </View>
            {challenge.language && (
              <View style={[styles.languageBadge, { backgroundColor: colors.cardSecondary }]}>
                <Text style={[styles.languageBadgeText, { color: colors.text }]}>
                  {challenge.language.name}
                </Text>
              </View>
            )}
          </View>

          {challenge.description && (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.descriptionTitle, { color: colors.text }]}>Descrição</Text>
              <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                {challenge.description}
              </Text>
            </View>
          )}
        </View>

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
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerContainer: {
    padding: 16,
    borderRadius: 8,
    margin: 16,
    marginBottom: 12,
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
    fontSize: 18,
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
  challengeInfo: {
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  difficultyBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    marginRight: 8,
    marginBottom: 8,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  languageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  languageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 8,
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
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
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
    fontFamily: 'monospace',
    fontSize: 14,
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
