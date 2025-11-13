import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../contexts/AuthContext";

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
    if (!group || !members) return false;
    return members.some((member: any) => String(member.id) === userId);
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
              <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.primary }]} onPress={() => {}}>
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
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={() => {}}>
                <Text style={styles.primaryButtonText}>Criar Desafio</Text>
              </TouchableOpacity>
            </View>
            {challenges.length === 0 ? (
              <View style={[styles.emptyBox, { borderColor: colors.border }]}> 
                <Text style={{ color: colors.textSecondary }}>Nenhum Desafio criado ainda</Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}> 
                {challenges.map((ch: any, idx: number) => (
                  <View key={idx} style={[styles.challengeItem, { backgroundColor: colors.card }]}> 
                    <Text style={[styles.challengeTitle, { color: colors.text }]}>{ch.title || 'Desafio'}</Text>
                    <Text style={[styles.challengeMeta, { color: colors.textSecondary }]}>Dificuldade: {ch.difficulty ?? '-'} • XP: {ch.xp ?? '-'}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
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