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
      supportsTablet: true
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
    plugins: ["expo-font"]
  }
};