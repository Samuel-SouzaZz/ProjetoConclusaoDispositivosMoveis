import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

// SecureStore exige chaves alfanuméricas (sem @, :, etc)
const BIOMETRIC_ENABLED_KEY = "app_biometric_enabled";
const BIOMETRIC_ASKED_KEY = "app_biometric_asked"; // Se já foi perguntado ao usuário

export interface BiometricInfo {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  biometricType: string;
}

/**
 * Verifica se o dispositivo suporta autenticação biométrica
 */
export async function checkBiometricAvailability(): Promise<BiometricInfo> {
  if (Platform.OS === 'web') {
    return {
      isAvailable: false,
      isEnrolled: false,
      supportedTypes: [],
      biometricType: 'none',
    };
  }

  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    let biometricType = 'none';
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'Face ID';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'Touch ID';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'Iris';
    }

    return {
      isAvailable: hasHardware && isEnrolled,
      isEnrolled,
      supportedTypes,
      biometricType,
    };
  } catch (error) {
    return {
      isAvailable: false,
      isEnrolled: false,
      supportedTypes: [],
      biometricType: 'none',
    };
  }
}

/**
 * Verifica se o Face ID está habilitado nas preferências
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return value === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Habilita ou desabilita o Face ID nas preferências
 */
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    throw new Error('Erro ao salvar preferência de biometria');
  }
}

/**
 * Verifica se já foi perguntado ao usuário sobre biometria
 */
export async function hasAskedBiometric(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_ASKED_KEY);
    return value === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Marca que já foi perguntado ao usuário sobre biometria
 */
export async function setAskedBiometric(asked: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(BIOMETRIC_ASKED_KEY, asked ? 'true' : 'false');
  } catch (error) {
    // Ignora erros
  }
}

/**
 * Remove a preferência de biometria (usado no logout)
 */
export async function clearBiometricPreference(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    // Não remove BIOMETRIC_ASKED_KEY para não perguntar novamente após logout
  } catch (error) {
    // Ignora erros ao limpar
  }
}

