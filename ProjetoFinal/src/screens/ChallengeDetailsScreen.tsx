import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import SafeScreen from '../components/SafeScreen';
import ScreenHeader from '../components/ScreenHeader';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';
import Judge0Service, { LANGUAGE_JUDGE0_MAP, DEFAULT_LANGUAGE_ID } from '../services/Judge0Service';
import { RootStackParamList } from '../navigation/AppNavigator';
import TabButton from '../components/TabButton';
import BadgeChip from '../components/BadgeChip';
import SectionCard from '../components/SectionCard';
import CodeEditorPanel from '../components/CodeEditorPanel';
import TestPanel from '../components/TestPanel';
import ConfirmationModal from '../components/ConfirmationModal';
import ResultModal from '../components/ResultModal';

type ChallengeDetailsRoute = RouteProp<RootStackParamList, 'ChallengeDetails'>;

export default function ChallengeDetailsScreen() {
  const { colors, commonStyles } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<ChallengeDetailsRoute>();
  const { exerciseId } = route.params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<any | null>(null);
  const [code, setCode] = useState('');
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [testError, setTestError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'code' | 'test'>('description');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState<{
    isSuccess: boolean;
    score: number;
    bonusPoints: number;
    finalScore: number;
    complexityScore?: number;
    xpAwarded: number;
    requiredScore?: number;
  } | null>(null);
  const startTimeRef = React.useRef<number>(Date.now());

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

  const handleTest = async () => {
    if (!code.trim()) {
      Alert.alert('Erro', 'Por favor, escreva seu código antes de testar.');
      return;
    }

    setTesting(true);
    setTestError(null);
    setTestOutput('');

    try {
      // Determinar o languageId do Judge0
      const languageSlug = challenge?.language?.slug || 'java';
      const languageId = LANGUAGE_JUDGE0_MAP[languageSlug] || DEFAULT_LANGUAGE_ID;

      const result = await Judge0Service.executeCode(
        code,
        languageId,
        testInput.trim() || undefined
      );

      if (result.sucesso) {
        setTestOutput(result.resultado);
        setActiveTab('test'); // Mudar para a aba de teste automaticamente
      } else {
        setTestError(result.resultado);
        setActiveTab('test');
      }
    } catch (error: any) {
      setTestError(ApiService.handleError(error));
      setActiveTab('test');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = () => {
    if (!code.trim()) {
      Alert.alert('Erro', 'Por favor, escreva seu código antes de submeter.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erro', 'Você precisa estar autenticado para submeter.');
      return;
    }

    // Abre o modal de confirmação
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    const timeSpentMs = Date.now() - startTimeRef.current;

    setSubmitting(true);
    try {
      const result = await ApiService.submitChallenge({
        exerciseId: challenge.id || challenge._id || challenge.publicCode,
        code: code,
        languageId: challenge.languageId || '1',
        timeSpentMs: timeSpentMs,
      });

      const status = result.status || result.data?.status;
      const score = result.score || result.data?.score || 0;
      const finalScore = result.finalScore || result.data?.finalScore || score;
      const complexityScore = result.complexityScore || result.data?.complexityScore;
      const bonusPoints = result.bonusPoints || result.data?.bonusPoints || 0;
      const xpAwarded = result.xpAwarded || result.data?.xpAwarded || 0;

      // Fecha o modal de confirmação
      setShowConfirmModal(false);

      // Define os dados do resultado para o modal
      const isAccepted = status === 'ACCEPTED' || status === 'Accepted';
      setResultData({
        isSuccess: isAccepted,
        score,
        bonusPoints,
        finalScore,
        complexityScore,
        xpAwarded,
        requiredScore: 60,
      });
      setShowResultModal(true);
    } catch (error: any) {
      setShowConfirmModal(false);
      Alert.alert('Erro', ApiService.handleError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando desafio..." />;
  }

  if (error || !challenge) {
    return (
      <ErrorScreen
        message={error || 'Desafio não encontrado'}
        onRetry={() => navigation.goBack()}
        retryLabel="Voltar"
      />
    );
  }

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
    <SafeScreen edges={['top', 'bottom']}>
      <ScreenHeader
        title={challenge.title}
        showBackButton={true}
        backgroundColor={colors.card}
      />

      {/* Tabs */}
      <View
        style={[styles.tabsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        accessible={true}
        accessibilityRole="tablist"
        accessibilityLabel="Navegação por abas do desafio"
      >
        <TabButton
          icon="document-text-outline"
          label="Descrição"
          active={activeTab === 'description'}
          onPress={() => setActiveTab('description')}
          activeColor={colors.primary}
          inactiveColor={colors.textSecondary}
          accessibilityLabel="Aba de Descrição do Desafio"
          accessibilityHint="Mostra informações, objetivo e dicas sobre o desafio"
        />
        <TabButton
          icon="code-slash-outline"
          label="Código"
          active={activeTab === 'code'}
          onPress={() => setActiveTab('code')}
          activeColor={colors.primary}
          inactiveColor={colors.textSecondary}
          accessibilityLabel="Aba de Editor de Código"
          accessibilityHint="Editor onde você escreve sua solução"
        />
        <TabButton
          icon="play-circle-outline"
          label="Teste"
          active={activeTab === 'test'}
          onPress={() => setActiveTab('test')}
          activeColor={colors.primary}
          inactiveColor={colors.textSecondary}
          accessibilityLabel="Aba de Teste de Código"
          accessibilityHint="Teste sua solução com entradas personalizadas antes de submeter"
        />
      </View>

      {/* Tab Content */}
      <ScrollView style={commonStyles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'description' ? (
          /* Aba de Descrição */
          <View style={styles.tabContent}>
            {/* Badges */}
            <View
              style={styles.challengeMeta}
              accessible={true}
              accessibilityRole="summary"
              accessibilityLabel={`Desafio com dificuldade ${difficultyText}, ${challenge.baseXp || challenge.xp || 0} pontos de experiência${challenge.language ? `, linguagem ${challenge.language.name}` : ''}`}
            >
              <BadgeChip
                label={difficultyText}
                backgroundColor={difficultyColor}
                accessibilityLabel={`Dificuldade: ${difficultyText}`}
              />
              <BadgeChip
                label={`${challenge.baseXp || challenge.xp || 0} XP`}
                backgroundColor="rgba(255, 215, 0, 0.1)"
                textColor={colors.text}
                icon="trophy"
                iconColor="#FFD700"
                accessibilityLabel={`Recompensa de ${challenge.baseXp || challenge.xp || 0} pontos de experiência`}
              />
              {challenge.language && (
                <BadgeChip
                  label={challenge.language.name}
                  backgroundColor={colors.primary}
                  accessibilityLabel={`Linguagem de programação: ${challenge.language.name}`}
                />
              )}
            </View>

            {/* Objetivo */}
            <SectionCard
              icon="flag-outline"
              title="Objetivo"
              iconColor={colors.primary}
              titleColor={colors.text}
              backgroundColor={colors.card}
              accessibilityLabel="Seção de Objetivo: Resolva o desafio implementando uma solução eficiente e bem estruturada"
            >
              <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
                Resolva o desafio implementando uma solução eficiente e bem estruturada.
              </Text>
            </SectionCard>

            {/* Descrição */}
            {challenge.description && (
              <SectionCard
                icon="document-text-outline"
                title="Descrição"
                iconColor={colors.primary}
                titleColor={colors.text}
                backgroundColor={colors.card}
                accessibilityLabel={`Descrição do desafio: ${challenge.description.substring(0, 100)}${challenge.description.length > 100 ? '...' : ''}`}
              >
                <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
                  {challenge.description}
                </Text>
              </SectionCard>
            )}

            {/* Recompensa */}
            <SectionCard
              icon="gift-outline"
              title="Recompensa"
              iconColor={colors.primary}
              titleColor={colors.text}
              backgroundColor={colors.card}
              accessibilityLabel={`Recompensa: ${challenge.baseXp || challenge.xp || 100} pontos de experiência base mais bônus por performance`}
            >
              <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
                {challenge.baseXp || challenge.xp || 100} XP base + bônus por performance
              </Text>
            </SectionCard>

            {/* Dicas */}
            <SectionCard
              icon="bulb-outline"
              title="Dicas"
              iconColor={colors.primary}
              titleColor={colors.text}
              backgroundColor={colors.card}
              accessibilityLabel="Dicas para resolver o desafio: Leia com atenção, pense antes de codificar, teste com diferentes entradas e otimize seu código"
            >
              <View style={styles.tipsContainer}>
                <Text style={[styles.tipItem, { color: colors.textSecondary }]}>
                  • Leia o enunciado com atenção
                </Text>
                <Text style={[styles.tipItem, { color: colors.textSecondary }]}>
                  • Pense na solução antes de começar a codificar
                </Text>
                <Text style={[styles.tipItem, { color: colors.textSecondary }]}>
                  • Teste seu código com diferentes entradas
                </Text>
                <Text style={[styles.tipItem, { color: colors.textSecondary }]}>
                  • Otimize para eficiência e legibilidade
                </Text>
              </View>
            </SectionCard>
          </View>
        ) : activeTab === 'code' ? (
          /* Aba de Código */
          <View style={styles.tabContent}>
            <CodeEditorPanel
              value={code}
              onChangeText={setCode}
              placeholder="// Escreva sua solução aqui"
              backgroundColor={colors.background}
              textColor={colors.text}
              borderColor={colors.border}
              iconColor={colors.primary}
              toolbarButtonColor={colors.card}
              placeholderColor={colors.textSecondary}
              editable={true}
            />
          </View>
        ) : (
          /* Aba de Teste */
          <View style={styles.tabContent}>
            <TestPanel
              input={testInput}
              onInputChange={setTestInput}
              output={testOutput}
              error={testError}
              testing={testing}
              onTest={handleTest}
              backgroundColor={colors.background}
              textColor={colors.text}
              borderColorInput="#3b82f6"
              borderColorOutput="#10b981"
              primaryColor={colors.primary}
              placeholderColor={colors.textSecondary}
            />
          </View>
        )}
      </ScrollView>

      {/* Botões de Ação - Sempre visíveis */}
      <View
        style={[styles.submitContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}
        accessible={true}
        accessibilityRole="toolbar"
        accessibilityLabel="Barra de ações"
      >
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              opacity: submitting ? 0.7 : 1
            }
          ]}
          onPress={handleSubmit}
          disabled={submitting}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Submeter Solução"
          accessibilityHint="Envia sua solução final para avaliação e recebe pontos de experiência"
          accessibilityState={{ disabled: submitting, busy: submitting }}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submeter Solução</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de Confirmação */}
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirmar Submissão"
        message={`Tem certeza que deseja submeter sua solução? Após a submissão, ela será avaliada e você receberá pontos de experiência baseados no seu desempenho.`}
        confirmText="Submeter"
        cancelText="Revisar"
        confirmButtonColor={colors.primary}
        cancelButtonColor={colors.textSecondary}
        loading={submitting}
        icon="send-outline"
        iconColor={colors.primary}
        backgroundColor={colors.card}
        textColor={colors.text}
        borderColor={colors.border}
      />

      {/* Modal de Resultado */}
      {resultData && (
        <ResultModal
          visible={showResultModal}
          onClose={() => {
            setShowResultModal(false);
            navigation.goBack();
          }}
          isSuccess={resultData.isSuccess}
          score={resultData.score}
          bonusPoints={resultData.bonusPoints}
          finalScore={resultData.finalScore}
          complexityScore={resultData.complexityScore}
          xpAwarded={resultData.xpAwarded}
          requiredScore={resultData.requiredScore}
        />
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabContent: {
    padding: 16,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  tipsContainer: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  submitContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
