import React, { useEffect, useState, useMemo } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/ApiService";

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: "500",
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 24,
  },
  screenSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardContainer: {
    flex: 1,
    marginTop: 24,
    borderRadius: 18,
    padding: 16,
  },
  memberCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  memberInfo: { flex: 1 },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  memberName: { fontSize: 15, fontWeight: "600" },
  youTag: { fontSize: 13, marginLeft: 4 },
  joinedAt: { fontSize: 12, marginTop: 2 },
  rightActions: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 12,
  },
  ownerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  ownerBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  roleText: {
    fontSize: 12,
    marginBottom: 6,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  outlineButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  outlineButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

type RouteProps = RouteProp<
  { GroupMembersManage: { groupId: string; groupName?: string } },
  "GroupMembersManage"
>;

export default function GroupMembersManageScreen() {
  const { colors, commonStyles } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { groupId, groupName } = route.params;

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  async function loadMembers() {
    try {
      setLoading(true);
      const data = await ApiService.getGroup(String(groupId));
      const rawMembers = Array.isArray(data?.members) ? data.members : data?.items || [];
      setMembers(rawMembers);
      
      // Encontrar role do usuário atual
      const currentMember = rawMembers.find((m: any) => {
        const memberId = getMemberId(m);
        return memberId && user?.id && String(memberId) === String(user.id);
      });
      
      if (currentMember) {
        // Tentar diferentes campos onde o role pode estar
        const role = String(
          currentMember.role || 
          currentMember.roleName || 
          currentMember.userRole ||
          currentMember.memberRole ||
          'MEMBER'
        ).trim().toUpperCase();
        console.log("Role do usuário atual detectado:", role, "Membro completo:", currentMember);
        setCurrentUserRole(role);
      } else {
        const membersInfo = rawMembers.map((member: any) => ({ id: getMemberId(member), role: getMemberRole(member) }));
        console.warn("Usuário atual não encontrado na lista de membros. User ID:", user?.id, "Membros:", membersInfo);
        setCurrentUserRole(null);
      }
    } catch (err: any) {
      Alert.alert("Erro", ApiService.handleError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  function getMemberId(member: any): string | null {
    const id = member?.id ?? member?.userId ?? member?.user?.id;
    return id ? String(id) : null;
  }

  function getMemberRole(member: any): string {
    const role = String(member?.role || member?.roleName || 'MEMBER').trim().toUpperCase();
    return role;
  }

  function getMemberName(member: any): string {
    return member?.name || member?.user?.name || member?.handle || "Membro";
  }

  const canManageMembers = useMemo(() => {
    if (!currentUserRole) return false;
    const role = currentUserRole.toUpperCase();
    return role === 'OWNER' || role === 'MODERATOR';
  }, [currentUserRole]);

  const isOwner = useMemo(() => {
    const role = currentUserRole ? String(currentUserRole).trim().toUpperCase() : '';
    const result = role === 'OWNER';
    console.log("isOwner calculado:", { currentUserRole, role, result });
    return result;
  }, [currentUserRole]);

  const isModerator = useMemo(() => {
    const role = currentUserRole ? String(currentUserRole).trim().toUpperCase() : '';
    return role === 'MODERATOR';
  }, [currentUserRole]);

  async function handlePromote(member: any) {
    const memberId = getMemberId(member);
    if (!memberId) {
      Alert.alert("Erro", "Não foi possível identificar o membro.");
      return;
    }
    
    const memberRole = getMemberRole(member);
    if (memberRole === 'OWNER') {
      Alert.alert("Erro", "Não é possível alterar o papel do dono.");
      return;
    }
    
    if (memberRole === 'MODERATOR') {
      Alert.alert("Info", "Este membro já é moderador.");
      return;
    }

    try {
      await ApiService.setGroupMemberRole(String(groupId), memberId, 'MODERATOR');
      await loadMembers();
      Alert.alert("Sucesso", "Membro promovido a moderador.");
    } catch (err: any) {
      Alert.alert("Erro", ApiService.handleError(err));
    }
  }

  async function handleDemote(member: any) {
    console.log("handleDemote chamado com:", member);
    const memberId = getMemberId(member);
    if (!memberId) {
      console.error("Erro: não foi possível identificar o membro");
      Alert.alert("Erro", "Não foi possível identificar o membro.");
      return;
    }
    
    const memberRole = getMemberRole(member);
    console.log("Role do membro a ser rebaixado:", memberRole);
    
    if (memberRole === 'OWNER') {
      Alert.alert("Erro", "Não é possível rebaixar o dono do grupo.");
      return;
    }
    
    if (memberRole === 'MEMBER') {
      Alert.alert("Info", "Este membro já possui o papel mais baixo (Membro).");
      return;
    }

    if (memberRole !== 'MODERATOR') {
      console.warn("Role inesperado para rebaixamento:", memberRole);
      Alert.alert("Erro", `Não é possível rebaixar um membro com papel: ${memberRole}`);
      return;
    }

    console.log("Mostrando alerta de confirmação para rebaixar");
    
    // Função para executar o rebaixamento
    const executeDemote = async () => {
      console.log("Confirmado rebaixamento de:", memberId);
      try {
        console.log("Chamando API para rebaixar membro:", { groupId, memberId, role: 'MEMBER' });
        await ApiService.setGroupMemberRole(String(groupId), memberId, 'MEMBER');
        console.log("API chamada com sucesso, recarregando membros");
        await loadMembers();
        Alert.alert('Sucesso', 'Moderador rebaixado a membro.');
      } catch (err: any) {
        console.error("Erro ao rebaixar membro:", err);
        Alert.alert('Erro', ApiService.handleError(err));
      }
    };

    // No web, usar window.confirm como fallback
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm(`Tem certeza que deseja remover o cargo de moderador de ${getMemberName(member)}?`);
      if (confirmed) {
        console.log("Confirmado via window.confirm");
        executeDemote().catch((err) => {
          console.error("Erro não tratado em executeDemote:", err);
          Alert.alert('Erro', 'Ocorreu um erro ao rebaixar o membro.');
        });
      } else {
        console.log("Rebaixamento cancelado via window.confirm");
      }
      return;
    }

    Alert.alert(
      'Rebaixar moderador',
      `Tem certeza que deseja remover o cargo de moderador de ${getMemberName(member)}?`,
      [
        { 
          text: 'Cancelar', 
          style: 'cancel', 
          onPress: () => {
            console.log("Rebaixamento cancelado");
          }
        },
        {
          text: 'Rebaixar',
          style: 'default',
          onPress: () => {
            console.log("Botão Rebaixar do alerta pressionado");
            // Executar de forma assíncrona mas não bloquear
            executeDemote().catch((err) => {
              console.error("Erro não tratado em executeDemote:", err);
              Alert.alert('Erro', 'Ocorreu um erro ao rebaixar o membro.');
            });
          },
        },
      ],
      { cancelable: true }
    );
  }

  async function handleRemove(member: any) {
    const memberId = getMemberId(member);
    if (!memberId) {
      Alert.alert("Erro", "Não foi possível identificar o membro.");
      return;
    }
    
    const memberRole = getMemberRole(member);
    if (memberRole === 'OWNER') {
      Alert.alert("Erro", "Não é possível remover o dono do grupo.");
      return;
    }

    Alert.alert(
      'Remover membro',
      `Tem certeza que deseja remover ${getMemberName(member)} do grupo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.removeGroupMember(String(groupId), memberId);
              await loadMembers();
              Alert.alert('Sucesso', 'Membro removido do grupo.');
            } catch (err: any) {
              Alert.alert('Erro', ApiService.handleError(err));
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={16} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Voltar para o Grupo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Gerenciar Membros</Text>
        <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
          {groupName || groupId} - {members.length} {members.length === 1 ? "membro" : "membros"}
        </Text>

        {!canManageMembers && currentUserRole && (
          <View style={{ marginTop: 16, padding: 12, borderRadius: 10, backgroundColor: '#FFF3CD', borderColor: '#FFEEBA', borderWidth: 1 }}>
            <Text style={{ color: '#856404', fontSize: 14 }}>
              Atenção: Apenas donos e moderadores podem gerenciar membros.
              Seu papel: {currentUserRole === 'OWNER' ? 'Dono' : currentUserRole === 'MODERATOR' ? 'Moderador' : 'Membro'}
            </Text>
          </View>
        )}

        {canManageMembers && (
          <View style={{ marginTop: 16, padding: 12, borderRadius: 10, backgroundColor: '#D1ECF1', borderColor: '#BEE5EB', borderWidth: 1 }}>
            <Text style={{ color: '#0C5460', fontSize: 14 }}>
               Permissões: {isOwner ? 'Dono - Pode promover/rebaixar/remover qualquer membro (exceto você mesmo e outros donos)' : 'Moderador - Pode promover/rebaixar membros normais e moderadores, e remover membros normais e outros moderadores'}
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            {members.length === 0 ? (
              <Text style={{ color: colors.textSecondary }}>Nenhum membro encontrado.</Text>
            ) : (
              <FlatList
                data={members}
                keyExtractor={(item: any, index) => String(item.id ?? item.userId ?? index)}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 16 }}
                renderItem={({ item }) => {
                  const memberId = getMemberId(item);
                  const memberName = getMemberName(item);
                  const memberRole = getMemberRole(item);
                  const isYou = !!(memberId && user?.id && String(memberId) === String(user.id));
                  
                  const firstLetter = String(memberName).charAt(0).toUpperCase();
                  
                  const getRoleLabel = (role: string) => {
                    switch(role.toUpperCase()) {
                      case 'OWNER': return 'Dono';
                      case 'MODERATOR': return 'Moderador';
                      default: return 'Membro';
                    }
                  };

             // Lógica de permissões
                const isMemberNormal = memberRole === 'MEMBER';
                const isMemberModerator = memberRole === 'MODERATOR';
                const isMemberOwner = memberRole === 'OWNER';

            // Dono E Moderador podem promover membros normais para moderador
                const canPromote = (isOwner || isModerator) && isMemberNormal && !isYou;
                
                // Debug: log para verificar por que o botão não aparece
                if (isMemberNormal && !isYou) {
                  console.log("DEBUG - Verificando botão Promover:", {
                    isOwner,
                    isMemberNormal,
                    isYou,
                    memberRole,
                    currentUserRole,
                    canPromote,
                    isOwnerValue: isOwner,
                    memberName: memberName
                  });
                }

            // Dono E Moderador podem rebaixar moderadores para membro
               const canDemote = (isOwner || isModerator) && isMemberModerator && !isYou;

            // Dono pode remover QUALQUER membro (exceto ele mesmo e outros donos)
               const ownerCanRemoveMember = isOwner && !isYou && !isMemberOwner;

            // Moderador pode remover membros normais E outros moderadores (mas não donos)
               const moderatorCanRemoveMember = isModerator && !isYou && !isMemberOwner && (isMemberNormal || isMemberModerator);

            // Quem pode remover? (Dono pode remover qualquer um exceto donos, Moderador pode remover membros e moderadores)
               const canRemoveThisMember = ownerCanRemoveMember || moderatorCanRemoveMember;


                  return (
                    <View
                      style={[
                        styles.memberCard,
                        { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
                      ]}
                    >
                      <View
                        style={[
                          styles.avatar,
                          { backgroundColor: "rgba(255,255,255,0.06)" },
                        ]}
                      >
                        <Text style={[styles.avatarText, { color: colors.text }]}>{firstLetter}</Text>
                      </View>

                      <View style={styles.memberInfo}>
                        <View style={styles.memberNameRow}>
                          <Text style={[styles.memberName, { color: colors.primary }]}>{memberName}</Text>
                          {isYou && (
                            <Text style={[styles.youTag, { color: colors.textSecondary }]}>
                              {' '}
                              (Você)
                            </Text>
                          )}
                        </View>
                        <Text style={[styles.joinedAt, { color: colors.textSecondary }]}>
                          Entrou em: {formatDate(item.joinedAt)}
                        </Text>
                      </View>

                      <View style={styles.rightActions}>
                        {isYou ? (
                          <View
                            style={[
                              styles.ownerBadge,
                              { 
                                backgroundColor: memberRole === 'OWNER' ? "#E53E3E" : 
                                               memberRole === 'MODERATOR' ? "#3182CE" : colors.primary 
                              },
                            ]}
                          >
                            <Text style={[styles.ownerBadgeText, { color: "#fff" }]}>
                              {getRoleLabel(memberRole)}
                            </Text>
                          </View>
                        ) : canManageMembers ? (
                          <>
                            <Text style={[styles.roleText, { 
                              color: memberRole === 'OWNER' ? "#E53E3E" : 
                                     memberRole === 'MODERATOR' ? "#3182CE" : colors.textSecondary 
                            }]}>
                              {getRoleLabel(memberRole)}
                            </Text>
                            <View style={styles.actionsRow}>
                              {/* Botão PROMOVER (dono para membros normais) */}
                              {canPromote && (
                                <TouchableOpacity
                                  style={[styles.outlineButton, { borderColor: colors.primary }]}
                                  onPress={() => handlePromote(item)}
                                >
                                  <Text
                                    style={[styles.outlineButtonText, { color: colors.primary }]}
                                  >
                                    Promover
                                  </Text>
                                </TouchableOpacity>
                              )}
                              
                              {/* Botão REBAIXAR (dono para moderadores) */}
                              {canDemote && (
                                <TouchableOpacity
                                  style={[styles.outlineButton, { borderColor: "#F59E0B" }]}
                                  onPress={() => {
                                    console.log("Botão Rebaixar pressionado para:", getMemberName(item), getMemberRole(item));
                                    handleDemote(item);
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text
                                    style={[styles.outlineButtonText, { color: "#F59E0B" }]}
                                  >
                                    Rebaixar
                                  </Text>
                                </TouchableOpacity>
                              )}
                              
                              {/* Botão REMOVER */}
                              {canRemoveThisMember && (
                                <TouchableOpacity
                                  style={[styles.outlineButton, { borderColor: "#E53E3E" }]}
                                  onPress={() => handleRemove(item)}
                                >
                                  <Text
                                    style={[styles.outlineButtonText, { color: "#E53E3E" }]}
                                  >
                                    Remover
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </>
                        ) : (
                          <Text style={[styles.roleText, { 
                            color: memberRole === 'OWNER' ? "#E53E3E" : 
                                   memberRole === 'MODERATOR' ? "#3182CE" : colors.textSecondary 
                          }]}>
                            {getRoleLabel(memberRole)}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        )}
      </View>
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