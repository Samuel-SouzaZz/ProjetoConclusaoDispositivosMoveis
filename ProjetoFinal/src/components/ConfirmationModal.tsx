import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { BaseModal, Button } from './common';

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
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonColor,
  cancelButtonColor,
  loading = false,
  icon = 'checkmark-circle-outline',
  iconColor,
  backgroundColor,
  textColor,
  borderColor,
}: ConfirmationModalProps) {
  const { colors } = useTheme();
  const finalIconColor = iconColor || colors.primary;
  const finalConfirmColor = confirmButtonColor || colors.primary;
  const finalCancelColor = cancelButtonColor || colors.textSecondary;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      maxWidth={400}
      dismissible={!loading}
      accessible={true}
      accessibilityLabel={`${title}. ${message}`}
    >
      <View style={styles.content} accessible={true} accessibilityRole="alert">
        <View
          style={[styles.iconContainer, { backgroundColor: `${finalIconColor}15` }]}
          accessible={true}
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        >
          <Ionicons name={icon} size={48} color={finalIconColor} />
        </View>

        <Text
          style={[styles.title, { color: colors.text }]}
          accessible={true}
          accessibilityRole="header"
        >
          {title}
        </Text>

        <Text
          style={[styles.message, { color: colors.textSecondary }]}
          accessible={true}
          accessibilityRole="text"
        >
          {message}
        </Text>

        <View
          style={styles.buttonsContainer}
          accessible={false}
        >
          <Button
            label={cancelText}
            variant="secondary"
            onPress={onClose}
            disabled={loading}
            style={[
              styles.cancelButton,
              { borderColor: finalCancelColor },
            ]}
            textStyle={{ color: finalCancelColor }}
          />
          <Button
            label={confirmText}
            variant={finalConfirmColor === '#F44336' || finalConfirmColor === '#ef4444' ? 'danger' : 'primary'}
            onPress={onConfirm}
            loading={loading}
            disabled={loading}
            icon={
              !loading ? (
                <Ionicons name="send" size={18} color="#fff" />
              ) : undefined
            }
            style={styles.confirmButton}
          />
        </View>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
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
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

