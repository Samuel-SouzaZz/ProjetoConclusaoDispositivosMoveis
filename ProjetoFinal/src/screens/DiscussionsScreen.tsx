import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Dimensions, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function DiscussionsScreen() {
  const { commonStyles, colors } = useTheme();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forums, setForums] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", subject: "", description: "", isPublic: true });
  const numColumns = width >= 900 ? 3 : width >= 650 ? 2 : 1;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await ApiService.getGroups();
        if (!mounted) return;
        const items = Array.isArray(data) ? data : data?.items || [];
        const mapped = items.map((g: any) => ({
          id: g.id,
          title: g.name || g.title || "Fórum",
          subject: g.owner?.name || g.handle || "",
          description: g.description || "",
          isPublic: g.visibility ? g.visibility === "public" : (g.isPublic ?? true),
          topicsCount: g.topicsCount ?? g.membersCount ?? 0,
          isActive: g.isActive ?? true,
        }));
        setForums(mapped);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        setError(ApiService.handleError(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredForums = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return forums;
    return forums.filter(f =>
      (f.title || "").toLowerCase().includes(q) ||
      (f.subject || "").toLowerCase().includes(q) ||
      (f.description || "").toLowerCase().includes(q)
    );
  }, [forums, query]);

  const handleCardPress = (forum: any) => {
    navigation.navigate("GroupDetails", { groupId: String(forum.id) });
  };

  const handleCreatePublication = () => {
    if (!formData.title.trim()) return;
    const newForum = {
      id: Math.random().toString(36).slice(2),
      title: formData.title.trim(),
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      isPublic: formData.isPublic,
      topicsCount: 0,
      isActive: true,
    };
    setForums(prev => [newForum, ...prev]);
    setFormData({ title: "", subject: "", description: "", isPublic: true });
    setShowCreateModal(false);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={[styles.header]}> 
        <Text style={[styles.title, { color: colors.text }]}>Fóruns Públicos</Text>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={[styles.newButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newButtonText}>Novo Publicação</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchRow]}> 
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por título, assunto ou descrição"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={[styles.filterButton, { borderColor: colors.border }]}>
          <Ionicons name="filter" size={20} color={colors.textSecondary} />
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
          data={filteredForums}
          keyExtractor={(item, index) => String(item.id || index)}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? { gap: 16 } : undefined}
          contentContainerStyle={[styles.listContent]}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleCardPress(item)}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {!item.isActive && (
                <View style={[styles.inactiveOverlay, { backgroundColor: "rgba(0,0,0,0.35)" }]}> 
                  <View style={[styles.inactiveBadge, { backgroundColor: colors.card }]}> 
                    <Text style={[styles.inactiveText, { color: colors.text }]}>INATIVO</Text>
                  </View>
                </View>
              )}

              <View style={styles.cardHeader}> 
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <View style={[styles.visibilityBadge, { backgroundColor: (colors as any).tagBackground || '#EEF6FF', borderColor: colors.border }]}> 
                  <Ionicons name="planet" size={12} color={colors.primary} />
                  <Text style={[styles.visibilityText, { color: colors.primary }]}>Público</Text>
                </View>
              </View>
              {!!item.description && (
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
              )}
              <View style={styles.cardFooter}> 
                <View style={styles.footerLeft}> 
                  <Ionicons name="leaf" size={14} color={(colors as any).success || "#2ecc71"} />
                  <Text style={[styles.footerText, { color: colors.textSecondary }]}>Tópicos: {item.topicsCount || 0}</Text>
                </View>
                {!!item.subject && (
                  <TouchableOpacity>
                    <Text style={[styles.linkText, { color: colors.primary }]} numberOfLines={1}>{item.subject}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={(
            <View style={styles.center}> 
              <Text style={{ color: colors.textSecondary }}>Nenhum fórum encontrado</Text>
            </View>
          )}
        />
      )}

      <Modal visible={showCreateModal} animationType="slide" transparent onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}> 
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
            <View style={styles.modalHeader}> 
              <Text style={[styles.modalTitle, { color: colors.text }]}>Nova Publicação</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.formGroup}> 
                <Text style={[styles.label, { color: colors.text }]}>Título</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Digite o título"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.title}
                  onChangeText={(v) => setFormData({ ...formData, title: v })}
                />
              </View>
              <View style={styles.formGroup}> 
                <Text style={[styles.label, { color: colors.text }]}>Assunto</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Assunto (ex.: Estruturas de Dados)"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.subject}
                  onChangeText={(v) => setFormData({ ...formData, subject: v })}
                />
              </View>
              <View style={styles.formGroup}> 
                <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>
                <TextInput
                  style={[styles.textarea, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Descrição breve"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.description}
                  onChangeText={(v) => setFormData({ ...formData, description: v })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.checkboxRow}> 
                <TouchableOpacity
                  style={[styles.checkbox, formData.isPublic && styles.checkboxSelected, { borderColor: colors.primary }]}
                  onPress={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                >
                  {formData.isPublic && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>Fórum público</Text>
              </View>
              <View style={styles.modalActions}> 
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setShowCreateModal(false)}>
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleCreatePublication}>
                  <Text style={styles.saveText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '800' },
  newButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  newButtonText: { color: '#fff', fontWeight: '700' },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 14 },
  filterButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },
  card: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 14, minHeight: 120, position: 'relative', marginBottom: 16 },
  inactiveOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  inactiveBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  inactiveText: { fontWeight: '800', letterSpacing: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  visibilityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  visibilityText: { fontSize: 12, fontWeight: '700' },
  cardDesc: { fontSize: 12, marginTop: 4 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12 },
  linkText: { fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalContent: { width: '100%', maxWidth: 560, borderRadius: 16, padding: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  formGroup: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  textarea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, minHeight: 100 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: '#4A90E2' },
  checkmark: { color: '#fff', fontWeight: '800' },
  checkboxLabel: { fontSize: 13 },
  modalActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  cancelBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  cancelText: { fontWeight: '700' },
  saveBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  saveText: { color: '#fff', fontWeight: '800' },
});