import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, StyleSheet } from "react-native";
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

  async function loadMembers() {
    try {
      setLoading(true);
      const data = await ApiService.getGroup(String(groupId));
      const rawMembers = Array.isArray(data?.members) ? data.members : data?.items || [];
      setMembers(rawMembers);
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

  async function handlePromote(member: any) {
    const memberId = getMemberId(member);
    if (!memberId) {
      Alert.alert("Erro", "Não foi possível identificar o membro.");
      return;
    }

    try {
      await ApiService.setGroupMemberRole(String(groupId), memberId, 'MODERATOR');
      await loadMembers();
      Alert.alert("Sucesso", "Membro promovido com sucesso.");
    } catch (err: any) {
      Alert.alert("Erro", ApiService.handleError(err));
    }
  }

  async function handleRemove(member: any) {
    const memberId = getMemberId(member);
    if (!memberId) {
      Alert.alert("Erro", "Não foi possível identificar o membro.");
      return;
    }

    Alert.alert(
      'Remover membro',
      'Tem certeza que deseja remover este membro do grupo?',
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
                renderItem={({ item }) => {
                  const name = item.name || item.handle || "Membro";
                  const firstLetter = String(name).charAt(0).toUpperCase();
                  const memberId = getMemberId(item);
                  const isYou = !!(memberId && user?.id && String(memberId) === String(user.id));
                  // Consideramos que, nesta tela, o usuário logado (criador) é o Dono
                  const isOwner = isYou;

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
                          <Text style={[styles.memberName, { color: colors.primary }]}>{name}</Text>
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
                        {isOwner ? (
                          <View
                            style={[
                              styles.ownerBadge,
                              { backgroundColor: "#E53E3E" },
                            ]}
                          >
                            <Text style={[styles.ownerBadgeText, { color: "#fff" }]}>Dono</Text>
                          </View>
                        ) : (
                          <>
                            <Text style={[styles.roleText, { color: colors.primary }]}>Membro</Text>
                            <View style={styles.actionsRow}>
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
                            </View>
                          </>
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
