import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

interface SafeScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
  backgroundColor?: string;
}

// Wrapper padronizado para SafeAreaView
export default function SafeScreen({ 
  children, 
  edges = ['top', 'bottom'], 
  style,
  backgroundColor 
}: SafeScreenProps) {
  const { colors, commonStyles } = useTheme();

  return (
    <SafeAreaView
      style={[
        commonStyles.container,
        { backgroundColor: backgroundColor || colors.background },
        style,
      ]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
}

