import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CodeToolbarProps {
  onInsert: (text: string) => void;
  buttonColor: string;
  textColor: string;
}

interface ToolbarButton {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
}

export default function CodeToolbar({ onInsert, buttonColor, textColor }: CodeToolbarProps) {
  const buttons: ToolbarButton[] = [
    { label: 'Tab', value: '    ', icon: 'arrow-forward', accessibilityLabel: 'Inserir tabulação (4 espaços)' },
    { label: '{ }', value: '{\n    \n}', accessibilityLabel: 'Inserir bloco de chaves' },
    { label: '( )', value: '()', accessibilityLabel: 'Inserir parênteses' },
    { label: '[ ]', value: '[]', accessibilityLabel: 'Inserir colchetes' },
    { label: ';', value: ';', accessibilityLabel: 'Inserir ponto e vírgula' },
    { label: '"', value: '""', accessibilityLabel: 'Inserir aspas duplas' },
    { label: '=', value: ' = ', accessibilityLabel: 'Inserir operador de atribuição' },
    { label: '==', value: ' == ', accessibilityLabel: 'Inserir operador de igualdade' },
    { label: '!=', value: ' != ', accessibilityLabel: 'Inserir operador de diferença' },
    { label: '&&', value: ' && ', accessibilityLabel: 'Inserir operador AND lógico' },
    { label: '||', value: ' || ', accessibilityLabel: 'Inserir operador OR lógico' },
    { label: '//', value: '// ', accessibilityLabel: 'Inserir comentário de linha' },
  ];

  return (
    <View style={styles.toolbar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toolbarContent}
      >
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.toolbarButton, { backgroundColor: buttonColor }]}
            onPress={() => onInsert(button.value)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={button.accessibilityLabel}
            accessibilityHint="Toque duas vezes para inserir no código"
          >
            {button.icon && (
              <Ionicons name={button.icon} size={14} color={textColor} />
            )}
            <Text style={[styles.toolbarButtonText, { color: textColor }]}>
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    paddingVertical: 8,
  },
  toolbarContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  toolbarButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

