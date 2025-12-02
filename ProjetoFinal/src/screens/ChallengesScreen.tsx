import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert,
  ActivityIndicator, 
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/ApiService";
import ChallengeService from "../services/ChallengeService";
import { useFocusEffect } from '@react-navigation/native';
import DetailedChallengeCard from "../components/DetailedChallengeCard";
import CreateChallengeModal from "../components/CreateChallengeModal";

const difficultyOptions = [
  { value: 1, label: "Fácil" },
  { value: 2, label: "Médio" },
  { value: 3, label: "Difícil" },
  { value: 4, label: "Expert" },
  { value: 5, label: "Master" },
];

const ScreenHeader = ({ title, onAddPress }: { title: string; onAddPress: () => void }) => {
  const { colors, commonStyles } = useTheme();
  
  return (
    <View style={[commonStyles.header, styles.header]}>
      <Text style={[commonStyles.text, styles.title]}>{title}</Text>
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary }]} 
        onPress={onAddPress}
      >
        <Text style={styles.addButtonText}>+ Criar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function ChallengesScreen() {
  const { commonStyles, colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, { openCreate?: boolean }>, string>>();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingChallenge, setDeletingChallenge] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const handleAddPress = () => {
    setShowCreateModal(true);
  };

  useFocusEffect(
    useCallback(() => {
      loadChallenges();
    }, [user?.id])
  );

  useEffect(() => {
    loadChallenges();
  }, [user]);

  useEffect(() => {
    if ((route.params as any)?.openCreate) {
      handleAddPress();
    }
  }, [route.params]);

  const loadChallenges = async () => {
    setInitialLoading(true);
    try {
      const response = await ApiService.getMyChallenges();
      const items = response?.items || response?.data || (Array.isArray(response) ? response : []);
      setChallenges(items);
    } catch (err) {
      Alert.alert("Erro", ApiService.handleError(err));
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChallengePress = (challenge: { id?: string; _id?: string }) => {
    const id = challenge?.id || challenge?._id;
    if (!id) return;
    navigation.navigate('ChallengeDetails', { exerciseId: String(id) });
  };

  const handleDeletePress = (challenge: any) => {
    setDeletingChallenge(challenge);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingChallenge) return;
    try {
      const challengeId = deletingChallenge.id || deletingChallenge._id;
      await ApiService.deleteChallenge(String(challengeId));
      try { await ChallengeService.deleteChallenge(String(challengeId)); } catch {}
      setShowDeleteModal(false);
      setDeletingChallenge(null);
      await loadChallenges();
      Alert.alert('Sucesso', 'Desafio excluído com sucesso!');
    } catch (error: any) {
      setShowDeleteModal(false);
      setDeletingChallenge(null);
      Alert.alert('Erro', ApiService.handleError(error));
    }
  };

  const handleCopyCode = async (code?: string) => {
    if (!code) return;
    try {
      if (Platform.OS === 'web' && (navigator as any)?.clipboard) {
        await (navigator as any).clipboard.writeText(String(code));
        Alert.alert('Copiado', 'Código copiado para a área de transferência');
        return;
      }
      Alert.alert('Código do desafio', String(code));
    } catch {
      Alert.alert('Código do desafio', String(code));
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando desafios...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScreenHeader title="Meus Desafios" onAddPress={handleAddPress} />
      
      <ScrollView style={[commonStyles.scrollView, styles.scrollView]}>
        {challenges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhum desafio criado ainda. Clique em "+ Criar" para começar!
            </Text>
          </View>
        ) : (
          challenges.map((challenge, idx) => {
            const diffNum = Number(challenge.difficulty ?? 1);
            const diffOption = difficultyOptions.find(d => d.value === diffNum);
            const diffLabel = diffOption?.label || 'Fácil';
            const xp = challenge.baseXp || challenge.xp || 0;
            const code = challenge.publicCode || challenge.public_code || challenge.code;
            return (
              <DetailedChallengeCard
                key={String(challenge.id || challenge._id || idx)}
                title={challenge.title}
                description={challenge.description}
                difficulty={diffLabel}
                progress={challenge.progress}
                isPublic={challenge.isPublic}
                xp={xp}
                code={code}
                onPress={() => handleChallengePress(challenge)}
                onEdit={() => handleChallengePress(challenge)}
                onDelete={() => handleDeletePress(challenge)}
                onCopyCode={code ? () => handleCopyCode(code) : undefined}
              />
            );
          })
        )}
      </ScrollView>
      
      <CreateChallengeModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => loadChallenges()}
      />

      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View style={styles.overlay}> 
          <View style={[styles.confirmBox, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={[styles.confirmTitle, { color: colors.text }]}>Excluir Desafio</Text>
            <Text style={[styles.confirmDesc, { color: colors.textSecondary }]}>
              Tem certeza que deseja excluir {deletingChallenge?.title ? `"${deletingChallenge.title}"` : 'este desafio'}?
            </Text>
            <View style={styles.confirmActions}> 
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => { setShowDeleteModal(false); setDeletingChallenge(null); }}
              >
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
                <Text style={styles.deleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmBox: {
    width: '86%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  confirmTitle: { fontSize: 18, fontWeight: '800' },
  confirmDesc: { marginTop: 8, fontSize: 13 },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 16 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F44336', borderRadius: 8 },
  cancelText: { fontWeight: '700' },
  deleteText: { color: '#fff', fontWeight: '700' },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
