import 'dotenv/config';

export default {
  expo: {
    name: "DevQuest",
    slug: "ProjetoFinal",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    scheme: "myapp",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    extra: {
      apiUrl: process.env.API_URL,
      apiPath: process.env.API_PATH
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSFaceIDUsageDescription: "Usamos o Face ID para permitir que você faça login de forma rápida e segura no aplicativo."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.anonymous.projetofinal"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-font",
      [
        "expo-local-authentication",
        {
          faceIDPermission: "Permitir que $(PRODUCT_NAME) use Face ID para autenticação rápida e segura."
        }
      ]
    ]
  }
};