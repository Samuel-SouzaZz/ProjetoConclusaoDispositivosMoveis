import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import IconImage from './IconImage';
import { BaseModal, Button } from './common';

interface ResultModalProps {
  visible: boolean;
  onClose: () => void;
  isSuccess: boolean;
  score?: number;
  bonusPoints?: number;
  finalScore?: number;
  complexityScore?: number;
  xpAwarded?: number;
  requiredScore?: number;
}

export default function ResultModal({
  visible,
  onClose,
  isSuccess,
  score = 0,
  bonusPoints = 0,
  finalScore = 0,
  complexityScore,
  xpAwarded = 0,
  requiredScore = 60,
}: ResultModalProps) {
  const { colors } = useTheme();

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      maxWidth={400}
      accessible={true}
      accessibilityLabel={isSuccess ? "Resultado: Sucesso" : "Resultado: Falhou"}
    >
      <View
        style={styles.modalContainer}
        accessible={true}
        accessibilityRole="alert"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
                {isSuccess ? (
                  <>
                    <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                      <IconImage type="celebration" size={60} />
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>Parabéns!</Text>
                    <Text style={[styles.message, { color: colors.textSecondary }]}>
                      Sua solução foi aceita!
                    </Text>

                    <View style={styles.infoRow}>
                      <IconImage type="stats" size={20} />
                      <Text style={[styles.infoText, { color: colors.text }]}>
                        Score dos Testes: {Math.round(score)}%
                      </Text>
                    </View>

                    {bonusPoints > 0 && (
                      <>
                        <View style={styles.infoRow}>
                          <IconImage type="sparkles" size={20} />
                          <Text style={[styles.infoText, { color: colors.text }]}>
                            Bônus de Complexidade: +{bonusPoints.toFixed(1)} pontos
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <IconImage type="trophy" size={20} />
                          <Text style={[styles.infoText, { color: colors.text }]}>
                            Score Final: {Math.round(finalScore)}%
                          </Text>
                        </View>
                      </>
                    )}

                    {complexityScore !== undefined && complexityScore !== null && typeof complexityScore === 'number' && (
                      <View style={styles.infoRow}>
                        <IconImage type="puzzle" size={20} />
                        <Text style={[styles.infoText, { color: colors.text }]}>
                          Qualidade do Código: {Math.round(complexityScore)}%
                        </Text>
                      </View>
                    )}

                    <View style={styles.infoRow}>
                      <IconImage type="star" size={20} />
                      <Text style={[styles.infoText, { color: colors.text }]}>
                        XP Ganho: {xpAwarded}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={[styles.title, { color: colors.text }]}>Tente Novamente</Text>
                    <Text style={[styles.message, { color: colors.textSecondary }]}>
                      Sua solução não passou em todos os testes.
                    </Text>

                    <View style={styles.infoRow}>
                      <IconImage type="stats" size={20} />
                      <Text style={[styles.infoText, { color: colors.text }]}>
                        Score: {Math.round(score)}%
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <IconImage type="error" size={20} />
                      <Text style={[styles.infoText, { color: colors.text }]}>
                        Necessário: {requiredScore}% para aprovação
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <IconImage type="bulb" size={20} />
                      <Text style={[styles.infoText, { color: colors.text }]}>
                        Revise seu código e tente novamente!
                      </Text>
                    </View>
                  </>
                )}
        </ScrollView>

        <Button
          label="OK"
          variant="primary"
          onPress={onClose}
          fullWidth
          style={styles.button}
        />
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    maxHeight: '80%',
    padding: 24,
  },
  scrollContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  button: {
    marginTop: 16,
  },
});

