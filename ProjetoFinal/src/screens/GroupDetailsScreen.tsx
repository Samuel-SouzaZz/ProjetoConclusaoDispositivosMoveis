import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, FlatList, Modal, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../contexts/AuthContext";
import DetailedChallengeCard from "../components/DetailedChallengeCard";
import CreateChallengeModal from "../components/CreateChallengeModal";

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
  memberName: { fontSize: 14, fontWeight: '600', minWidth: 100, flexShrink: 1 },
  memberRole: { fontSize: 12 },
  joinedAt: { fontSize: 12 },
  challengeItem: { borderRadius: 12, padding: 12 },
  challengeTitle: { fontSize: 14, fontWeight: '700' },
  challengeMeta: { fontSize: 12 },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  confirmMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  confirmButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  confirmCancelButton: {
    borderWidth: 1,
  },
  confirmDeleteButton: {
    backgroundColor: '#F44336',
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  editModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  editModalCard: { width: '100%', maxWidth: 560, borderRadius: 16, padding: 16 },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

type GroupDetailsRoute = RouteProp<RootStackParamList, "GroupDetails">;

// Função auxiliar para obter ID do membro
function getMemberId(member: any): string | null {
  const id = member?.id ?? member?.userId ?? member?.user?.id;
  return id ? String(id) : null;
}

// Função para verificar se é dono (atualizada)
function isOwner({ group, members, userId }: { group: any, members: any[], userId: string }) {
  if (!userId) return false;
  
  // Primeiro verifica se é o dono pelo group.ownerId
  if (group?.ownerId && String(group.ownerId) === String(userId)) return true;
  
  // Se não encontrar, procura nos membros
  const me = members.find((m: any) => {
    const mid = getMemberId(m);
    return mid && String(mid) === String(userId);
  });
  
  if (!me) return false;
  
  // Verifica o role do membro
  const role = String(me?.role || '').toUpperCase();
  return role === 'OWNER' || role === 'ADMIN' || role === 'MODERATOR';
}

// Função para obter role do membro
function getMemberRole(member: any): string {
  return String(member?.role || 'MEMBER').toUpperCase();
}

// Função para obter nome do membro
function getMemberName(member: any): string {
  // Tentar vários campos possíveis onde o nome pode estar
  let name = 
    member?.name || 
    member?.user?.name || 
    member?.userName ||
    member?.handle || 
    member?.user?.handle ||
    member?.displayName ||
    member?.user?.displayName ||
    member?.fullName ||
    member?.user?.fullName;
  
  // Se ainda não encontrou, tentar pegar do objeto user completo
  if (!name && member?.user) {
    const userObj = member.user;
    name = userObj?.name || userObj?.handle || userObj?.email?.split('@')[0];
  }
  
  // Se ainda não encontrou, tentar buscar em qualquer propriedade que contenha "name" ou "Name"
  if (!name) {
    for (const key in member) {
      if (key.toLowerCase().includes('name') && typeof member[key] === 'string' && member[key]) {
        name = member[key];
        break;
      }
    }
  }
  
  // Se ainda não encontrou, tentar no objeto user
  if (!name && member?.user) {
    for (const key in member.user) {
      if (key.toLowerCase().includes('name') && typeof member.user[key] === 'string' && member.user[key]) {
        name = member.user[key];
        break;
      }
    }
  }
  
  // Se ainda não encontrou, usar email como fallback
  if (!name) {
    const email = member?.email || member?.user?.email;
    if (email && typeof email === 'string') {
      name = email.split('@')[0];
    }
  }
  
  return name || "Membro";
}

// Função para obter label do role
function getRoleLabel(role: string): string {
  switch(role.toUpperCase()) {
    case 'OWNER': return 'Dono';
    case 'MODERATOR': return 'Moderador';
    case 'ADMIN': return 'Admin';
    default: return 'Membro';
  }
}

// Função para obter cor do role
function getRoleColor(role: string, colors: any): string {
  switch(role.toUpperCase()) {
    case 'OWNER': return "#E53E3E";
    case 'MODERATOR': return "#3182CE";
    case 'ADMIN': return "#805AD5";
    default: return colors.textSecondary;
  }
}

export default function GroupDetailsScreen() {
  const { colors, commonStyles, isDarkMode } = useTheme();
  const route = useRoute<GroupDetailsRoute>();
  const navigation = useNavigation<any>();
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
  const [showEdit, setShowEdit] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);

  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
  const [deletingChallenge, setDeletingChallenge] = useState(false);

  function copyInviteLink(text: string) {
    if (!text) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          Alert.alert('Copiado', 'Link de convite copiado para a área de transferência');
        })
        .catch(() => {
          Alert.alert('Erro', 'Não foi possível copiar o link');
        });
      return;
    }
    Alert.alert('Link de Convite', text);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadData(mounted);
    })();
    return () => { mounted = false; };
  }, [groupId]);

  // Recarregar dados quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (mounted) {
          await loadData(mounted);
        }
      })();
      return () => { mounted = false; };
    }, [groupId])
  );

  async function loadData(mounted = true) {
    try {
      setLoading(true);
      const data = await ApiService.getGroup(groupId);
      if (!mounted) return;
      setGroup(data);
      
      // Configurar dados para edição
      try {
        const name = String(data?.name || data?.title || '');
        setEditName(name);
        setEditDescription(String(data?.description || ''));
        const visibility = String(data?.visibility || '').toUpperCase();
        const isPublic = visibility ? visibility === 'PUBLIC' : Boolean(data?.isPublic ?? true);
        setEditIsPublic(isPublic);
      } catch {}
      
      // Carregar membros
      try {
        const mm = Array.isArray(data?.members) ? data.members : data?.items || [];
        const mItems = Array.isArray(mm) ? mm : [];

        console.log("DEBUG GroupDetailsScreen - members brutos:", JSON.stringify(mItems, null, 2));

        // Buscar nomes dos membros usando o perfil público
        const membersWithNames: any[] = [];
        for (const member of mItems) {
          const memberId = getMemberId(member);

          if (memberId) {
            try {
              const profile: any = await ApiService.getPublicProfile(String(memberId));

              const userObj = profile?.user || profile;

              const profileName =
                (userObj && (userObj.name || userObj.handle)) ||
                (userObj?.email && typeof userObj.email === 'string' && userObj.email.includes('@')
                  ? userObj.email.split('@')[0]
                  : undefined);

              if (profileName) {
                membersWithNames.push({
                  ...member,
                  name: profileName,
                  user: {
                    ...(member.user || {}),
                    name: userObj.name || profileName,
                    handle: userObj.handle || member.user?.handle,
                    email: userObj.email || member.user?.email,
                    id: memberId,
                  },
                });
                continue;
              }
            } catch (err: any) {
              console.warn(`Não foi possível buscar perfil do membro ${memberId}:`, err?.message || err);
            }
          }

          // Fallback
          const fallbackName = getMemberName(member);
          membersWithNames.push({
            ...member,
            name: fallbackName,
          });
        }

        console.log("Membros carregados com nomes:", membersWithNames.map((m: any) => ({
          id: getMemberId(m),
          name: getMemberName(m)
        })));
        setMembers(membersWithNames);
        
        // Encontrar role do usuário atual
        const currentMember = mItems.find((m: any) => {
          const memberId = getMemberId(m);
          return memberId && user?.id && String(memberId) === String(user.id);
        });
        
        if (currentMember) {
          const role = getMemberRole(currentMember);
          setCurrentUserRole(role);
        } else {
          setCurrentUserRole(null);
        }
      } catch {}
      
      // Carregar desafios
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
      const mid = getMemberId(member);
      return mid && mid === String(userId);
    });
  }

  async function handleChallengeCreated() {
    setShowCreate(false);
    await loadData();
  }

  function handleDeleteChallenge(challengeId?: string) {
    if (!challengeId) return;
    setChallengeToDelete(String(challengeId));
  }

  async function handleConfirmDeleteChallenge() {
    if (!challengeToDelete) return;
    try {
      setDeletingChallenge(true);
      await ApiService.deleteChallenge(String(challengeToDelete));
      await loadData();
      setChallengeToDelete(null);
      Alert.alert('Sucesso', 'Desafio excluído com sucesso.');
    } catch (err: any) {
      Alert.alert('Erro', ApiService.handleError(err));
    } finally {
      setDeletingChallenge(false);
    }
  }

  async function handleUpdateGroup() {
    if (!editName.trim()) {
      Alert.alert('Erro', 'Informe o nome do grupo');
      return;
    }
    try {
      setUpdating(true);
      await ApiService.updateGroup(String(groupId), {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        isPublic: editIsPublic,
      });
      await loadData();
      Alert.alert('Sucesso', 'Grupo atualizado com sucesso');
      setShowEdit(false);
    } catch (err: any) {
      Alert.alert('Erro', ApiService.handleError(err));
    } finally {
      setUpdating(false);
    }
  }

  async function handleGenerateInviteLink() {
    if (!group?.id) {
      Alert.alert('Erro', 'Grupo inválido');
      return;
    }
    try {
      const result = await ApiService.generateGroupInviteLink(String(group.id));
      const token = result?.token || result?.inviteToken || '';
      const url = result?.url || result?.link || '';
      const finalLink = url || token;
      if (!finalLink) {
        Alert.alert('Convite gerado', 'Convite criado com sucesso.');
        return;
      }
      setInviteLink(finalLink);
    } catch (err: any) {
      Alert.alert('Erro', ApiService.handleError(err));
    }
  }

  const owner = isOwner({ group, members, userId: String(user?.id || '') });
  const userIsMember = isMember({ group, members, userId: String(user?.id || '') });
  const visibility = String(group?.visibility || '').toUpperCase();
  const isPublicGroup = visibility ? visibility === 'PUBLIC' : Boolean(group?.isPublic ?? true);
  const isPrivateGroup = !isPublicGroup;

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
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
        <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.rowSpace}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>{group.name || group.title}</Text>
                <View style={[styles.badge, { backgroundColor: isDarkMode ? "#2D3748" : "#EDF2F7" }]}>
                  <Ionicons name={isPublicGroup ? "earth" : "lock-closed"} size={14} color={colors.textSecondary} />
                  <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{isPublicGroup ? "Público" : "Privado"}</Text>
                </View>
              </View>

              {owner && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.primary }]} onPress={() => setShowEdit(true)}>
                    <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Editar Grupo</Text>
                  </TouchableOpacity>
                  {isPrivateGroup && (
                    <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.primary }]} onPress={handleGenerateInviteLink}>
                      <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Gerar Convite</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.primary }]}
                    onPress={() =>
                      navigation.navigate('GroupMembersManage', {
                        groupId: String(groupId),
                        groupName: group.name || group.title,
                      })
                    }
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Gerenciar Membros</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {group.description ? (
              <Text style={[styles.description, { color: colors.textSecondary }]}>{group.description}</Text>
            ) : null}
            
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="people" size={18} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {members.length} membros
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
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.primary }]}
                onPress={() => {
                  navigation.navigate('GroupChallenges', {
                    groupId: String(group.id),
                    groupName: group.name || group.title,
                    groupDescription: group.description || '',
                  });
                }}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Ver Desafios</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.primary }]}
                onPress={() => {
                  navigation.navigate('GroupProgress', { groupId: String(group.id), groupName: group.name || group.title });
                }}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Meu Progresso</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.primary }]}
                onPress={() => {
                  navigation.navigate('GroupRanking', { groupId: String(group.id), groupName: group.name || group.title });
                }}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Ranking do Grupo</Text>
              </TouchableOpacity>
              
              {userIsMember ? (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: leaving ? 0.7 : 1 }]}
                  onPress={async () => {
                    try {
                      setLeaving(true);
                      await ApiService.leaveGroup(String(group.id));
                      await loadData();
                    } catch (err: any) {
                      Alert.alert('Erro', ApiService.handleError(err));
                    } finally {
                      setLeaving(false);
                    }
                  }}
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
                    } catch (err: any) {
                      Alert.alert('Erro', ApiService.handleError(err));
                    } finally {
                      setJoining(false);
                    }
                  }}
                  disabled={joining}
                >
                  <Text style={styles.primaryButtonText}>{joining ? 'Entrando...' : 'Entrar no Grupo'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {inviteLink && isPrivateGroup && (
            <View style={[styles.section, { backgroundColor: colors.background }]}>
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Link de Convite do Grupo</Text>
                <View style={{ marginTop: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10 }}>
                  <Text style={{ color: colors.textSecondary }} numberOfLines={2}>{inviteLink}</Text>
                </View>
                <View style={[styles.actions, { marginTop: 12 }]}>
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      if (inviteLink) {
                        copyInviteLink(inviteLink);
                      }
                    }}
                  >
                    <Text style={styles.primaryButtonText}>Copiar Link</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.primary }]}
                    onPress={() => setInviteLink(null)}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Membros do Grupo */}
          <View style={[styles.section, { backgroundColor: colors.background }]}>
            <View style={styles.rowSpace}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Membros do Grupo</Text>
              {currentUserRole && (
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Seu papel: {getRoleLabel(currentUserRole)}
                </Text>
              )}
            </View>
            {members.length === 0 ? (
              <View style={[styles.emptyBox, { borderColor: colors.border }]}>
                <Text style={{ color: colors.textSecondary }}>Nenhum membro encontrado</Text>
              </View>
            ) : (
              <FlatList
                data={members.slice(0, 10)} // Mostra apenas os primeiros 10
                keyExtractor={(item: any, index: number) => String(getMemberId(item) ?? index)}
                renderItem={({ item }: { item: any }) => {
                  const memberId = getMemberId(item);
                  const isMe = memberId && user?.id && String(memberId) === String(user.id);
                  const memberRole = getMemberRole(item);
                  const memberName = getMemberName(item);
                  const roleLabel = getRoleLabel(memberRole);
                  const roleColor = getRoleColor(memberRole, colors);

                  // Garantir que o nome não esteja vazio
                  const displayName = memberName && memberName !== "Membro" ? memberName : 
                    (memberId ? `Membro ${String(memberId).substring(0, 6)}` : "Membro");
                  
                  return (
                    <View style={[styles.memberItem, { borderBottomColor: colors.border }]}>
                      <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#2D3748' : '#EDF2F7' }]}>
                        <Text style={[styles.avatarText, { color: colors.text }]}>
                          {String(displayName).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          <Text style={[styles.memberName, { color: colors.text }]}>{displayName}</Text>
                          {isMe && (
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>(Você)</Text>
                          )}
                          <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}>
                            <Text style={[styles.roleBadgeText, { color: roleColor }]}>{roleLabel}</Text>
                          </View>
                        </View>
                        {item.joinedAt && (
                          <Text style={[styles.joinedAt, { color: colors.textSecondary }]}>
                            Entrou em: {formatDate(item.joinedAt)}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                }}
              />
            )}
            {members.length > 10 && (
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.primary, alignSelf: 'center', marginTop: 12 }]}
                onPress={() =>
                  navigation.navigate('GroupMembersManage', {
                    groupId: String(groupId),
                    groupName: group.name || group.title,
                  })
                }
              >
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                  Ver todos os {members.length} membros
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Desafios do Grupo */}
          <View style={[styles.section, { backgroundColor: colors.background }]}>
            <View style={styles.rowSpace}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Desafios do Grupo ({challenges.length || 0})</Text>
              {owner && (
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
                {challenges.slice(0, 5).map((ch: any, idx: number) => {
                  const diffNum = Number(ch.difficulty ?? 1);
                  const diffLabel = diffNum <= 1 ? 'Fácil' : diffNum === 2 ? 'Médio' : 'Difícil';
                  const xp = ch.xp ?? ch.baseXp ?? 0;
                  const rawId = ch.id || ch._id || ch.exerciseId || ch.exercise?.id || ch.exercise?._id || ch.exerciseCode || ch.code;
                  const id = rawId ? String(rawId) : '';
                  return (
                    <DetailedChallengeCard
                      key={id || String(idx)}
                      title={ch.title || 'Desafio'}
                      description={ch.description}
                      difficulty={diffLabel}
                      progress={ch.progress ?? 0}
                      isPublic={Boolean(ch.isPublic ?? false)}
                      xp={xp}
                      onPress={() => {}}
                      onDelete={owner && id ? () => handleDeleteChallenge(id) : undefined}
                    />
                  );
                })}
              </View>
            )}
            {challenges.length > 5 && (
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.primary, alignSelf: 'center', marginTop: 12 }]}
                onPress={() => {
                  navigation.navigate('GroupChallenges', {
                    groupId: String(group.id),
                    groupName: group.name || group.title,
                    groupDescription: group.description || '',
                  });
                }}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                  Ver todos os {challenges.length} desafios
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 🔥 MODAL DE CONFIRMAÇÃO PARA EXCLUIR DESAFIO - ADICIONADO AQUI 🔥 */}
          <Modal
            visible={!!challengeToDelete}
            transparent
            animationType="fade"
            onRequestClose={() => !deletingChallenge && setChallengeToDelete(null)}
          >
            <View style={styles.confirmOverlay}>
              <View style={[styles.confirmCard, { backgroundColor: colors.card }]}>
                <View style={styles.confirmHeader}>
                  <Text style={[styles.confirmIcon, { color: '#FBBF24' }]}>⚠️</Text>
                  <Text style={[styles.confirmTitle, { color: colors.text }]}>Excluir Desafio</Text>
                </View>

                <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>
                  Tem certeza que deseja excluir este desafio? Esta ação não pode ser desfeita.
                </Text>

                <View style={styles.confirmFooter}>
                  <TouchableOpacity
                    style={[styles.confirmButton, styles.confirmCancelButton, { borderColor: colors.border }]}
                    onPress={() => !deletingChallenge && setChallengeToDelete(null)}
                    disabled={deletingChallenge}
                  >
                    <Text style={[styles.confirmCancelText, { color: colors.text }]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.confirmButton, styles.confirmDeleteButton]}
                    onPress={handleConfirmDeleteChallenge}
                    disabled={deletingChallenge}
                  >
                    <Text style={styles.confirmDeleteText}>
                      {deletingChallenge ? 'Excluindo...' : 'Excluir'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal Criar Desafio (reutilizando CreateChallengeModal) */}
          <CreateChallengeModal
            visible={showCreate}
            onClose={() => setShowCreate(false)}
            onSuccess={handleChallengeCreated}
            groupId={String(groupId)}
          />

          {/* Modal Editar Grupo */}
          <Modal visible={showEdit} transparent animationType="slide" onRequestClose={() => setShowEdit(false)}>
            <View style={styles.editModalOverlay}>
              <View style={[styles.editModalCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Editar Grupo</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text, marginTop: 12 }]}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Nome do Grupo"
                  placeholderTextColor={colors.textSecondary}
                />
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text, height: 90, marginTop: 10 }]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Descrição"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Visibilidade</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                  <TouchableOpacity
                    style={[styles.secondaryButton, { flex: 1, borderColor: editIsPublic ? colors.primary : colors.border }]}
                    onPress={() => setEditIsPublic(true)}
                  >
                    <Text style={[styles.secondaryButtonText, { color: editIsPublic ? colors.primary : colors.textSecondary }]}>
                      Público - Qualquer um pode entrar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryButton, { flex: 1, borderColor: !editIsPublic ? colors.primary : colors.border }]}
                    onPress={() => setEditIsPublic(false)}
                  >
                    <Text style={[styles.secondaryButtonText, { color: !editIsPublic ? colors.primary : colors.textSecondary }]}>
                      Privado - Apenas com convite
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.actions, { marginTop: 20 }]}>
                  <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.primary }]} onPress={() => setShowEdit(false)} disabled={updating}>
                    <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: updating ? 0.7 : 1 }]}
                    onPress={handleUpdateGroup}
                    disabled={updating}
                  >
                    <Text style={styles.primaryButtonText}>{updating ? 'Salvando...' : 'Salvar Alterações'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
  } catch (error) {
    return String(date);
  }
}