import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";

export default function RankingScreen() {
  const { commonStyles, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await ApiService.getLeaderboards({ limit: 50 });
        if (!mounted) return;
        // Garante array
        const items = Array.isArray(data) ? data : data?.items || [];
        setLeaderboard(items);
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
  }, []);

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Ranking</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Top usuários por XP</Text>
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
          data={leaderboard}
          keyExtractor={(item, index) => String(item.id || item.userId || index)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <View style={[styles.card, { backgroundColor: colors.card }]}> 
              <View style={styles.rankCircle}> 
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.cardBody}> 
                <Text style={[styles.name, { color: colors.text }]}>
                  {item.user?.name || item.name || item.handle || "Usuário"}
                </Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]}> 
                  {item.college?.name || item.college || ""}
                </Text>
              </View>
              <View style={styles.xpBox}> 
                <Text style={[styles.xpText, { color: colors.xp }]}>{item.xpTotal ?? item.xp ?? 0} XP</Text>
              </View>
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
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ECECEC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "700",
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
  xpBox: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F6F6F6",
  },
  xpText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
