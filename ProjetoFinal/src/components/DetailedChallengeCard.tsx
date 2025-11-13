import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export interface DetailedChallengeCardProps {
  title: string;
  description?: string;
  difficulty?: any;
  progress?: number;
  isPublic?: boolean;
  xp?: number;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function DetailedChallengeCard({
  title,
  description,
  difficulty,
  progress = 0,
  isPublic = true,
  xp = 0,
  onPress,
  onEdit,
  onDelete,
}: DetailedChallengeCardProps) {
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
            <Text style={[styles.difficultyText, { color: colors.text }]}>{String(difficulty)}</Text>
          </View>
        </View>
        {!!description && (
          <Text style={[commonStyles.text, styles.challengeDescription]}>{description}</Text>
        )}
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
        {onEdit && (
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Editar</Text>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Text style={[styles.actionButtonText, { color: "#F44336" }]}>Excluir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
