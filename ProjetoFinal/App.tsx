import React, { useEffect } from "react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { RootStackParamList } from "./src/navigation/AppNavigator";
import { useIconFonts } from "./src/hooks/useIconFonts";
import OfflineSyncService from "./src/services/OfflineSyncService";

export default function App() {
  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ["myapp://", "https://seu-dominio.com"],
    config: {
      screens: {
        GroupInvite: "invite/:groupId/:token",
      },
    },
  };

  const iconsReady = useIconFonts();

  useEffect(() => {
    // Inicia o listener de conexão para sincronização automática
    const unsubscribe = OfflineSyncService.startConnectionListener();

    // Tenta sincronizar pendentes ao iniciar o app (se houver conexão)
    OfflineSyncService.syncPendingChallenges().catch(() => {
      // Ignora erros silenciosamente
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!iconsReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
}
