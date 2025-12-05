import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';
import SafeScreen from '../components/SafeScreen';
import ScreenHeader from '../components/ScreenHeader';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';


type TopicDetailsRoute = RouteProp<RootStackParamList, 'TopicDetails'>;

export default function TopicDetailsScreen() {
  const { colors, commonStyles } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<TopicDetailsRoute>();
  const { forumId, topicId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [t, cs] = await Promise.all([
          ApiService.getForumTopicById(topicId),
          ApiService.getTopicComments(topicId),
        ]);
        if (!mounted) return;
        setTopic(t);
        const list = Array.isArray(cs?.items) ? cs.items : Array.isArray(cs) ? cs : [];
        setComments(list);
        if (list.length > 0) {
          console.log('COMMENTS_SAMPLE', list[0]);
        }
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        setError(ApiService.handleError(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [topicId]);

  async function handleSubmitComment() {
    if (!content.trim()) return;
    try {
      setSaving(true);
      if (editingCommentId) {
        await ApiService.updateForumComment(editingCommentId, { conteudo: content.trim() });
      } else {
        await ApiService.createForumComment(topicId, { conteudo: content.trim() });
      }
      setContent('');
      setEditingCommentId(null);
      const cs = await ApiService.getTopicComments(topicId);
      const list = Array.isArray(cs?.items) ? cs.items : Array.isArray(cs) ? cs : [];
      setComments(list);
      setError(null);
    } catch (err: any) {
      setError(ApiService.handleError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingScreen message="Carregando tópico..." />;
  }

  return (
    <SafeScreen edges={['top']}>
      <ScreenHeader title={topic?.titulo || topic?.title || 'Tópico'} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {!!topic?.conteudo && (
            <Text style={[styles.topicContent, { color: colors.text }]}>{topic.conteudo}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Comentários</Text>
          {comments.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ color: colors.textSecondary }}>Nenhum comentário ainda.</Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item, index) => String(item.id || item._id || index)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={[styles.commentItem, { borderColor: colors.border, backgroundColor: colors.card }]}> 
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.commentAuthor, { color: colors.text }]} numberOfLines={1}>
                        {(() => {
                          const meId = user && (user as any)._id ? String((user as any)._id) : (user && (user as any).id ? String((user as any).id) : null);
                          const authorUserId = item.autorUsuarioId ? String(item.autorUsuarioId) : null;

                          // Se o comentário é do usuário logado, usar o nome dele do contexto
                          if (meId && authorUserId && meId === authorUserId) {
                            const meName = (user as any).nome || (user as any).name || (user as any).username || (user as any).email;
                            if (meName) return meName;
                          }

                          // Fallbacks com dados vindos da API
                          return (
                            item.autorNome ||
                            item.autorNomeCompleto ||
                            item.usuarioNome ||
                            (item.autor && (item.autor.nome || item.autor.name || item.autor.username)) ||
                            (item.usuario && (item.usuario.nome || item.usuario.name || item.usuario.username)) ||
                            item.autorEmail ||
                            item.usuarioEmail ||
                            'Usuário'
                          );
                        })()}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingCommentId(String(item.id || item._id));
                          setContent(item.conteudo || '');
                        }}
                      >
                        <Ionicons name="create-outline" size={16} color={colors.text} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={async () => {
                          try {
                            setSaving(true);
                            await ApiService.deleteForumComment(String(item.id || item._id));
                            const cs = await ApiService.getTopicComments(topicId);
                            const list = Array.isArray(cs?.items) ? cs.items : Array.isArray(cs) ? cs : [];
                            setComments(list);
                            if (editingCommentId && String(editingCommentId) === String(item.id || item._id)) {
                              setEditingCommentId(null);
                              setContent('');
                            }
                            setError(null);
                          } catch (err: any) {
                            setError(ApiService.handleError(err));
                          } finally {
                            setSaving(false);
                          }
                        }}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[styles.commentContent, { color: colors.textSecondary }]}>{item.conteudo}</Text>
                  {item.criadoEm || item.createdAt || item.dataCriacao ? (
                    <Text style={[styles.commentMeta, { color: colors.textSecondary }]}> 
                      {new Date(item.criadoEm || item.createdAt || item.dataCriacao).toLocaleString()}
                    </Text>
                  ) : null}
                </View>
              )}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Adicionar comentário</Text>
          <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.card, minHeight: 120 }]}>
            <TextInput
              style={[styles.input, styles.multiline, { color: colors.text }]}
              placeholder="Escreva seu comentário..."
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: saving ? 0.8 : 1 }]}
            onPress={handleSubmitComment}
            disabled={saving || !content.trim()}
          >
            <Text style={styles.primaryButtonText}>
              {saving
                ? editingCommentId
                  ? 'Salvando...'
                  : 'Enviando...'
                : editingCommentId
                  ? 'Salvar alterações'
                  : 'Enviar comentário'}
            </Text>
          </TouchableOpacity>
        </View>

        {!!error && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: colors.text }}>{String(error)}</Text>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', flex: 1 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 12 },
  topicContent: { fontSize: 14 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  commentItem: { borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 10 },
  commentAuthor: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  commentMeta: { fontSize: 11, marginTop: 0 },
  commentContent: { fontSize: 13 },
  inputGroup: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10 },
  input: { fontSize: 14, flex: 1 },
  multiline: { textAlignVertical: 'top' },
  primaryButton: { marginTop: 14, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});
