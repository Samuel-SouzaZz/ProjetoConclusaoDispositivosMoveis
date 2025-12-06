import React, { useRef, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import BaseModal from "./common/BaseModal";

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (photoUri: string, base64?: string) => void;
  initialCameraType?: CameraType;
}

export default function CameraModal({
  visible,
  onClose,
  onPhotoTaken,
  initialCameraType = "front",
}: CameraModalProps) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>(initialCameraType);
  const cameraRef = useRef<any>(null);

  React.useEffect(() => {
    if (visible && !cameraPermission?.granted) {
      requestCameraPermission();
    }
  }, [visible]);

  async function handleCapture() {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (photo && photo.uri) {
        onPhotoTaken(photo.uri, photo.base64 || undefined);
        onClose();
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível tirar a foto. Tente novamente.");
    }
  }

  function toggleCameraFacing() {
    setCameraType((current) => (current === "back" ? "front" : "back"));
  }

  if (!cameraPermission) {
    return null;
  }

  if (!cameraPermission.granted) {
    return (
      <BaseModal visible={visible} onClose={onClose}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={48} color="#999" />
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestCameraPermission}
          >
            <Ionicons name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      animationType="slide"
      dismissible={false}
      position="center"
      overlayStyle={styles.overlay}
      containerStyle={styles.container}
    >
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={cameraType}>
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Fechar câmera"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>

            <View style={styles.bottomControls}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraFacing}
                accessibilityLabel="Alternar entre câmera frontal e traseira"
                accessibilityRole="button"
              >
                <Ionicons name="camera-reverse" size={32} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCapture}
                accessibilityLabel="Tirar foto"
                accessibilityRole="button"
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              <View style={styles.placeholder} />
            </View>
          </View>
        </CameraView>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "#000",
  },
  container: {
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    borderRadius: 0,
    borderWidth: 0,
    padding: 0,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  controls: {
    flex: 1,
    backgroundColor: "transparent",
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 20,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
  },
  bottomControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  flipButton: {
    padding: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4A90E2",
  },
  placeholder: {
    width: 60,
  },
  permissionContainer: {
    padding: 40,
    alignItems: "center",
    gap: 20,
  },
  permissionButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 30,
  },
});

