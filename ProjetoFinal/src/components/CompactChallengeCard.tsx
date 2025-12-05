import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import BadgeChip from './BadgeChip';

interface CompactChallengeCardProps {
  title: string;
  description?: string;
  difficulty: number;
  xp: number;
  code?: string;
  isPublic: boolean;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopyCode?: () => void;
}

const DIFFICULTY_MAP: Record<number, { text: string; color: string }> = {
  1: { text: 'Fácil', color: '#4CAF50' },
  2: { text: 'Médio', color: '#FF9800' },
  3: { text: 'Difícil', color: '#F44336' },
  4: { text: 'Expert', color: '#9C27B0' },
  5: { text: 'Master', color: '#1F2937' },
};

export default function CompactChallengeCard({
  title,
  description,
  difficulty,
  xp,
  code,
  isPublic,
  onPress,
  onEdit,
  onDelete,
  onCopyCode,
}: CompactChallengeCardProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  
  const isSmallScreen = width < 360;
  const difficultyInfo = DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP[2];

  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Desafio: ${title}. Dificuldade: ${difficultyInfo.text}. ${xp} pontos de experiência. ${isPublic ? 'Público' : 'Privado'}`}
    >
      {/* Header compacto */}
      <TouchableOpacity
        onPress={onPress}
        style={styles.cardContent}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Abrir desafio ${title}`}
        accessibilityHint="Toque duas vezes para ver detalhes do desafio"
      >
        {/* Linha 1: Título + Badges */}
        <View style={styles.headerRow}>
          <Text
            style={[styles.title, { color: colors.text }, isSmallScreen && styles.titleSmall]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Linha 2: Badges de metadados */}
        <View style={styles.badgesRow}>
          <BadgeChip
            label={difficultyInfo.text}
            backgroundColor={difficultyInfo.color}
            textColor="#fff"
            accessibilityLabel={`Dificuldade: ${difficultyInfo.text}`}
          />
          <BadgeChip
            icon="trophy"
            label={`${xp} XP`}
            backgroundColor={colors.primaryLight || colors.primary + '20'}
            textColor={colors.primary}
            iconColor={colors.primary}
            accessibilityLabel={`${xp} pontos de experiência`}
          />
          <BadgeChip
            icon={isPublic ? 'globe-outline' : 'lock-closed-outline'}
            label={isPublic ? 'Público' : 'Privado'}
            backgroundColor={isPublic ? '#E3F2FD' : colors.cardSecondary}
            textColor={isPublic ? '#2196F3' : colors.textSecondary}
            iconColor={isPublic ? '#2196F3' : colors.textSecondary}
            accessibilityLabel={isPublic ? 'Desafio público' : 'Desafio privado'}
          />
        </View>

        {/* Linha 3: Descrição (opcional) */}
        {description && (
          <Text
            style={[styles.description, { color: colors.textSecondary }, isSmallScreen && styles.descriptionSmall]}
            numberOfLines={2}
            accessible={true}
            accessibilityRole="text"
          >
            {description}
          </Text>
        )}

        {/* Linha 4: Código (opcional) */}
        {code && (
          <View style={styles.codeRow}>
            <Ionicons name="code-slash" size={14} color={colors.textSecondary} />
            <Text
              style={[styles.codeText, { color: colors.primary }]}
              numberOfLines={1}
              accessible={true}
              accessibilityLabel={`Código do desafio: ${code}`}
            >
              {code}
            </Text>
            {onCopyCode && (
              <TouchableOpacity
                onPress={onCopyCode}
                style={[styles.copyButton, { backgroundColor: colors.primary }]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Copiar código"
                accessibilityHint="Toque duas vezes para copiar o código do desafio"
              >
                <Ionicons name="copy-outline" size={12} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Footer com ações */}
      {(onEdit || onDelete) && (
        <View
          style={[styles.footer, { borderTopColor: colors.border }]}
          accessible={true}
          accessibilityRole="toolbar"
          accessibilityLabel="Ações do desafio"
        >
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEdit}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Editar desafio"
              accessibilityHint="Toque duas vezes para editar este desafio"
            >
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Editar</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDelete}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Excluir desafio"
              accessibilityHint="Toque duas vezes para excluir este desafio"
            >
              <Ionicons name="trash-outline" size={16} color="#F44336" />
              <Text style={[styles.actionText, { color: '#F44336' }]}>Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  titleSmall: {
    fontSize: 15,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  descriptionSmall: {
    fontSize: 12,
    lineHeight: 16,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  copyButton: {
    padding: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

