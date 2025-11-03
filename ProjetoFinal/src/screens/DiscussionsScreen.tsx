import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext"; 

export default function DiscussionsScreen() {
  const { commonStyles } = useTheme(); 

  return (
    <SafeAreaView style={commonStyles.container}> 
      <View style={styles.content}>
        <Text style={[commonStyles.text, styles.title]}>Discussões</Text> 
      </View>
      {/* Bottom Navigation removida - agora usamos Tab Navigator nativo */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    // ❌ REMOVER: color: "#1A1A1A" (agora vem do commonStyles.text)
  },
});