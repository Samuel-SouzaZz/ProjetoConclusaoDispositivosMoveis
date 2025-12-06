import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import BaseModal from "./common/BaseModal";

interface ImagePickerOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
  title?: string;
}

export default function ImagePickerOptionsModal({
  visible,
  onClose,
  onTakePhoto,
  onPickFromGallery,
  title = "Escolher foto de perfil",
}: ImagePickerOptionsModalProps) {
  const { colors } = useTheme();

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      position="bottom"
      animationType="slide"
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        <TouchableOpacity
          style={[styles.option, { borderBottomColor: colors.border }]}
          onPress={onTakePhoto}
          accessibilityLabel="Tirar foto com a câmera"
          accessibilityRole="button"
        >
          <Ionicons name="camera" size={24} color={colors.primary} />
          <Text style={[styles.optionText, { color: colors.text }]}>Tirar foto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={onPickFromGallery}
          accessibilityLabel="Escolher foto da galeria"
          accessibilityRole="button"
        >
          <Ionicons name="images" size={24} color={colors.primary} />
          <Text style={[styles.optionText, { color: colors.text }]}>Escolher da galeria</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.border }]}
          onPress={onClose}
          accessibilityLabel="Cancelar"
          accessibilityRole="button"
        >
          <Text style={[styles.cancelText, { color: colors.text }]}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    marginTop: 12,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

