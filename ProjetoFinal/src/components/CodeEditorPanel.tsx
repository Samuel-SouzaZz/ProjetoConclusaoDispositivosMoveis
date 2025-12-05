import React, { useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CodeToolbar from './CodeToolbar';

interface CodeEditorPanelProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  iconColor: string;
  toolbarButtonColor: string;
  placeholderColor: string;
  editable?: boolean;
}

export default function CodeEditorPanel({
  value,
  onChangeText,
  placeholder = '// Escreva sua solução aqui',
  backgroundColor,
  textColor,
  borderColor,
  iconColor,
  toolbarButtonColor,
  placeholderColor,
  editable = true,
}: CodeEditorPanelProps) {
  const inputRef = useRef<TextInput>(null);

  const handleInsert = (text: string) => {
    if (!inputRef.current) return;

    // Pega a posição do cursor
    inputRef.current.focus();
    
    // Insere o texto na posição atual
    onChangeText(value + text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="code-slash" size={20} color={iconColor} />
        <Text
          style={[styles.label, { color: textColor }]}
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel="Editor de Código"
        >
          Editor de Código
        </Text>
      </View>

      {editable && (
        <CodeToolbar
          onInsert={handleInsert}
          buttonColor={toolbarButtonColor}
          textColor={textColor}
        />
      )}

      <TextInput
        ref={inputRef}
        style={[styles.editor, {
          backgroundColor,
          color: textColor,
          borderColor
        }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        multiline
        textAlignVertical="top"
        editable={editable}
        accessible={true}
        accessibilityRole="none"
        accessibilityLabel="Editor de código"
        accessibilityHint="Digite seu código aqui. Use a barra de ferramentas acima para inserir caracteres especiais"
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        keyboardType="ascii-capable"
      />

      <View style={styles.hint}>
        <Ionicons name="information-circle-outline" size={16} color={placeholderColor} />
        <Text
          style={[styles.hintText, { color: placeholderColor }]}
          accessible={true}
          accessibilityRole="text"
        >
          {editable
            ? 'Use a barra de ferramentas para facilitar a digitação de caracteres especiais'
            : 'Editor bloqueado - não é possível editar'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editor: {
    minHeight: 350,
    maxHeight: 450,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  hintText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
});

