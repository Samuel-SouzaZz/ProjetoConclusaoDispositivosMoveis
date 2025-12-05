import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonColor = '#4A90E2',
  cancelButtonColor = '#666666',
  loading = false,
  icon = 'checkmark-circle-outline',
  iconColor = '#4A90E2',
  backgroundColor,
  textColor,
  borderColor,
}: ConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel="Modal de confirmação"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[styles.modalContainer, { backgroundColor, borderColor }]}
              accessible={true}
              accessibilityRole="alert"
              accessibilityLabel={`${title}. ${message}`}
            >
              {/* Ícone */}
              <View
                style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}
                accessible={true}
                accessibilityElementsHidden={true}
                importantForAccessibility="no"
              >
                <Ionicons name={icon} size={48} color={iconColor} />
              </View>

              {/* Título */}
              <Text
                style={[styles.title, { color: textColor }]}
                accessible={true}
                accessibilityRole="header"
              >
                {title}
              </Text>

              {/* Mensagem */}
              <Text
                style={[styles.message, { color: textColor }]}
                accessible={true}
                accessibilityRole="text"
              >
                {message}
              </Text>

              {/* Botões */}
              <View
                style={styles.buttonsContainer}
                accessible={true}
                accessibilityRole="group"
                accessibilityLabel="Ações disponíveis"
              >
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { backgroundColor: 'transparent', borderColor: cancelButtonColor, borderWidth: 2 }
                  ]}
                  onPress={onClose}
                  disabled={loading}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={cancelText}
                  accessibilityHint="Fecha o modal sem submeter a solução"
                  accessibilityState={{ disabled: loading }}
                >
                  <Text style={[styles.cancelButtonText, { color: cancelButtonColor }]}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    { backgroundColor: confirmButtonColor, opacity: loading ? 0.7 : 1 }
                  ]}
                  onPress={onConfirm}
                  disabled={loading}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={confirmText}
                  accessibilityHint="Confirma e submete sua solução para avaliação"
                  accessibilityState={{ disabled: loading, busy: loading }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color="#fff" />
                      <Text style={styles.confirmButtonText}>{confirmText}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
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
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    gap: 6,
  },
  confirmButton: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

