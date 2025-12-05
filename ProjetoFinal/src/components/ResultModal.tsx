import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import IconImage from './IconImage';

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel={isSuccess ? "Resultado: Sucesso" : "Resultado: Falhou"}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
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

                    {complexityScore !== undefined && (
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

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={onClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="OK"
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    minWidth: 120,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

