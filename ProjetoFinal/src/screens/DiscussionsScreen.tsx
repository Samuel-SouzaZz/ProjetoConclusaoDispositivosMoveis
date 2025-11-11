import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";

export default function DiscussionsScreen() {
  const { commonStyles, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await ApiService.getGroups();
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
  }, []);

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Discussões</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Grupos e tópicos</Text>
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
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card }]}> 
              <View style={styles.cardBody}> 
                <Text style={[styles.name, { color: colors.text }]}> 
                  {item.name || item.title || "Grupo"}
                </Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]}> 
                  {item.description || `${item.membersCount ?? 0} membros`}
                </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardBody: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
});