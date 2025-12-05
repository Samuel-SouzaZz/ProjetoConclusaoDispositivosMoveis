import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ExerciseActionButtons from './ExerciseActionButtons';

interface ExerciseCardProps {
  title: string;
  description?: string;
  difficulty: number;
  xp: number;
  language?: string;
  isCompleted: boolean;
  onPress: () => void;
  onRankingPress: () => void;
  width: number;
  // Colors
  backgroundColor: string;
  textColor: string;
  secondaryTextColor: string;
  primaryColor: string;
  borderColor: string;
  cardSecondaryColor: string;
}

const DIFFICULTY_MAP: Record<number, { text: string; color: string }> = {
  1: { text: 'Fácil', color: '#4CAF50' },
  2: { text: 'Médio', color: '#FF9800' },
  3: { text: 'Difícil', color: '#F44336' },
  4: { text: 'Expert', color: '#9C27B0' },
  5: { text: 'Master', color: '#1F2937' },
};

export default function ExerciseCard({
  title,
  description,
  difficulty,
  xp,
  language,
  isCompleted,
  onPress,
  onRankingPress,
  width,
  backgroundColor,
  textColor,
  secondaryTextColor,
  primaryColor,
  borderColor,
  cardSecondaryColor,
}: ExerciseCardProps) {
  const difficultyInfo = DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP[2];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor: isCompleted ? '#10b981' : borderColor,
          borderWidth: isCompleted ? 2 : 1,
          width,
        },
      ]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Desafio: ${title}. Dificuldade: ${difficultyInfo.text}. ${xp} pontos de experiência. ${isCompleted ? 'Concluído' : 'Não iniciado'}`}
    >
      {/* Badge de Dificuldade */}
      <View
        style={[styles.difficultyBadge, { backgroundColor: difficultyInfo.color }]}
        accessible={true}
        accessibilityLabel={`Dificuldade: ${difficultyInfo.text}`}
      >
        <Text style={styles.difficultyBadgeText}>{difficultyInfo.text}</Text>
      </View>

      {/* Badge de Linguagem */}
      {language && (
        <View
          style={styles.languageBadge}
          accessible={true}
          accessibilityLabel={`Linguagem: ${language}`}
        >
          <Ionicons name="code-slash" size={12} color="#fff" />
          <Text style={styles.languageBadgeText}>{language}</Text>
        </View>
      )}

      {/* Header com XP */}
      <View style={[styles.cardHeader, { backgroundColor: cardSecondaryColor, borderBottomColor: borderColor }]}>
        <View style={styles.xpBadge}>
          <Ionicons name="trophy" size={14} color={primaryColor} />
          <Text style={[styles.xpBadgeText, { color: primaryColor }]}>
            {xp} XP
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.cardDescription, { color: secondaryTextColor }]} numberOfLines={2}>
          {description || 'Resolva este desafio e ganhe experiência'}
        </Text>
      </View>

      {/* Footer com botões */}
      <View style={styles.cardFooter}>
        <ExerciseActionButtons
          isCompleted={isCompleted}
          onStartPress={onPress}
          onRankingPress={onRankingPress}
          primaryColor={primaryColor}
          title={title}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    flexShrink: 0,
    marginRight: 12,
  },
  difficultyBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  difficultyBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  languageBadge: {
    position: 'absolute',
    top: 12,
    left: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
    zIndex: 10,
  },
  languageBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardHeader: {
    padding: 12,
    paddingTop: 16,
    borderBottomWidth: 1,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    padding: 16,
    paddingTop: 0,
  },
});

