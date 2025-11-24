import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';
import { RootStackParamList } from '../navigation/AppNavigator';

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, fontWeight: '700' },
  desc: { marginTop: 8, fontSize: 13 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  primaryButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  topicItem: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 },
  topicTitle: { fontSize: 14, fontWeight: '700' },
  topicDesc: { fontSize: 12, marginTop: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, flex: 1, marginLeft: 12 },
  searchInput: { flex: 1, fontSize: 13, marginLeft: 4 },
  inputGroup: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10 },
  input: { fontSize: 14, flex: 1 },
  multiline: { textAlignVertical: 'top' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalContent: { width: '100%', maxWidth: 560, borderRadius: 16, padding: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  formGroup: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  textarea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, minHeight: 100 },
  modalActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 16 },
  actionBtn: { flex: 1, alignItems: 'center', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  actionBtnGhost: { borderWidth: 1 },
  cancelText: { fontWeight: '700' },
  saveBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  saveText: { color: '#fff', fontWeight: '800' },
});

type ForumRoute = RouteProp<RootStackParamList, 'ForumDetails'>;

export default function ForumDetailsScreen() {
  const { colors, commonStyles } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const route = useRoute<ForumRoute>();
  const { forumId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forum, setForum] = useState<any | null>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [keyword, setKeyword] = useState('');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingForum, setEditingForum] = useState(false);
  const [forumTitle, setForumTitle] = useState('');
  const [forumSubject, setForumSubject] = useState('');
  const [forumDescription, setForumDescription] = useState('');
  const [forumKeywords, setForumKeywords] = useState('');
  const [forumIsPublic, setForumIsPublic] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [f, ts, ps] = await Promise.all([
          ApiService.getForumById(forumId),
          ApiService.getForumTopics(forumId),
          ApiService.getForumParticipants(forumId),
        ]);
        if (!mounted) return;
        const forumData: any = f || {};
        const topicsData: any = ts || {};
        setForum(forumData);
        setForumTitle(forumData.nome || forumData.title || '');
        setForumSubject(forumData.assunto || '');
        setForumDescription(forumData.descricao || '');
        if (Array.isArray(forumData.palavrasChave)) {
          setForumKeywords(forumData.palavrasChave.join(', '));
        } else {
          setForumKeywords('');
        }
        setForumIsPublic((forumData.statusPrivacidade || '').toString().toUpperCase() === 'PUBLICO');
        const list = Array.isArray(topicsData?.items) ? topicsData.items : Array.isArray(topicsData) ? topicsData : [];
        setTopics(list);

        const meId = user && (user as any)._id ? String((user as any)._id) : (user && (user as any).id ? String((user as any).id) : null);
        if (meId) {
          const donoId = ps && (ps as any).donoUsuarioId ? String((ps as any).donoUsuarioId) : null;

          const mods = Array.isArray((ps as any)?.moderadores)
            ? (ps as any).moderadores.map((m: any) => String(m.usuarioId || m.userId || m.id))
            : [];
          const members = Array.isArray((ps as any)?.membros)
            ? (ps as any).membros.map((m: any) => String(m.usuarioId || m.userId || m.id))
            : [];
          const allIds = [donoId, ...mods, ...members].filter(Boolean) as string[];
          setIsMember(allIds.includes(meId));
          setIsOwner(!!donoId && donoId === meId);
        } else {
          setIsMember(false);
          setIsOwner(false);
        }
        setError(null);

      } catch (err: any) {
        if (!mounted) return;
        setError(ApiService.handleError(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [forumId]);

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => {
      const titleText = (t.titulo || t.title || '').toLowerCase();
      const contentText = (t.conteudo || t.description || '').toLowerCase();
      return titleText.includes(q) || contentText.includes(q);
    });
  }, [topics, query]);

  async function handleCreateTopic() {

    if (!title.trim() || !content.trim()) return;
    try {
      setSaving(true);

      // Se ainda não for membro, tentar participar do fórum
      if (!isMember) {
        try {
          await ApiService.joinForum(forumId);
        } catch (err: any) {
          const msg = ApiService.handleError(err);
          // Se já participa, apenas ignora o erro e segue para os tópicos
          if (!msg.toLowerCase().includes('já participa deste fórum')) {
            setError(msg);
            return;
          }
        }
      }

      const payload: { titulo: string; conteudo: string; palavrasChave?: string[] } = {
        titulo: title.trim(),
        conteudo: content.trim(),
      };
      const kw = keyword.trim();
      if (kw) {
        payload.palavrasChave = kw
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean);
      }
      if (editingTopicId) {
        await ApiService.updateForumTopic(editingTopicId, payload);
      } else {
        await ApiService.createForumTopic(forumId, payload);
      }
      setTitle('');
      setContent('');
      setKeyword('');
      setEditingTopicId(null);
      const ts = await ApiService.getForumTopics(forumId);
      const topicsData: any = ts || {};
      const list = Array.isArray(topicsData?.items) ? topicsData.items : Array.isArray(topicsData) ? topicsData : [];
      setTopics(list);
      setError(null);
    } catch (err: any) {
      setError(ApiService.handleError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveForum() {

    if (!forumTitle.trim() || !forumSubject.trim()) {
      return;
    }
    try {
      setSaving(true);
      await ApiService.updateForum(String(forumId), {
        nome: forumTitle.trim(),
        assunto: forumSubject.trim(),
        descricao: forumDescription.trim() || undefined,
        palavrasChave: forumKeywords
          ? forumKeywords.split(',').map(k => k.trim()).filter(Boolean)
          : undefined,
      });
      const updated: any = await ApiService.getForumById(String(forumId));
      setForum(updated);
      setForumTitle(updated.nome || updated.title || '');
      setForumSubject(updated.assunto || '');
      setForumDescription(updated.descricao || '');
      if (Array.isArray(updated.palavrasChave)) {
        setForumKeywords(updated.palavrasChave.join(', '));
      } else {
        setForumKeywords('');
      }
      setForumIsPublic((updated.statusPrivacidade || '').toString().toUpperCase() === 'PUBLICO');
      setEditingForum(false);
      setShowEditModal(false);
      setError(null);

    } catch (err: any) {
      setError(ApiService.handleError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteForum() {
    try {
      setSaving(true);
      await ApiService.deleteForum(String(forumId));
      navigation.goBack();
    } catch (err: any) {
      setError(ApiService.handleError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={[styles.headerRow]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Detalhes do Fórum</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{forum?.nome || forum?.title || 'Fórum'}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={[styles.tag, { borderColor: colors.border }]}>
                <Ionicons name="planet" size={12} color={colors.primary} />

                <Text style={[styles.tagText, { color: colors.primary }]}>
                  {(forum?.statusPrivacidade || '').toString().toUpperCase() === 'PUBLICO' ? 'Público' : 'Privado'}
                </Text>
              </View>
              {isOwner && !editingForum && (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setForumTitle(forum?.nome || forum?.title || '');
                      setForumSubject(forum?.assunto || '');
                      setForumDescription(forum?.descricao || '');
                      if (Array.isArray(forum?.palavrasChave)) {
                        setForumKeywords(forum.palavrasChave.join(', '));
                      } else {
                        setForumKeywords('');
                      }
                      setEditingForum(true);
                      setShowEditModal(true);
                    }}
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  > 
                    <Text style={styles.primaryButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowDeleteModal(true)}
                    style={[styles.primaryButton, { backgroundColor: (colors as any).error || '#E53935' }]}
                  > 
                    <Text style={styles.primaryButtonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          {!!forum?.descricao && <Text style={[styles.desc, { color: colors.textSecondary }]}>{forum.descricao}</Text>}
        </View>

        <View style={[styles.section]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tópicos</Text>
            <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.card }]}>

              <Ionicons name="search" size={16} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Buscar por título, conteúdo ou palavra..."
                placeholderTextColor={colors.textSecondary}
                value={query}
                onChangeText={setQuery}
              />
            </View>
          </View>

          {filteredTopics.length === 0 ? (
            <View style={styles.empty}><Text style={{ color: colors.textSecondary }}>Nenhum tópico encontrado.</Text></View>
          ) : (
            <FlatList
              data={filteredTopics}
              keyExtractor={(item, index) => String(item.id || item._id || index)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={[styles.topicItem, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => (navigation as any).navigate('TopicDetails', {
                        forumId: String(forumId),
                        topicId: String(item.id || item._id),
                      })}
                      style={{ flex: 1, marginRight: 8 }}
                    >
                      <Text style={[styles.topicTitle, { color: colors.text }]} numberOfLines={1}>{item.titulo || item.title}</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => (navigation as any).navigate('TopicDetails', {
                          forumId: String(forumId),
                          topicId: String(item.id || item._id),
                        })}
                        style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                      >
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Abrir</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingTopicId(String(item.id || item._id));

                          setTitle(item.titulo || item.title || '');
                          setContent(item.conteudo || '');
                          if (Array.isArray(item.palavrasChave)) {
                            setKeyword(item.palavrasChave.join(', '));
                          } else {
                            setKeyword('');
                          }
                        }}
                      >
                        <Ionicons name="create-outline" size={18} color={colors.text} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={async () => {
                          try {
                            setSaving(true);
                            await ApiService.deleteForumTopic(String(item.id || item._id));
                            const ts = await ApiService.getForumTopics(forumId);
                            const topicsData: any = ts || {};
                            const list = Array.isArray(topicsData?.items) ? topicsData.items : Array.isArray(topicsData) ? topicsData : [];
                            setTopics(list);
                            if (editingTopicId && String(editingTopicId) === String(item.id || item._id)) {
                              setEditingTopicId(null);
                              setTitle('');
                              setContent('');
                              setKeyword('');
                            }
                          } catch (err: any) {
                            setError(ApiService.handleError(err));
                          } finally {
                            setSaving(false);
                          }
                        }}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {!!item.conteudo && <Text style={[styles.topicDesc, { color: colors.textSecondary }]} numberOfLines={3}>{item.conteudo}</Text>}
                </View>
              )}
            />
          )}
        </View>

        <View style={[styles.section]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Criar novo tópico</Text>

          <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Título do tópico"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.card, height: 140 }]}>
            <TextInput
              style={[styles.input, styles.multiline, { color: colors.text }]}
              placeholder="Conteúdo do tópico"
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
            />
          </View>

          <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Palavra-chave (opcional, separado por vírgula)"
              placeholderTextColor={colors.textSecondary}
              value={keyword}
              onChangeText={setKeyword}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: saving ? 0.8 : 1 }]}
            onPress={handleCreateTopic}
            disabled={saving || !title.trim() || !content.trim()}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? (editingTopicId ? 'Salvando...' : 'Criando...') : (editingTopicId ? 'Salvar alterações' : 'Criar tópico')}
            </Text>
          </TouchableOpacity>
        </View>

        {!!error && (
          <View style={{ marginTop: 12 }}><Text style={{ color: colors.text }}>{String(error)}</Text></View>
        )}
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowEditModal(false);
          setEditingForum(false);
        }}
      >
        <View style={[styles.modalOverlay]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Fórum</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowEditModal(false);
                  setEditingForum(false);
                  setForumTitle(forum?.nome || forum?.title || '');
                  setForumSubject(forum?.assunto || '');
                  setForumDescription(forum?.descricao || '');
                  if (Array.isArray(forum?.palavrasChave)) {
                    setForumKeywords(forum.palavrasChave.join(', '));
                  } else {
                    setForumKeywords('');
                  }
                }}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Nome do Fórum *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Digite o nome do fórum"
                  placeholderTextColor={colors.textSecondary}
                  value={forumTitle}
                  onChangeText={setForumTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Assunto *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Ex: Desenvolvimento Web, Backend, Frontend..."
                  placeholderTextColor={colors.textSecondary}
                  value={forumSubject}
                  onChangeText={setForumSubject}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Palavras-chave</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Ex: react, backend, javascript"
                  placeholderTextColor={colors.textSecondary}
                  value={forumKeywords}
                  onChangeText={setForumKeywords}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>
                <TextInput
                  style={[styles.textarea, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Descreva o propósito e tema deste fórum..."
                  placeholderTextColor={colors.textSecondary}
                  value={forumDescription}
                  onChangeText={setForumDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnGhost, { borderColor: colors.border }]}
                  onPress={() => {
                    setForumTitle(forum?.nome || forum?.title || '');
                    setForumSubject(forum?.assunto || '');
                    setForumDescription(forum?.descricao || '');
                  }}
                >
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Limpar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnGhost, { borderColor: colors.border }]}
                  onPress={() => {
                    setShowEditModal(false);
                    setEditingForum(false);
                    setForumTitle(forum?.nome || forum?.title || '');
                    setForumSubject(forum?.assunto || '');
                    setForumDescription(forum?.descricao || '');
                  }}
                >
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.8 : 1 }]}
                  onPress={handleSaveForum}
                  disabled={saving || !forumTitle.trim() || !forumSubject.trim()}
                >
                  <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar alterações'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={[styles.modalOverlay]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Excluir Fórum</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                Tem certeza que deseja excluir este fórum? Esta ação não pode ser desfeita.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnGhost, { borderColor: colors.border }]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.saveBtn, { backgroundColor: (colors as any).error || '#E53935', opacity: saving ? 0.8 : 1 }]}
                onPress={async () => {
                  await handleDeleteForum();
                  setShowDeleteModal(false);
                }}
                disabled={saving}
              >
                <Text style={styles.saveText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}