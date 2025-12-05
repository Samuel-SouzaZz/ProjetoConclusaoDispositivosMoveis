import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Platform,
  useWindowDimensions
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/ApiService";
import ChallengeService from "../services/ChallengeService";
import { useFocusEffect } from '@react-navigation/native';
import SafeScreen from "../components/SafeScreen";
import ScreenHeaderWithAction from "../components/ScreenHeaderWithAction";
import LoadingScreen from "../components/LoadingScreen";
import EmptyState from "../components/EmptyState";
import CompactChallengeCard from "../components/CompactChallengeCard";
import CreateChallengeModal from "../components/CreateChallengeModal";
import ConfirmationModal from "../components/ConfirmationModal";

export default function ChallengesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, { openCreate?: boolean }>, string>>();
  const { width } = useWindowDimensions();
  
  const [challenges, setChallenges] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingChallenge, setDeletingChallenge] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  const isSmallScreen = width < 360;

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
    setDeleting(true);
    try {
      const challengeId = deletingChallenge.id || deletingChallenge._id;
      await ApiService.deleteChallenge(String(challengeId));
      try { await ChallengeService.deleteChallenge(String(challengeId)); } catch {}
      await loadChallenges();
      Alert.alert('Sucesso', 'Desafio excluído com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', ApiService.handleError(error));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeletingChallenge(null);
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
      <SafeScreen edges={['top']}>
        <ScreenHeaderWithAction
          title="Meus Desafios"
          actionLabel="Criar"
          onAction={handleAddPress}
        />
        <LoadingScreen message="Carregando desafios..." fullScreen={false} />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen edges={['top']}>
      <ScreenHeaderWithAction
        title="Meus Desafios"
        actionLabel="Criar"
        onAction={handleAddPress}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityRole="list"
        accessibilityLabel={challenges.length > 0 ? `Lista com ${challenges.length} desafios criados` : 'Lista vazia de desafios'}
      >
        {challenges.length === 0 ? (
          <EmptyState
            icon="rocket-outline"
            title="Comece a Criar!"
            message="Você ainda não criou nenhum desafio.\nToque em 'Criar' para começar!"
            actionLabel="Criar Primeiro Desafio"
            onAction={handleAddPress}
          />
        ) : (
          challenges.map((challenge, idx) => {
            const diffNum = Number(challenge.difficulty ?? 1);
            const xp = challenge.baseXp || challenge.xp || 0;
            const code = challenge.publicCode || challenge.public_code || challenge.code;
            return (
              <CompactChallengeCard
                key={String(challenge.id || challenge._id || idx)}
                title={challenge.title}
                description={challenge.description}
                difficulty={diffNum}
                xp={xp}
                code={code}
                isPublic={challenge.isPublic ?? true}
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

      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingChallenge(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Desafio"
        message={`Tem certeza que deseja excluir ${deletingChallenge?.title ? `"${deletingChallenge.title}"` : 'este desafio'}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmButtonColor="#F44336"
        cancelButtonColor={colors.textSecondary}
        loading={deleting}
        icon="trash-outline"
        iconColor="#F44336"
        backgroundColor={colors.card}
        textColor={colors.text}
        borderColor={colors.border}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
});
