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
        NSCameraUsageDescription: "Este app precisa de acesso à câmera para tirar fotos de perfil.",
        NSPhotoLibraryUsageDescription: "Este app precisa de acesso à galeria para escolher fotos de perfil."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.anonymous.projetofinal",
      permissions: ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-font",
      [
        "expo-camera",
        {
          cameraPermission: "Este app precisa de acesso à câmera para tirar fotos."
        }
      ]
    ]
  }
};