import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";

import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Dimensions, Modal, ScrollView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import SafeScreen from "../components/SafeScreen";
import ScreenHeaderWithAction from "../components/ScreenHeaderWithAction";
import LoadingScreen from "../components/LoadingScreen";
import EmptyState from "../components/EmptyState";
import ErrorScreen from "../components/ErrorScreen";

const { width } = Dimensions.get("window");

export default function ForumScreen() {
  const { commonStyles, colors } = useTheme();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [forums, setForums] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPrivacyPicker, setShowPrivacyPicker] = useState(false);
  const [showFilterPicker, setShowFilterPicker] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ exerciseCode: "", title: "", subject: "", description: "", keywords: "", isPublic: true });
  const [formError, setFormError] = useState<string | null>(null);

  const [codeLookupLoading, setCodeLookupLoading] = useState(false);
  const [codeLookupError, setCodeLookupError] = useState<string | null>(null);
  const numColumns = width >= 900 ? 3 : width >= 650 ? 2 : 1;

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);

          const [publicData, myData] = await Promise.all([
            ApiService.getPublicForums().catch(() => []),
            ApiService.getMyForums().catch(() => []),
          ]);

          if (!mounted) return;

          const publicItems = Array.isArray(publicData) ? publicData : publicData?.items || [];
          const myItems = Array.isArray(myData) ? myData : myData?.items || [];

          const combined = [...publicItems, ...myItems];
          const mapById = new Map<string, any>();

          combined.forEach((f: any) => {
            const id = String(f._id || f.id || "");
            if (!id) return;
            if (!mapById.has(id)) {
              mapById.set(id, f);
            }
          });

          const mapped = Array.from(mapById.values()).map((f: any) => ({
            id: f._id || f.id,
            title: f.nome || f.title || "Fórum",
            subject: f.assunto || "",
            description: f.descricao || "",
            isPublic: f.statusPrivacidade ? f.statusPrivacidade === "PUBLICO" : (f.isPublic ?? true),
            topicsCount: f.qtdTopicos ?? 0,
            isActive: f.status ? f.status === "ATIVO" : (f.isActive ?? true),
          }));

          setForums(mapped);
          setListError(null);
        } catch (err: any) {
          if (!mounted) return;
          setListError(ApiService.handleError(err));
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, [])
  );

  const filteredForums = useMemo(() => {
    const q = query.trim().toLowerCase();

    let base = forums;
    if (filterMode === 'PUBLIC') {
      base = base.filter(f => !!f.isPublic);
    } else if (filterMode === 'PRIVATE') {
      base = base.filter(f => !f.isPublic);
    }

    if (!q) return base;

    return base.filter(f =>
      (f.title || "").toLowerCase().includes(q) ||
      (f.subject || "").toLowerCase().includes(q) ||
      (f.description || "").toLowerCase().includes(q)
    );
  }, [forums, query, filterMode]);

  const handleCardPress = (forum: { id?: string; _id?: string }) => {
    const id = forum?.id || forum?._id;
    if (!id) return;
    (navigation as any).navigate('ForumDetails', { forumId: String(id) });
  };

  const handleCreatePublication = async () => {
    if (submitting) return;
    setFormError(null);

    const exerciseCode = normalizeForumCode(formData.exerciseCode);
    const nome = formData.title.trim();
    const assunto = formData.subject.trim();

    if (!exerciseCode || !nome || !assunto) {
      setFormError('Código do desafio, nome do fórum e assunto são obrigatórios.');
      return;
    }

    try {
      setSubmitting(true);
      const created = await ApiService.createForum({
        exerciseCode,
        nome,
        assunto,
        descricao: formData.description.trim() || undefined,
        isPublic: formData.isPublic,
        palavrasChave: formData.keywords
          ? formData.keywords.split(',').map(k => k.trim()).filter(Boolean)
          : undefined,
      });

      const newForum = {
        id: created._id || created.id,
        title: created.nome || nome,
        subject: created.assunto || assunto,
        description: created.descricao || formData.description.trim(),
        isPublic: created.statusPrivacidade ? created.statusPrivacidade === 'PUBLICO' : formData.isPublic,
        topicsCount: created.qtdTopicos ?? 0,
        isActive: created.status ? created.status === 'ATIVO' : true,
      };

      setForums(prev => [newForum, ...prev]);
      setFormData({ exerciseCode: '', title: '', subject: '', description: '', keywords: '', isPublic: true });
      setFormError(null);
      setShowCreateModal(false);
    } catch (err: any) {
      setFormError(ApiService.handleError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const prefillFromExercise = (ex: any) => {
    const title = ex?.title || ex?.nome || '';
    const description = ex?.description || ex?.descricao || '';
    const subject = ex?.languageId?.name || ex?.assunto || '';
    setFormData(prev => ({
      ...prev,
      title: title || prev.title,
      subject: subject || prev.subject,
      description: description || prev.description,
    }));
  };

  const tryPrefillFromCode = async (value?: string) => {
    const raw = typeof value === 'string' ? value : formData.exerciseCode;
    const normalized = normalizeForumCode(raw);
    if (!normalized || normalized.length < 6) return;
    setCodeLookupLoading(true);
    setCodeLookupError(null);
    try {
      const ex = await ApiService.getExerciseByCode(normalized);

      if (ex) prefillFromExercise(ex);
    } catch (err: any) {
      setCodeLookupError(ApiService.handleError(err));
    } finally {
      setCodeLookupLoading(false);
    }
  };

  const handleExerciseCodeChange = (v: string) => {
    setFormData(prev => ({ ...prev, exerciseCode: v }));
    const trimmed = (v || '').trim();
    if (trimmed.length >= 6) {
      tryPrefillFromCode(trimmed);
    }
  };

  return (
    <SafeScreen edges={['top']}>
      <ScreenHeaderWithAction
        title="Fóruns Públicos"
        actionLabel="Nova Publicação"
        actionIcon="add"
        onAction={() => setShowCreateModal(true)}
        showBackButton={false}
      />
      
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
        <TouchableOpacity
          style={[styles.filterButton, { borderColor: colors.border }]}
          onPress={() => setShowFilterPicker(true)}
        >
          <Ionicons name="filter" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingScreen message="Carregando fóruns..." fullScreen={false} />
      ) : listError ? (
        <ErrorScreen message={String(listError)} onRetry={() => {}} fullScreen={false} />
      ) : (
        <FlatList
          data={filteredForums}
          keyExtractor={(item, index) => String(item.id || index)}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? { gap: 16 } : undefined}
          contentContainerStyle={[styles.listContent]}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles-outline"
              title="Nenhum fórum encontrado"
              message="Não há fóruns disponíveis no momento."
            />
          }
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
                  <Text style={[styles.visibilityText, { color: colors.primary }]}>
                    {item.isPublic ? 'Público' : 'Privado'}
                  </Text>
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
        />
      )}

      <Modal visible={showCreateModal} animationType="slide" transparent onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Criar Novo Fórum</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.formGroup}>

                <Text style={[styles.label, { color: colors.text }]}>Código do Desafio *</Text>

                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Digite o código do desafio (ex: #ASFS0001)"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.exerciseCode}
                  onChangeText={(v) => handleExerciseCodeChange(v)}
                  onEndEditing={() => tryPrefillFromCode()}
                  autoCapitalize="none"
                />
                {codeLookupLoading && (
                  <Text style={{ marginTop: 6, color: colors.textSecondary }}>Buscando desafio pelo código...</Text>
                )}
                {!!codeLookupError && (
                  <Text style={{ marginTop: 6, color: (colors as any).error || '#F44336' }}>{String(codeLookupError)}</Text>
                )}
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Nome do Fórum *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Digite o nome do fórum"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.title}
                  onChangeText={(v) => setFormData({ ...formData, title: v })}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Assunto *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Ex: Desenvolvimento Web, Backend, Frontend..."
                  placeholderTextColor={colors.textSecondary}
                  value={formData.subject}
                  onChangeText={(v) => setFormData({ ...formData, subject: v })}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>
                <TextInput
                  style={[styles.textarea, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Descreva o propósito e tema deste fórum..."
                  placeholderTextColor={colors.textSecondary}
                  value={formData.description}
                  onChangeText={(v) => setFormData({ ...formData, description: v })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Palavras-chave</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Ex: react, backend, javascript"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.keywords}
                  onChangeText={(v) => setFormData({ ...formData, keywords: v })}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Privacidade</Text>
                <TouchableOpacity
                  style={[styles.input, { borderColor: colors.border, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', paddingRight: 10 }]}
                  onPress={() => setShowPrivacyPicker(true)}
                >
                  <Text style={{ color: colors.text, flex: 1 }}>
                    {formData.isPublic
                      ? 'Público - Qualquer um pode ver e participar'
                      : 'Privado - Apenas membros podem ver e participar'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalActions}>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnGhost, { borderColor: colors.border }]}
                  onPress={() => { setFormData({ exerciseCode: '', title: '', subject: '', description: '', keywords: '', isPublic: true }); setCodeLookupError(null); }}
                >
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Limpar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnGhost, { borderColor: colors.border }]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleCreatePublication} disabled={submitting}>
                  <Text style={styles.saveText}>{submitting ? 'Criando...' : 'Criar Fórum'}</Text>
                </TouchableOpacity>
              </View>
              {!!formError && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ color: (colors as any).error || '#F44336' }}>{formError}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

      </Modal>

      <Modal
        visible={showPrivacyPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrivacyPicker(false)}
      >
        <TouchableOpacity
          style={styles.privacyOverlay}
          activeOpacity={1}
          onPressOut={() => setShowPrivacyPicker(false)}
        >
          <View style={[styles.privacyDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <TouchableOpacity
              style={styles.privacyOption}
              onPress={() => {
                setFormData(prev => ({ ...prev, isPublic: true }));
                setShowPrivacyPicker(false);
              }}
            >
              <Text style={{ color: colors.text }}>Público - Qualquer um pode ver e participar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.privacyOption}
              onPress={() => {
                setFormData(prev => ({ ...prev, isPublic: false }));
                setShowPrivacyPicker(false);
              }}
            >
              <Text style={{ color: colors.text }}>Privado - Apenas membros podem ver e participar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showFilterPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterPicker(false)}
      >
        <TouchableOpacity
          style={styles.privacyOverlay}
          activeOpacity={1}
          onPressOut={() => setShowFilterPicker(false)}
        >
          <View style={[styles.privacyDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <TouchableOpacity
              style={styles.privacyOption}
              onPress={() => {
                setFilterMode('ALL');
                setShowFilterPicker(false);
              }}
            >
              <Text style={{ color: colors.text }}>Todos (públicos e privados)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.privacyOption}
              onPress={() => {
                setFilterMode('PUBLIC');
                setShowFilterPicker(false);
              }}
            >
              <Text style={{ color: colors.text }}>Públicos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.privacyOption}
              onPress={() => {
                setFilterMode('PRIVATE');
                setShowFilterPicker(false);
              }}
            >
              <Text style={{ color: colors.text }}>Inativos (Privados)</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 14 },
  filterButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
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
  modalContent: { width: '100%', maxWidth: 560, maxHeight: '80%', borderRadius: 16, padding: 16 },
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
  modalActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 16 },
  actionBtn: { flex: 1, alignItems: 'center', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  actionBtnGhost: { borderWidth: 1 },
  cancelBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  cancelText: { fontWeight: '700' },
  saveBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  saveText: { color: '#fff', fontWeight: '800' },
  privacyOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  privacyDropdown: { width: '80%', maxWidth: 420, borderWidth: 1, borderRadius: 10, paddingVertical: 4 },
  privacyOption: { paddingHorizontal: 12, paddingVertical: 10 },
});

function normalizeForumCode(input: string) {
  const v = (input || '').trim();
  if (!v) return '';
  const withHash = v.startsWith('#') ? v : `#${v}`;
  return withHash.toUpperCase();
}