import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface College {
  id: string;
  name: string;
  acronym?: string;
  city?: string;
  state?: string;
}

interface CollegeSelectModalProps {
  visible: boolean;
  onClose: () => void;
  colleges: College[];
  selectedCollegeId?: string;
  onSelect: (college: College) => void;
  loading?: boolean;
  displayCollege: (c: College) => string;
}

export default function CollegeSelectModal({
  visible,
  onClose,
  colleges,
  selectedCollegeId,
  onSelect,
  loading = false,
  displayCollege,
}: CollegeSelectModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel="Modal de seleção de faculdade"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={styles.modalContent}
              accessible={false}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={styles.modalTitle}
                  accessible={true}
                  accessibilityRole="header"
                >
                  Selecione sua faculdade
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.modalClose}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Fechar modal"
                >
                  <Ionicons name="close" size={24} color="#1A1A1A" />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3B5BDB" />
                  <Text style={styles.loadingText}>
                    Carregando faculdades...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={colleges}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.collegeItem}
                      onPress={() => {
                        onSelect(item);
                        onClose();
                      }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Selecionar ${displayCollege(item)}`}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.collegeItemText}>
                          {displayCollege(item)}
                        </Text>
                        {(item.city || item.state) && (
                          <Text style={styles.collegeLocation}>
                            {[item.city, item.state].filter(Boolean).join(" / ")}
                          </Text>
                        )}
                      </View>
                      {selectedCollegeId === item.id && (
                        <Ionicons name="checkmark" size={20} color="#3B5BDB" />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
                        Nenhuma faculdade encontrada
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  modalClose: {
    padding: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  collegeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  collegeItemText: {
    fontSize: 15,
    color: "#1A1A1A",
    flex: 1,
    fontWeight: "400",
  },
  collegeLocation: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
  },
});

