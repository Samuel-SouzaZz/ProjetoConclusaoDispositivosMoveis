import React, { useEffect, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/ApiService';
import DetailedChallengeCard from '../components/DetailedChallengeCard';
import CreateChallengeModal from '../components/CreateChallengeModal';

export type GroupChallengesRoute = RouteProp<RootStackParamList, 'GroupChallenges'>;

const difficultyOptions = [
  { value: 'all', label: 'Todas' },
  { value: '1', label: 'Fácil' },
  { value: '2', label: 'Médio' },
  { value: '3', label: 'Difícil' },
  { value: '4', label: 'Expert' },
  { value: '5', label: 'Master' },
];

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
];

export default function GroupChallengesScreen() {
  const { colors, commonStyles } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<GroupChallengesRoute>();
  const { groupId, groupName, groupDescription } = route.params;

  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);

  const [difficulty, setDifficulty] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [language, setLanguage] = useState<string>('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [exResp, langResp] = await Promise.all([
          ApiService.getGroupChallenges(groupId),
          ApiService.getLanguages().catch(() => []),
        ]);
        if (!mounted) return;
        const exItems = Array.isArray(exResp) ? exResp : exResp?.items || [];
        const langItems = Array.isArray(langResp) ? langResp : langResp?.items || [];
        setChallenges(exItems);
        setLanguages(langItems);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [groupId]);

  const filteredChallenges = useMemo(() => {
    return challenges.filter((ch: any) => {
      const diff = String(ch.difficulty ?? '');
      const st = String(ch.status || '').toLowerCase();
      const langId = String(ch.languageId || ch.language?.id || '');

      if (difficulty !== 'all' && diff !== difficulty) return false;
      if (status === 'draft' && !st.includes('draft')) return false;
      if (status === 'published' && !st.includes('publish')) return false;
      if (language !== 'all' && langId && langId !== language) return false;
      return true;
    });
  }, [challenges, difficulty, status, language]);

  const loadChallenges = async () => {
    try {
      const exResp = await ApiService.getGroupChallenges(groupId);
      const exItems = Array.isArray(exResp) ? exResp : exResp?.items || [];
      setChallenges(exItems);
    } catch (err) {
    }
  };

  const handleChallengeCreated = async () => {
    await loadChallenges();
  };

  const handleDeleteChallenge = (challengeId?: string) => {
    if (!challengeId) return;
    setChallengeToDelete(String(challengeId));
  };

  const handleConfirmDelete = async () => {
    if (!challengeToDelete) return;
    try {
      setDeleting(true);
      await ApiService.deleteChallenge(String(challengeToDelete));
      await loadChallenges();
      setChallengeToDelete(null);
      Alert.alert('Sucesso', 'Desafio excluído com sucesso.');
    } catch (err: any) {
      Alert.alert('Erro', ApiService.handleError(err));
    } finally {
      setDeleting(false);
    }
  };

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

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.center}> 
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
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}> 
        <TouchableOpacity 
          style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.card }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backText, { color: colors.textSecondary }]}>← Voltar para o Grupo</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}> 
          <View style={{ flex: 1 }}> 
            <Text style={[styles.title, { color: colors.text }]}>Desafios do Grupo</Text>
            {!!groupName && (
              <Text style={[styles.groupName, { color: colors.primary }]}>{groupName}</Text>
            )}
            {!!groupDescription && (
              <Text style={[styles.groupDesc, { color: colors.textSecondary }]}>{groupDescription}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.primaryButtonText}>+ Criar Desafio</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.filterCard, { backgroundColor: colors.card }]}> 
          <Text style={[styles.filterTitle, { color: colors.text }]}>Filtrar Desafios</Text>
          
          <View style={styles.filterCol}> 
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Dificuldade</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}> 
              {difficultyOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip, 
                    { borderColor: colors.border },
                    difficulty === opt.value && [styles.chipSelected, { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }]
                  ]}
                  onPress={() => setDifficulty(opt.value)}
                >
                  <Text style={[
                    styles.chipText, 
                    { color: difficulty === opt.value ? colors.primary : colors.textSecondary }
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterCol}> 
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}> 
              {statusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    { borderColor: colors.border },
                    status === opt.value && [styles.chipSelected, { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }]
                  ]}
                  onPress={() => setStatus(opt.value)}
                >
                  <Text style={[
                    styles.chipText, 
                    { color: status === opt.value ? colors.primary : colors.textSecondary }
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {languages.length > 0 && (
            <View style={styles.filterCol}> 
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Linguagem</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}> 
                <TouchableOpacity
                  style={[
                    styles.chip,
                    { borderColor: colors.border },
                    language === 'all' && [styles.chipSelected, { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }]
                  ]}
                  onPress={() => setLanguage('all')}
                >
                  <Text style={[
                    styles.chipText, 
                    { color: language === 'all' ? colors.primary : colors.textSecondary }
                  ]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                {languages.map((lang: any) => {
                  const id = String(lang.id || lang._id);
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[
                        styles.chip,
                        { borderColor: colors.border },
                        language === id && [styles.chipSelected, { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }]
                      ]}
                      onPress={() => setLanguage(id)}
                    >
                      <Text style={[
                        styles.chipText, 
                        { color: language === id ? colors.primary : colors.textSecondary }
                      ]}>
                        {lang.name || lang.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity
            style={[styles.clearBtn, { borderColor: colors.border }]}
            onPress={() => {
              setDifficulty('all');
              setStatus('all');
              setLanguage('all');
            }}
          >
            <Text style={[styles.clearText, { color: colors.textSecondary }]}>Limpar Filtros</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.countText, { color: colors.textSecondary }]}>
          Mostrando {filteredChallenges.length} de {challenges.length} desafios
        </Text>

        <View style={styles.challengesList}> 
          {filteredChallenges.map((ch, idx) => {
            const diffNum = Number(ch.difficulty ?? 1);
            const diffLabels: Record<number, string> = {
              1: 'Fácil',
              2: 'Médio',
              3: 'Difícil',
              4: 'Expert',
              5: 'Master',
            };
            const diffLabel = diffLabels[diffNum] || 'Fácil';
            const xp = ch.xp ?? ch.baseXp ?? 0;
            const rawId =
              ch.id ||
              ch._id ||
              ch.exerciseId ||
              ch.exercise?.id ||
              ch.exercise?._id ||
              ch.exerciseCode ||
              ch.code;
            const id = rawId ? String(rawId) : '';
            console.log('GroupChallengesScreen - desafio do grupo:', {
              rawId,
              id,
              title: ch.title,
              exerciseId: ch.exerciseId,
              exercise: ch.exercise,
            });
            const code = ch.publicCode || ch.public_code || ch.code;
            
            return (
              <DetailedChallengeCard
                key={id || String(idx)}
                title={ch.title || 'Desafio'}
                description={ch.description}
                difficulty={diffLabel}
                progress={ch.progress ?? 0}
                isPublic={Boolean(ch.isPublic ?? false)}
                xp={xp}
                code={code}
                onPress={() => {}}
                onCopyCode={code ? () => handleCopyCode(code) : undefined}
                onDelete={id ? () => handleDeleteChallenge(id) : undefined}
              />
            );
          })}
          
          {filteredChallenges.length === 0 && (
            <View style={[styles.emptyBox, { borderColor: colors.border, backgroundColor: colors.card }]}> 
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {challenges.length === 0 
                  ? 'Nenhum desafio no grupo'
                  : 'Nenhum desafio encontrado'
                }
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {challenges.length === 0
                  ? 'Seja o primeiro a criar um desafio para este grupo!'
                  : 'Tente ajustar os filtros para ver mais desafios.'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de confirmação para excluir desafio */}
      <Modal
        visible={!!challengeToDelete}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setChallengeToDelete(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card }]}> 
            <View style={styles.confirmHeader}>
              <Text style={[styles.confirmIcon, { color: '#FBBF24' }]}>⚠️</Text>
              <Text style={[styles.confirmTitle, { color: colors.text }]}>Excluir Desafio</Text>
            </View>
            <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>
              Tem certeza que deseja excluir este desafio? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.confirmFooter}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmCancelButton, { borderColor: colors.border }]}
                onPress={() => !deleting && setChallengeToDelete(null)}
                disabled={deleting}
              >
                <Text style={[styles.confirmCancelText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmDeleteButton]}
                onPress={handleConfirmDelete}
                disabled={deleting}
              >
                <Text style={styles.confirmDeleteText}>
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CreateChallengeModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleChallengeCreated}
        groupId={groupId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { 
    padding: 16,
    paddingBottom: 40,
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  backBtn: { 
    alignSelf: 'flex-start', 
    borderWidth: 1, 
    borderRadius: 10, 
    paddingHorizontal: 14, 
    paddingVertical: 10,
  },
  backText: { 
    fontWeight: '600',
    fontSize: 14,
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    justifyContent: 'space-between', 
    marginTop: 20,
    gap: 12,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800',
  },
  groupName: { 
    marginTop: 4, 
    fontSize: 16,
    fontWeight: '600',
  },
  groupDesc: { 
    marginTop: 4, 
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: { 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 12,
  },
  primaryButtonText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 14,
  },
  filterCard: { 
    marginTop: 24, 
    borderRadius: 16, 
    padding: 16,
    gap: 16,
  },
  filterTitle: { 
    fontSize: 17, 
    fontWeight: '700',
  },
  filterCol: { 
    gap: 8,
  },
  filterLabel: { 
    fontSize: 13,
    fontWeight: '600',
  },
  chipScroll: {
    flexGrow: 0,
  },
  chip: { 
    borderWidth: 1.5, 
    borderRadius: 20, 
    paddingHorizontal: 14, 
    paddingVertical: 8,
    marginRight: 8,
  },
  chipSelected: {},
  chipText: { 
    fontSize: 13, 
    fontWeight: '600',
  },
  clearBtn: { 
    alignSelf: 'flex-start', 
    borderWidth: 1, 
    borderRadius: 10, 
    paddingHorizontal: 14, 
    paddingVertical: 10,
    marginTop: 4,
  },
  clearText: { 
    fontSize: 13, 
    fontWeight: '600',
  },
  countText: { 
    marginTop: 20, 
    fontSize: 14,
  },
  challengesList: {
    marginTop: 16,
    gap: 12,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  confirmMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  confirmButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  confirmCancelButton: {
    borderWidth: 1,
  },
  confirmDeleteButton: {
    backgroundColor: '#F44336',
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  emptyBox: { 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    borderRadius: 16, 
    padding: 32, 
    alignItems: 'center',
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: { 
    fontSize: 14, 
    textAlign: 'center',
    lineHeight: 20,
  },
});
