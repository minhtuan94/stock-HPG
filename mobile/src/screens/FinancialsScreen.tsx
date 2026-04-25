import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../lib/api";
import { FinancialItem } from "../types/api";
import { Card, Heading, Label, Value } from "../components/Ui";
import { palette } from "../theme/palette";

export function FinancialsScreen() {
  const [items, setItems] = useState<FinancialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await api.financials();
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
      <Heading>Financial Reports</Heading>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {items.map((item) => (
        <Card key={item.id}>
          <Label>Period</Label>
          <Value>Q{item.fiscalQuarter}/{item.fiscalYear}</Value>
          <Text style={styles.metric}>Revenue: {item.revenue.toLocaleString("vi-VN")}</Text>
          <Text style={styles.metric}>Net Profit: {item.netProfit.toLocaleString("vi-VN")}</Text>
          <Text style={styles.metric}>EPS: {item.eps.toLocaleString("vi-VN")}</Text>
          <Text style={styles.metric}>Gross Margin: {item.grossMargin.toFixed(2)}%</Text>
          {item.analysis ? <Text style={styles.note}>AI Trend: {item.analysis.trend}</Text> : null}
        </Card>
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
  metric: {
    color: palette.textPrimary,
  },
  note: {
    color: palette.textMuted,
    marginTop: 6,
  },
});
