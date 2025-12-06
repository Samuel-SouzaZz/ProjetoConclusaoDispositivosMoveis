import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
  ModalProps,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface BaseModalProps extends Omit<ModalProps, 'children'> {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  overlayStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  animationType?: "none" | "slide" | "fade";
  dismissible?: boolean;
  position?: "center" | "bottom";
  maxWidth?: number;
}

// Componente base reutilizável para todos os modais
export default function BaseModal({
  visible,
  onClose,
  children,
  overlayStyle,
  containerStyle,
  animationType = "fade",
  dismissible = true,
  position = "center",
  maxWidth,
  ...modalProps
}: BaseModalProps) {
  const { colors } = useTheme();

  const overlayStyles = [
    styles.overlay,
    position === "bottom" && styles.overlayBottom,
    position === "center" && styles.overlayCenter,
    overlayStyle,
  ];

  const containerStyles = [
    styles.modalContainer,
    position === "bottom" && styles.modalContainerBottom,
    position === "center" && styles.modalContainerCenter,
    { backgroundColor: colors.card, borderColor: colors.border },
    maxWidth && { maxWidth },
    containerStyle,
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      accessible={true}
      accessibilityViewIsModal={true}
      {...modalProps}
    >
      <TouchableWithoutFeedback onPress={dismissible ? onClose : undefined}>
        <View style={overlayStyles}>
          <TouchableWithoutFeedback>
            <View style={containerStyles}>{children}</View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  overlayCenter: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayBottom: {
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainerCenter: {
    width: "100%",
    maxWidth: 400,
  },
  modalContainerBottom: {
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    minHeight: "40%",
  },
});

