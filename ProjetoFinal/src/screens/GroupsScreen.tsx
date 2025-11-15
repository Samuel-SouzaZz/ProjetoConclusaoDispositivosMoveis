import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import CreateGroupModal from "../components/CreateGroupModal";

export default function GroupsScreen() {
  const { commonStyles, colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'public' | 'my'>('public');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = activeTab === 'public' ? await ApiService.getGroups() : await ApiService.getMyGroups();
        if (!mounted) return;
        const items = Array.isArray(data) ? data : data?.items || [];
        setGroups(items);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        setError(ApiService.handleError(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [activeTab]);

  async function onRefresh() {
    try {
      setRefreshing(true);
      const data = activeTab === 'public' ? await ApiService.getGroups() : await ApiService.getMyGroups();
      const items = Array.isArray(data) ? data : data?.items || [];
      setGroups(items);
      setError(null);
    } catch (err: any) {
      setError(ApiService.handleError(err));
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCreated() { await onRefresh(); }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Grupos de Estudo</Text>
        <TouchableOpacity style={[styles.createBtn, { borderColor: colors.primary }]} onPress={() => setShowCreate(true)}>
          <Text style={[styles.createBtnText, { color: colors.primary }]}>Criar Novo Grupo</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.tabsContainer, { backgroundColor: colors.background }]}> 
        <TouchableOpacity
          style={[styles.tab, activeTab === 'public' && [styles.tabActive, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('public')}
        >
          <Text style={[styles.tabText, activeTab === 'public' && [styles.tabTextActive, { color: colors.primary }], { color: colors.textSecondary }]}>Grupos Públicos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && [styles.tabActive, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && [styles.tabTextActive, { color: colors.primary }], { color: colors.textSecondary }]}>Meus Grupos</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}> 
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}> 
          <Text style={{ color: colors.text }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item: any, index: number) => String(item.id ?? index)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }: { item: any }) => (
            <View style={[styles.card, { backgroundColor: colors.card }]}> 
              <View style={styles.cardHeader}> 
                <Text style={[styles.name, { color: colors.text }]}>{item.name || item.title || "Grupo"}</Text>
                <View style={[styles.badge, { backgroundColor: isDarkMode ? '#2D3748' : '#EDF2F7' }]}> 
                  {(() => {
                    const visibility = String(item.visibility || '').toUpperCase();
                    const isPublic = visibility ? visibility === 'PUBLIC' : Boolean(item.isPublic);
                    return (
                      <>
                        <Ionicons name={isPublic ? 'earth' : 'lock-closed'} size={14} color={colors.textSecondary} />
                        <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{isPublic ? 'Público' : 'Privado'}</Text>
                      </>
                    );
                  })()}
                </View>
              </View>

              {item.description ? (
                <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
              ) : null}
              <View style={styles.metaRow}> 
                <View style={styles.metaItem}> 
                  <Ionicons name="people" size={16} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.membersCount ?? 0} membros</Text>
                </View>
                <View style={styles.metaItem}> 
                  <Ionicons name="calendar" size={16} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>Criado em: {formatDate(item.createdAt)}</Text>
                </View>
              </View>
              <View style={styles.actions}> 
                <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.primary }]} onPress={() => item.id && navigation.navigate('GroupDetails', { groupId: String(item.id) })}>
                  <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Ver Detalhes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={() => item.id && navigation.navigate('GroupDetails', { groupId: String(item.id) })}>
                  <Text style={styles.primaryButtonText}>Acessar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={(
            <View style={styles.center}> 
              <Text style={{ color: colors.textSecondary }}>Nenhum grupo encontrado</Text>
            </View>
          )}
        />
      )}
      <CreateGroupModal visible={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
    </SafeAreaView>
  );
}

function formatDate(date?: string) {
  if (!date) return "--/--/----";
  try { const d = new Date(date); return d.toLocaleDateString(); } catch { return String(date); }
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 22, fontWeight: "700" },
  createBtn: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  createBtnText: { fontWeight: "700" },
  tabsContainer: { flexDirection: "row", paddingHorizontal: 20, gap: 16 },
  tab: { paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2 },
  tabText: { fontSize: 14 },
  tabTextActive: { fontWeight: "700" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: { borderRadius: 14, padding: 14, marginBottom: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 18, fontWeight: "700" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12 },
  description: { marginTop: 8, fontSize: 14 },
  metaRow: { flexDirection: "row", gap: 16, marginTop: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13 },
  actions: { flexDirection: "row", gap: 12, marginTop: 14 },
  primaryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  secondaryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  secondaryButtonText: { fontWeight: "700" },
});