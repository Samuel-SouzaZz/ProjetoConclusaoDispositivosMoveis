import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/ApiService';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';

type ChallengeRoute = RouteProp<RootStackParamList, 'ChallengeDetails'>;

export default function ChallengeDetailsScreen() {
  const { colors, commonStyles } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<ChallengeRoute>();
  const { exerciseId } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exercise, setExercise] = useState<any | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const ex = await ApiService.getExerciseById(exerciseId);
        const lb = await ApiService.getLeaderboardByExercise(exerciseId, { limit: 10 });
        if (!mounted) return;
        setExercise(ex);
        setCode(ex?.codeTemplate || ex?.code || '// Seu código aqui\n');
        const items = Array.isArray(lb) ? lb : lb?.items || [];
        setLeaders(items);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        setError(ApiService.handleError(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [exerciseId]);

  async function handleSubmit() {
    if (!exercise?.id && !exercise?._id) {
      Alert.alert('Erro', 'Desafio não encontrado');
      return;
    }
    const id = String(exercise.id || exercise._id);
    const lang = exercise?.languageId?.id || exercise?.languageId?._id || exercise?.languageId;
    setSubmitting(true);
    try {
      const resp = await ApiService.submitChallenge({ exerciseId: id, code, languageId: String(lang || '') });
      Alert.alert('Submissão', 'Solução enviada com sucesso!');
      const lb = await ApiService.getLeaderboardByExercise(id, { limit: 10 });
      const items = Array.isArray(lb) ? lb : lb?.items || [];
      setLeaders(items);
    } catch (err: any) {
      Alert.alert('Erro', ApiService.handleError(err));
    } finally {
      setSubmitting(false);
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
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.headerBox]}> 
          <Text style={[styles.title, { color: colors.text }]}>{exercise?.title}</Text>
          {!!exercise?.description && (
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{exercise.description}</Text>
          )}
          <View style={styles.metaRow}> 
            <View style={styles.metaItem}> 
              <Ionicons name="barbell" size={14} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{typeof exercise?.difficulty === 'number' ? (exercise.difficulty <= 1 ? 'Fácil' : exercise.difficulty === 2 ? 'Médio' : 'Difícil') : String(exercise?.difficulty || '')}</Text>
            </View>
            <View style={styles.metaItem}> 
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>XP: {exercise?.baseXp ?? exercise?.xp ?? 0}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Seu Código</Text>
          <TextInput
            style={[styles.codeInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
            value={code}
            onChangeText={setCode}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            placeholder="// Seu código aqui"
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: submitting ? 0.8 : 1 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.primaryButtonText}>{submitting ? 'Enviando...' : 'Enviar Solução'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ranking do Exercício</Text>
          {leaders.length === 0 ? (
            <View style={styles.empty}><Text style={{ color: colors.textSecondary }}>Sem dados ainda</Text></View>
          ) : (
            leaders.map((u: any, idx: number) => (
              <View key={String(u.userId || idx)} style={[styles.row, { borderColor: colors.border }]}> 
                <Text style={[styles.rowPos, { color: colors.textSecondary }]}>{(u.position ?? idx + 1)}º</Text>
                <Text style={[styles.rowName, { color: colors.text }]} numberOfLines={1}>{u.name || u.handle || 'Usuário'}</Text>
                <Text style={[styles.rowPoints, { color: colors.textSecondary }]}>{u.points ?? u.xpTotal ?? 0} pts</Text>
              </View>
            ))
          )}
        </View>

        {!!error && (
          <View style={{ marginTop: 12 }}><Text style={{ color: colors.text }}>{String(error)}</Text></View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerBox: { marginTop: 8 },
  title: { fontSize: 22, fontWeight: '800' },
  desc: { marginTop: 6, fontSize: 13 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  codeInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, minHeight: 180 },
  primaryButton: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 10 },
  rowPos: { width: 36, textAlign: 'center' },
  rowName: { flex: 1 },
  rowPoints: { width: 80, textAlign: 'right' },
});