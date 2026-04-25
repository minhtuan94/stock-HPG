import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../lib/api";
import { DashboardSnapshot } from "../types/api";
import { Card, Heading, Label, Screen, Value } from "../components/Ui";
import { palette } from "../theme/palette";

export function DashboardScreen() {
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const snapshot = await api.dashboard();
      setData(snapshot);
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
    return (
      <Screen>
        <ActivityIndicator color={palette.primary} />
      </Screen>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl tintColor={palette.primary} refreshing={refreshing} onRefresh={() => {
        setRefreshing(true);
        void load();
      }} />}
    >
      <Heading>HPG Dashboard</Heading>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {data ? (
        <>
          <Card>
            <Label>Symbol</Label>
            <Value>{data.symbol}</Value>
            <Label>Current Price</Label>
            <Value>{data.currentPrice.toLocaleString("vi-VN")} VND</Value>
            <Label>Day Change</Label>
            <Text style={[styles.change, { color: data.dayChangePct >= 0 ? palette.success : palette.danger }]}>
              {data.dayChangePct.toFixed(2)}%
            </Text>
          </Card>

          <Card>
            <Label>Recommendation</Label>
            <Value>{data.recommendation.action}</Value>
            <Label>Confidence</Label>
            <Value>{data.recommendation.confidence}%</Value>
            <Text style={styles.reason}>{data.recommendation.reason}</Text>
          </Card>

          <Card>
            <Label>Score Breakdown</Label>
            <View style={styles.row}><Text style={styles.key}>Sentiment</Text><Text style={styles.val}>{data.scores.sentiment}</Text></View>
            <View style={styles.row}><Text style={styles.key}>Technical</Text><Text style={styles.val}>{data.scores.technical}</Text></View>
            <View style={styles.row}><Text style={styles.key}>Micro</Text><Text style={styles.val}>{data.scores.micro}</Text></View>
            <View style={styles.row}><Text style={styles.key}>Macro</Text><Text style={styles.val}>{data.scores.macro}</Text></View>
          </Card>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  error: {
    color: palette.danger,
    marginBottom: 8,
  },
  reason: {
    color: palette.textMuted,
    marginTop: 4,
    lineHeight: 20,
  },
  change: {
    fontSize: 18,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingVertical: 6,
  },
  key: {
    color: palette.textMuted,
  },
  val: {
    color: palette.textPrimary,
    fontWeight: "700",
  },
});
