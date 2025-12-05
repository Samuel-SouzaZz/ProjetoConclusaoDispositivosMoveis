import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExerciseActionButtonsProps {
  isCompleted: boolean;
  onStartPress: () => void;
  onRankingPress: () => void;
  primaryColor: string;
  title: string;
}

export default function ExerciseActionButtons({
  isCompleted,
  onStartPress,
  onRankingPress,
  primaryColor,
  title,
}: ExerciseActionButtonsProps) {
  if (isCompleted) {
    return (
      <View style={styles.buttonsContainer}>
        <View
          style={[styles.completedButton, styles.flexButton]}
          accessible={true}
          accessibilityLabel="Desafio já concluído"
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.completedButtonText}>Concluído</Text>
        </View>
        <TouchableOpacity
          style={[styles.rankingButton, { borderColor: primaryColor }]}
          onPress={onRankingPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Ver ranking"
          accessibilityHint={`Toque duas vezes para ver o ranking do desafio ${title}`}
        >
          <Ionicons name="podium" size={18} color={primaryColor} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity
        style={[styles.startButton, styles.flexButton, { backgroundColor: primaryColor }]}
        onPress={onStartPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Iniciar desafio: ${title}`}
        accessibilityHint="Toque duas vezes para abrir o desafio e começar a resolver"
      >
        <Ionicons name="play" size={18} color="#fff" />
        <Text style={styles.startButtonText}>Iniciar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.rankingButton, { borderColor: primaryColor }]}
        onPress={onRankingPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Ver ranking"
        accessibilityHint={`Toque duas vezes para ver o ranking do desafio ${title}`}
      >
        <Ionicons name="podium" size={18} color={primaryColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  flexButton: {
    flex: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  completedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
    backgroundColor: '#10b981',
  },
  completedButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  rankingButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    minWidth: 52,
  },
});

