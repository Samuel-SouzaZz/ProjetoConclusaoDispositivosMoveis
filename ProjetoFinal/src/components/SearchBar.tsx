import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
}

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Buscar...',
  backgroundColor,
  borderColor,
  textColor,
  iconColor,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>
        <Ionicons name="search" size={14} color={iconColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={iconColor}
          value={value}
          onChangeText={onChangeText}
          accessible={true}
          accessibilityRole="search"
          accessibilityLabel="Campo de busca de desafios"
          accessibilityHint="Digite para filtrar desafios por título ou descrição"
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
            accessibilityHint="Toque duas vezes para limpar o texto de busca"
          >
            <Ionicons name="close-circle" size={14} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    maxWidth: 300,
    width: 'auto',
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    margin: 0,
  },
  clearButton: {
    marginLeft: 6,
    padding: 2,
  },
});

