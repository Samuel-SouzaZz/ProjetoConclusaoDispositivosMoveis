import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeroSectionProps {
  userName: string;
  userLevel: number;
  userXp: number;
  onCreateChallenge: () => void;
  primaryColor: string;
  cardColor: string;
}

export default function HeroSection({
  userName,
  userLevel,
  userXp,
  onCreateChallenge,
  primaryColor,
  cardColor,
}: HeroSectionProps) {
  return (
    <View
      style={[styles.hero, { backgroundColor: primaryColor }]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Bem-vindo de volta, ${userName}. Você está no nível ${userLevel} com ${userXp} pontos de experiência`}
    >
      <View style={styles.content}>
        <Text style={styles.title} accessible={true} accessibilityRole="header">
          <Text style={styles.bracket}>{"{"}</Text>
          Hello World!
          <Text style={styles.bracket}>{"}"}</Text>
        </Text>
        <Text style={styles.description} accessible={true} accessibilityRole="text">
          Bem-vindo de volta, <Text style={styles.name}>{userName}</Text>! Continue sua
          jornada de aprendizado e conquiste novos desafios. Você está indo muito bem!
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: cardColor }]}
          onPress={onCreateChallenge}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Criar novo desafio"
          accessibilityHint="Toque duas vezes para abrir a tela de criação de desafios"
        >
          <Ionicons name="add-circle" size={18} color={primaryColor} />
          <Text style={[styles.actionButtonText, { color: primaryColor }]}>Criar Desafio</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stats}>
        <View
          style={styles.statCard}
          accessible={true}
          accessibilityRole="summary"
          accessibilityLabel={`Nível ${userLevel}`}
        >
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>Level {userLevel}</Text>
            <Text style={styles.statLabel}>Seu Nível</Text>
          </View>
        </View>
        <View
          style={styles.statCard}
          accessible={true}
          accessibilityRole="summary"
          accessibilityLabel={`${userXp} pontos de experiência`}
        >
          <Ionicons name="star" size={24} color="#FFD700" />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{userXp} XP</Text>
            <Text style={styles.statLabel}>Experiência</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  content: {
    marginBottom: 16,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  bracket: {
    color: '#FFD700',
  },
  description: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.95,
  },
  name: {
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    gap: 10,
    flex: 1,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flex: 1,
  },
  statContent: {
    flex: 1,
    marginLeft: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
});

