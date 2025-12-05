import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  backgroundColor?: string;
  borderBottom?: boolean;
  accessibilityLabel?: string;
}

// Header padronizado com título e botão de voltar opcional
export default function ScreenHeader({
  title,
  showBackButton = true,
  onBackPress,
  rightAction,
  backgroundColor,
  borderBottom = true,
  accessibilityLabel,
}: ScreenHeaderProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: backgroundColor || colors.card,
          borderBottomColor: borderBottom ? colors.border : 'transparent',
        },
      ]}
      accessible={true}
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel || `Cabeçalho: ${title}`}
    >
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            accessibilityHint="Retorna para a tela anterior"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={1}
          accessible={true}
          accessibilityRole="header"
        >
          {title}
        </Text>
      </View>
      {rightAction && <View style={styles.rightSection}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  rightSection: {
    marginLeft: 12,
  },
});

