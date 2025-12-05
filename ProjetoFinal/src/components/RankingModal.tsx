import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/ApiService';

interface RankingEntry {
  _id: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  timeSpentMs: number;
  submittedAt: string;
  score?: number;
}

interface RankingModalProps {
  visible: boolean;
  onClose: () => void;
  exerciseId: string;
  exerciseTitle: string;
}

export default function RankingModal({
  visible,
  onClose,
  exerciseId,
  exerciseTitle,
}: RankingModalProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isSmallScreen = width < 360;
  const modalMaxHeight = height * 0.85;

  useEffect(() => {
    if (visible) {
      loadRankings();
    }
  }, [visible, exerciseId]);

  const loadRankings = async () => {
    setLoading(true);
    setError(null);

    try {
      // Busca ranking público do exercício
      const response = await ApiService.getExerciseRanking(exerciseId);
      
      // Normaliza a resposta
      const submissions = Array.isArray(response) ? response : 
                         (response.items || response.data || response.submissions || []);

      // Ordena por ranking (finalScore > complexityScore > timeSpentMs)
      const sorted = submissions.sort((a: any, b: any) => {
        const scoreA = a.finalScore ?? a.score ?? 0;
        const scoreB = b.finalScore ?? b.score ?? 0;
        
        // 1. Compara score final (maior é melhor)
        if (scoreB !== scoreA) return scoreB - scoreA;
        
        // 2. Empate: compara complexity score (maior é melhor)
        const complexityA = a.complexityScore ?? 0;
        const complexityB = b.complexityScore ?? 0;
        if (complexityB !== complexityA) return complexityB - complexityA;
        
        // 3. Empate: compara tempo (menor é melhor)
        return (a.timeSpentMs ?? 0) - (b.timeSpentMs ?? 0);
      });

      setRankings(sorted.slice(0, 10)); // Top 10
    } catch (err: any) {
      const errorMessage = err?.message || 'Não foi possível carregar o ranking';
      setError(errorMessage);
      console.error('Erro ao carregar ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getMedalIcon = (position: number) => {
    if (position === 0) return { icon: 'trophy' as const, color: '#FFD700' }; // Ouro
    if (position === 1) return { icon: 'medal' as const, color: '#C0C0C0' }; // Prata
    if (position === 2) return { icon: 'medal' as const, color: '#CD7F32' }; // Bronze
    return { icon: 'star-outline' as const, color: colors.textSecondary };
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      accessible={true}
      accessibilityLabel="Modal de ranking do desafio"
      accessibilityViewIsModal={true}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer, 
            { 
              backgroundColor: colors.card,
              maxHeight: modalMaxHeight,
            }
          ]}
          accessible={true}
          accessibilityRole="dialog"
          accessibilityLabel={`Ranking do desafio: ${exerciseTitle}`}
        >
          {/* Header */}
          <View
            style={[styles.header, { borderBottomColor: colors.border }]}
            accessible={true}
            accessibilityRole="header"
          >
            <View style={styles.headerContent}>
              <Ionicons name="podium" size={24} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Ranking</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Fechar ranking"
              accessibilityHint="Toque duas vezes para fechar o modal de ranking"
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text
            style={[styles.subtitle, { color: colors.textSecondary }]}
            numberOfLines={2}
            accessible={true}
            accessibilityRole="text"
          >
            {exerciseTitle}
          </Text>

          {/* Content */}
          {loading ? (
            <View
              style={styles.centerContent}
              accessible={true}
              accessibilityRole="progressbar"
              accessibilityLabel="Carregando ranking"
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Carregando ranking...
              </Text>
            </View>
          ) : error ? (
            <View
              style={styles.centerContent}
              accessible={true}
              accessibilityRole="alert"
              accessibilityLabel={error}
            >
              <Ionicons name="alert-circle" size={48} color="#F44336" />
              <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
                onPress={loadRankings}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Tentar novamente"
                accessibilityHint="Toque duas vezes para recarregar o ranking"
              >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : rankings.length === 0 ? (
            <View
              style={styles.centerContent}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel="Ainda não há submissões aprovadas para este desafio"
            >
              <Ionicons name="trophy-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Ainda não há submissões aprovadas
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Seja o primeiro a completar este desafio!
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              accessible={true}
              accessibilityRole="list"
              accessibilityLabel={`Lista com ${rankings.length} melhores colocações`}
            >
              {rankings.map((entry, index) => {
                const medal = getMedalIcon(index);
                return (
                  <View
                    key={entry._id}
                    style={[
                      styles.rankingItem,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                      index < 3 && styles.topThree,
                      isSmallScreen && styles.rankingItemSmall,
                    ]}
                    accessible={true}
                    accessibilityRole="summary"
                    accessibilityLabel={`${index + 1}º lugar: ${entry.user.name}, tempo: ${formatTime(entry.timeSpentMs)}`}
                  >
                    {/* Posição e Medalha */}
                    <View style={[styles.positionContainer, isSmallScreen && styles.positionContainerSmall]}>
                      <Ionicons name={medal.icon} size={isSmallScreen ? 20 : 24} color={medal.color} />
                      <Text style={[styles.position, { color: colors.text }, isSmallScreen && styles.positionSmall]}>
                        {index + 1}º
                      </Text>
                    </View>

                    {/* Info do Usuário */}
                    <View style={styles.userInfo}>
                      <View
                        style={[styles.avatar, { backgroundColor: colors.primary }, isSmallScreen && styles.avatarSmall]}
                        accessible={false}
                      >
                        <Ionicons name="person" size={isSmallScreen ? 16 : 20} color="#fff" />
                      </View>
                      <View style={styles.userDetails}>
                        <Text
                          style={[styles.userName, { color: colors.text }, isSmallScreen && styles.userNameSmall]}
                          numberOfLines={1}
                        >
                          {entry.user.name}
                        </Text>
                        <Text style={[styles.time, { color: colors.textSecondary }, isSmallScreen && styles.timeSmall]}>
                          ⏱️ {formatTime(entry.timeSpentMs)}
                        </Text>
                      </View>
                    </View>

                    {/* Score (se houver) */}
                    {entry.score !== undefined && (
                      <View style={styles.scoreContainer}>
                        <Ionicons name="star" size={isSmallScreen ? 14 : 16} color="#FFD700" />
                        <Text style={[styles.score, { color: colors.text }, isSmallScreen && styles.scoreSmall]}>
                          {entry.score}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '40%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    gap: 8,
  },
  rankingItemSmall: {
    padding: 10,
    gap: 6,
  },
  topThree: {
    borderWidth: 2,
  },
  positionContainer: {
    alignItems: 'center',
    minWidth: 45,
  },
  positionContainerSmall: {
    minWidth: 38,
  },
  position: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  positionSmall: {
    fontSize: 12,
    marginTop: 2,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userDetails: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  userNameSmall: {
    fontSize: 13,
  },
  time: {
    fontSize: 12,
  },
  timeSmall: {
    fontSize: 11,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  score: {
    fontSize: 14,
    fontWeight: '600',
  },
  scoreSmall: {
    fontSize: 12,
  },
});

