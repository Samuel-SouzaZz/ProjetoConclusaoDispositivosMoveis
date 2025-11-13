import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, FlatList, Modal, TextInput, Alert } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../contexts/AuthContext";
import DetailedChallengeCard from "../components/DetailedChallengeCard";

type GroupDetailsRoute = RouteProp<RootStackParamList, "GroupDetails">;

export default function GroupDetailsScreen() {
  const { colors, commonStyles, isDarkMode } = useTheme();
  const route = useRoute<GroupDetailsRoute>();
  const navigation = useNavigation();
  const { groupId } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [leaving, setLeaving] = useState(false);
  const [joining, setJoining] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 1,
    xp: 100,
    isPublic: true,
    codeTemplate: '// Seu código aqui\n'
  });

  const difficultyOptions = [
    { value: 1, label: 'Fácil', color: '#4CAF50' },
    { value: 2, label: 'Médio', color: '#FF9800' },
    { value: 3, label: 'Difícil', color: '#F44336' },
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadData(mounted);
    })();
    return () => { mounted = false; };
  }, [groupId]);

  async function loadData(mounted = true) {
    try {
      setLoading(true);
      const data = await ApiService.getGroup(groupId);
      if (!mounted) return;
      setGroup(data);
      // membros
      try {
        const mm = Array.isArray(data?.members) ? data.members : await ApiService.getGroupMembers(groupId);
        const mItems = Array.isArray(mm) ? mm : mm?.items || [];
        setMembers(mItems);
      } catch {}
      // desafios
      try {
        const cc = Array.isArray(data?.challenges) ? data.challenges : await ApiService.getGroupChallenges(groupId);
        const cItems = Array.isArray(cc) ? cc : cc?.items || [];
        setChallenges(cItems);
      } catch {}
      setError(null);
    } catch (err: any) {
      if (!mounted) return;
      setError(ApiService.handleError(err));
    } finally {
      if (mounted) setLoading(false);
    }
  }

  function isMember({ group, members, userId }: { group: any, members: any[], userId: string }) {
    if (!group || !members || !userId) return false;
    return members.some((member: any) => {
      const mid = String(member?.id ?? member?.userId ?? member?.user?.id ?? '');
      return mid && mid === userId;
    });
  }

  function isOwner({ group, members, userId }: { group: any, members: any[], userId: string }) {
    if (!userId) return false;
    if (group?.ownerId && String(group.ownerId) === userId) return true;
    if (group?.owner?.id && String(group.owner.id) === userId) return true;
    const me = members.find((m: any) => {
      const mid = String(m?.id ?? m?.userId ?? m?.user?.id ?? '');
      return mid && mid === userId;
    });
    const role = String(me?.role || '').toLowerCase();
    return role === 'owner' || role === 'admin' || role === 'moderator';
  }

  async function handleCreateChallenge() {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return;
    }
    try {
      setCreating(true);
      await ApiService.createGroupChallenge(String(groupId), {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        xp: formData.xp,
        isPublic: formData.isPublic,
        codeTemplate: formData.codeTemplate,
      });
      setShowCreate(false);
      setFormData({ title: '', description: '', difficulty: 1, xp: 100, isPublic: true, codeTemplate: '// Seu código aqui\n' });
      await loadData();
      Alert.alert('Sucesso', 'Desafio criado com sucesso');
    } catch (err: any) {
      Alert.alert('Erro', ApiService.handleError(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]} > 
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Voltar para Grupos</Text>
      </View>

      {loading ? (
        <View style={styles.center}> 
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}> 
          <Text style={{ color: colors.text }}>{error}</Text>
        </View>
      ) : !group ? (
        <View style={styles.center}> 
          <Text style={{ color: colors.textSecondary }}>Grupo não encontrado</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]} > 
          <View style={[styles.card, { backgroundColor: colors.card }]} > 
            <View style={styles.rowSpace}> 
              <Text style={[styles.name, { color: colors.text }]}>{group.name || group.title}</Text>
              <View style={[styles.badge, { backgroundColor: isDarkMode ? "#2D3748" : "#EDF2F7" }]} > 
                <Ionicons name={group.isPublic ? "earth" : "lock-closed"} size={14} color={colors.textSecondary} />
                <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{group.isPublic ? "Público" : "Privado"}</Text>
              </View>
            </View>
            {group.description ? (
              <Text style={[styles.description, { color: colors.textSecondary }]}>{group.description}</Text>
            ) : null}
            <View style={styles.metaRow}> 
              <View style={styles.metaItem}> 
                <Ionicons name="people" size={18} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {group.membersCount ?? 0} membros
                </Text>
              </View>
              <View style={styles.metaItem}> 
                <Ionicons name="calendar" size={18} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  Criado em: {formatDate(group.createdAt)}
                </Text>
              </View>
            </View>
            <View style={styles.actions}> 
              <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.primary }]} onPress={() => {}}>
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Ver Desafios</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.primary }]}
                onPress={() => {
                  // navegar para tela de progresso no grupo
                  // @ts-ignore
                  navigation.navigate('GroupProgress', { groupId: String(group.id), groupName: group.name || group.title });
                }}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Meu Progresso</Text>
              </TouchableOpacity>
              {isMember({ group, members, userId: String(user?.id || '') }) ? (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: leaving ? 0.7 : 1 }]}
                  onPress={async () => { 
                    try { 
                      setLeaving(true); 
                      await ApiService.leaveGroup(String(group.id)); 
                      await loadData();
                    } catch {} finally { setLeaving(false); } }}
                  disabled={leaving}
                >
                  <Text style={styles.primaryButtonText}>{leaving ? 'Saindo...' : 'Sair do Grupo'}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: joining ? 0.7 : 1 }]}
                  onPress={async () => { 
                    try { 
                      setJoining(true); 
                      await ApiService.joinGroup(String(group.id)); 
                      await loadData();
                    } catch {} finally { setJoining(false); } }}
                  disabled={joining}
                >
                  <Text style={styles.primaryButtonText}>{joining ? 'Entrando...' : 'Entrar no Grupo'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Membros do Grupo */}
          <View style={[styles.section, { backgroundColor: colors.background }]} > 
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Membros do Grupo</Text>
            {members.length === 0 ? (
              <View style={[styles.emptyBox, { borderColor: colors.border }]}><Text style={{ color: colors.textSecondary }}>Nenhum membro encontrado</Text></View>
            ) : (
              <FlatList
                data={members}
                keyExtractor={(item: any, index: number) => String(item.id ?? index)}
                renderItem={({ item }: { item: any }) => (
                  <View style={[styles.memberItem, { borderBottomColor: colors.border }]}> 
                    <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#2D3748' : '#EDF2F7' }]}> 
                      <Text style={[styles.avatarText, { color: colors.text }]}>{String(item.name || item.handle || 'U').charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}> 
                      <Text style={[styles.memberName, { color: colors.text }]}>{item.name || item.handle} {item.isYou ? '(Você)' : ''}</Text>
                      <Text style={[styles.memberRole, { color: colors.textSecondary }]}>{item.role || 'Membro'}</Text>
                    </View>
                    <Text style={[styles.joinedAt, { color: colors.textSecondary }]}>Entrou em: {formatDate(item.joinedAt)}</Text>
                  </View>
                )}
              />
            )}
          </View>

          {/* Desafios do Grupo */}
          <View style={[styles.section, { backgroundColor: colors.background }]}> 
            <View style={styles.rowSpace}> 
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Desafios do Grupo ({challenges.length || 0})</Text>
              {isOwner({ group, members, userId: String(user?.id || '') }) && (
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={() => setShowCreate(true)}>
                  <Text style={styles.primaryButtonText}>Criar Desafio</Text>
                </TouchableOpacity>
              )}
            </View>
            {challenges.length === 0 ? (
              <View style={[styles.emptyBox, { borderColor: colors.border }]}> 
                <Text style={{ color: colors.textSecondary }}>Nenhum Desafio criado ainda</Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}> 
                {challenges.map((ch: any, idx: number) => {
                  const diffNum = Number(ch.difficulty ?? 1);
                  const diffLabel = diffNum <= 1 ? 'Fácil' : diffNum === 2 ? 'Médio' : 'Difícil';
                  const xp = ch.xp ?? ch.baseXp ?? 0;
                  return (
                    <DetailedChallengeCard
                      key={String(ch.id || ch._id || idx)}
                      title={ch.title || 'Desafio'}
                      description={ch.description}
                      difficulty={diffLabel}
                      progress={ch.progress ?? 0}
                      isPublic={Boolean(ch.isPublic ?? false)}
                      xp={xp}
                      onPress={() => {}}
                    />
                  );
                })}
              </View>
            )}
          </View>

          {/* Modal Criar Desafio */}
          <Modal visible={showCreate} animationType="slide" onRequestClose={() => setShowCreate(false)}>
            <SafeAreaView style={commonStyles.container}>
              <View style={[commonStyles.header, styles.modalHeader, { borderBottomColor: colors.border }]}> 
                <TouchableOpacity onPress={() => setShowCreate(false)}>
                  <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>
                  {creating ? 'Criando...' : 'Criar Desafio'}
                </Text>
                <TouchableOpacity onPress={handleCreateChallenge} disabled={creating}>
                  {creating ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}> 
                <View style={[styles.card, { backgroundColor: colors.card }]}> 
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Título *</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                    value={formData.title}
                    onChangeText={(t) => setFormData({ ...formData, title: t })}
                    placeholder="Digite o título do desafio"
                    placeholderTextColor={colors.textSecondary}
                  />

                  <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Descrição</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.text, height: 90 }]}
                    value={formData.description}
                    onChangeText={(t) => setFormData({ ...formData, description: t })}
                    placeholder="Descrição do desafio"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                  />

                  <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Dificuldade</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {difficultyOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 2, alignItems: 'center' },
                          formData.difficulty === option.value && { backgroundColor: '#F0F8FF' },
                          { borderColor: option.color },
                        ]}
                        onPress={() => setFormData({ ...formData, difficulty: option.value })}
                      >
                        <Text style={[{ fontSize: 14, fontWeight: '600' }, formData.difficulty === option.value && { color: option.color }]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>XP Base</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                    value={String(formData.xp)}
                    onChangeText={(t) => setFormData({ ...formData, xp: parseInt(t) || 0 })}
                    keyboardType="numeric"
                  />

                  <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Template de Código</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.text, height: 120 }]}
                    value={formData.codeTemplate}
                    onChangeText={(t) => setFormData({ ...formData, codeTemplate: t })}
                    multiline
                  />

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 }}> 
                    <TouchableOpacity
                      style={[styles.checkbox, formData.isPublic && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                      onPress={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                    >
                      {formData.isPublic && <Text style={{ color: '#fff', fontWeight: '700' }}>✓</Text>}
                    </TouchableOpacity>
                    <Text style={{ color: colors.text }}>Desafio público (visível para todos)</Text>
                  </View>
                  <View style={{ height: 8 }} />
                </View>
              </ScrollView>
            </SafeAreaView>
          </Modal>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function formatDate(date?: string) {
  if (!date) return "--/--/----";
  try {
    const d = new Date(date);
    return d.toLocaleDateString();
  } catch {
    return String(date);
  }
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  back: { marginRight: 8 },
  title: { fontSize: 20, fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16 },
  card: { borderRadius: 14, padding: 16 },
  rowSpace: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 18, fontWeight: "700" },
  description: { marginTop: 8, fontSize: 14 },
  metaRow: { flexDirection: "row", marginTop: 12, gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12 },
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  primaryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  secondaryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  secondaryButtonText: { fontWeight: "700" },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  emptyBox: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  memberItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1 },
  avatar: { width: 34, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700' },
  memberName: { fontSize: 14, fontWeight: '600' },
  memberRole: { fontSize: 12 },
  joinedAt: { fontSize: 12 },
  challengeItem: { borderRadius: 12, padding: 12 },
  challengeTitle: { fontSize: 14, fontWeight: '700' },
  challengeMeta: { fontSize: 12 },
});