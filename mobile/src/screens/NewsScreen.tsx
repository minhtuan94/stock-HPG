import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../lib/api";
import { NewsItem } from "../types/api";
import { Card, Heading } from "../components/Ui";
import { palette } from "../theme/palette";

export function NewsScreen() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await api.news();
      setItems(response.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={palette.primary} /></View>;
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl tintColor={palette.primary} refreshing={refreshing} onRefresh={() => {
        setRefreshing(true);
        void load();
      }} />}
    >
      <Heading>Latest News</Heading>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {items.map((item) => (
        <TouchableOpacity key={item.id} activeOpacity={0.85} onPress={() => void Linking.openURL(item.url)}>
          <Card>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{item.source} - {new Date(item.publishedAt).toLocaleString("vi-VN")}</Text>
            <Text style={styles.summary}>{item.summary}</Text>
            <Text style={[styles.sentiment, { color: item.sentiment >= 0 ? palette.success : palette.danger }]}>
              Sentiment: {item.sentiment.toFixed(2)}
            </Text>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.background,
  },
  error: {
    color: palette.danger,
  },
  title: {
    color: palette.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  meta: {
    color: palette.textMuted,
    fontSize: 12,
  },
  summary: {
    color: palette.textPrimary,
    lineHeight: 20,
  },
  sentiment: {
    fontWeight: "700",
  },
});
