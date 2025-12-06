import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Switch } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";
import { BaseModal, ModalHeader, Button, Input } from "./common";

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
}

export default function CreateGroupModal({
  visible,
  onClose,
  onCreated,
}: CreateGroupModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert("Erro", "Informe o nome do grupo");
      return;
    }
    try {
      setCreating(true);
      await ApiService.createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
      setName("");
      setDescription("");
      setIsPublic(true);
      if (onCreated) await onCreated();
      Alert.alert("Sucesso", "Grupo criado com sucesso");
      onClose();
    } catch (err: any) {
      Alert.alert("Erro", ApiService.handleError(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      maxWidth={560}
      dismissible={!creating}
    >
      <ModalHeader title="Criar Grupo" onClose={onClose} />
      <View style={styles.content}>
        <Input
          label="Nome do grupo"
          value={name}
          onChangeText={setName}
          placeholder="Digite o nome do grupo"
          autoCapitalize="words"
          editable={!creating}
        />
        <Input
          label="Descrição (opcional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Digite uma descrição"
          multiline
          numberOfLines={4}
          style={{ minHeight: 90, textAlignVertical: "top" }}
          editable={!creating}
        />
        <View style={styles.publicRow}>
          <Text style={[styles.publicLabel, { color: colors.text }]}>
            Grupo público
          </Text>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            disabled={creating}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={isPublic ? "#fff" : "#f4f3f4"}
          />
        </View>
        <View style={styles.actions}>
          <Button
            label="Cancelar"
            variant="secondary"
            onPress={onClose}
            disabled={creating}
            style={styles.cancelButton}
          />
          <Button
            label={creating ? "Criando..." : "Criar"}
            variant="primary"
            onPress={handleCreate}
            loading={creating}
            disabled={creating}
            style={styles.createButton}
          />
        </View>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
  publicRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  publicLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 1,
  },
});
