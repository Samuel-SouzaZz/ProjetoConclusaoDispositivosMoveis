import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';


type ForumTopicsRoute = RouteProp<{ ForumTopics: { forumId: string } }, 'ForumTopics'>;

export default function ForumTopicsScreen() {
  const { colors, commonStyles } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<ForumTopicsRoute>();
  const { forumId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forum, setForum] = useState<any | null>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [f, ts] = await Promise.all([
          ApiService.getForumById(forumId),
          ApiService.getForumTopics(forumId),
        ]);
        if (!mounted) return;
        setForum(f);
        const list = Array.isArray(ts?.items) ? ts.items : Array.isArray(ts) ? ts : [];
        setTopics(list);
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
      await ApiService.createForumTopic(forumId, payload);
      setTitle('');
      setContent('');
      setKeyword('');
      const ts = await ApiService.getForumTopics(forumId);
      const list = Array.isArray(ts?.items) ? ts.items : Array.isArray(ts) ? ts : [];
      setTopics(list);
      setError(null);
    } catch (err: any) {
      setError(ApiService.handleError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Tópicos do Fórum</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {forum?.nome || forum?.title || 'Fórum'}
          </Text>
          {!!forum?.descricao && (
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{forum.descricao}</Text>
          )}
        </View>

        <View style={styles.section}>
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
            <View style={styles.empty}>
              <Text style={{ color: colors.textSecondary }}>Nenhum tópico encontrado.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredTopics}
              keyExtractor={(item, index) => String(item.id || item._id || index)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={[styles.topicItem, { borderColor: colors.border, backgroundColor: colors.card }]}> 
                  <Text style={[styles.topicTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.titulo || item.title}
                  </Text>
                  {!!item.conteudo && (
                    <Text style={[styles.topicDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                      {item.conteudo}
                    </Text>
                  )}
                </View>
              )}
            />
          )}
        </View>

        <View style={styles.section}>
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

          <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.card, height: 140 }] }>
            <TextInput
              style={[styles.input, styles.multiline, { color: colors.text }]}
              placeholder="Conteúdo do tópico"
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
            />
          </View>

          <View style={[styles.inputGroup, { borderColor: colors.border, backgroundColor: colors.card }] }>
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
            <Text style={styles.primaryButtonText}>{saving ? 'Criando...' : 'Criar tópico'}</Text>
          </TouchableOpacity>
        </View>

        {!!error && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: colors.text }}>{String(error)}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  desc: { marginTop: 8, fontSize: 13 },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, flex: 1, marginLeft: 12 },
  searchInput: { flex: 1, fontSize: 13, marginLeft: 4 },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  topicItem: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 },
  topicTitle: { fontSize: 14, fontWeight: '700' },
  topicDesc: { fontSize: 12, marginTop: 4 },
  inputGroup: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10 },
  input: { fontSize: 14, flex: 1 },
  multiline: { textAlignVertical: 'top' },
  primaryButton: { marginTop: 14, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});
