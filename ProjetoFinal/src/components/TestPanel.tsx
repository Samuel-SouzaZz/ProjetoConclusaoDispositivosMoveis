import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TestPanelProps {
  input: string;
  onInputChange: (text: string) => void;
  output: string;
  error: string | null;
  testing: boolean;
  onTest: () => void;
  backgroundColor: string;
  textColor: string;
  borderColorInput: string;
  borderColorOutput: string;
  primaryColor: string;
  placeholderColor: string;
}

export default function TestPanel({
  input,
  onInputChange,
  output,
  error,
  testing,
  onTest,
  backgroundColor,
  textColor,
  borderColorInput,
  borderColorOutput,
  primaryColor,
  placeholderColor,
}: TestPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="play-circle" size={24} color={primaryColor} />
        <Text
          style={[styles.title, { color: textColor }]}
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel="Teste seu Código"
        >
          Teste seu Código
        </Text>
      </View>

      {/* Input Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="arrow-down-circle" size={18} color={borderColorInput} />
          <Text
            style={[styles.sectionLabel, { color: textColor }]}
            accessible={true}
            accessibilityRole="header"
          >
            📥 Input (stdin)
          </Text>
        </View>
        <TextInput
          style={[styles.input, {
            backgroundColor,
            color: textColor,
            borderColor: borderColorInput
          }]}
          value={input}
          onChangeText={onInputChange}
          placeholder="Digite as entradas aqui&#10;Uma por linha&#10;&#10;Exemplo para somar 5 + 3:&#10;5&#10;3"
          placeholderTextColor={placeholderColor}
          multiline
          textAlignVertical="top"
          accessible={true}
          accessibilityRole="none"
          accessibilityLabel="Campo de entrada de dados para teste"
          accessibilityHint="Digite os valores de entrada, um por linha. Por exemplo, para somar 5 e 3, digite 5, pressione enter, e digite 3"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="ascii-capable"
        />
        <Text
          style={[styles.hint, { color: placeholderColor }]}
          accessible={true}
          accessibilityRole="text"
        >
          💡 Uma entrada por linha. Para somar 5 e 3, digite: 5 (Enter) 3
        </Text>
      </View>

      {/* Output Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="arrow-up-circle" size={18} color={borderColorOutput} />
          <Text
            style={[styles.sectionLabel, { color: textColor }]}
            accessible={true}
            accessibilityRole="header"
          >
            📤 Output (resultado)
          </Text>
        </View>
        <View
          style={[styles.output, {
            backgroundColor,
            borderColor: error ? '#ef4444' : borderColorOutput
          }]}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={
            testing
              ? 'Executando código, aguarde'
              : error
              ? `Erro na execução: ${error}`
              : output
              ? `Resultado da execução: ${output}`
              : 'Nenhum resultado ainda. Execute um teste para ver a saída'
          }
        >
          {testing ? (
            <View style={styles.outputLoading}>
              <ActivityIndicator size="small" color={primaryColor} />
              <Text style={[styles.outputText, { color: placeholderColor }]}>
                Executando código...
              </Text>
            </View>
          ) : error ? (
            <Text style={[styles.outputText, { color: '#ef4444' }]}>
              {error}
            </Text>
          ) : output ? (
            <Text style={[styles.outputText, { color: textColor }]}>
              {output}
            </Text>
          ) : (
            <Text style={[styles.outputPlaceholder, { color: placeholderColor }]}>
              Execute um teste para ver a saída aqui...
            </Text>
          )}
        </View>
      </View>

      {/* Test Button */}
      <TouchableOpacity
        style={[styles.testButton, { backgroundColor: primaryColor, opacity: testing ? 0.7 : 1 }]}
        onPress={onTest}
        disabled={testing}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Testar código"
        accessibilityHint="Toque duas vezes para executar seu código com os dados de entrada fornecidos"
        accessibilityState={{ disabled: testing, busy: testing }}
      >
        {testing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.testButtonText}>Testar Código</Text>
          </>
        )}
      </TouchableOpacity>
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
    marginBottom: 20,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    minHeight: 120,
    maxHeight: 180,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },
  output: {
    minHeight: 120,
    maxHeight: 180,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  outputLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  outputText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },
  outputPlaceholder: {
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingVertical: 20,
  },
  hint: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  testButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

