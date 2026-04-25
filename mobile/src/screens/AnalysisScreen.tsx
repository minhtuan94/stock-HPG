import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../lib/api";
import { AnalysisPayload } from "../types/api";
import { Card, Heading, Label, Value } from "../components/Ui";
import { palette } from "../theme/palette";

export function AnalysisScreen() {
  const [data, setData] = useState<AnalysisPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await api.analysis();
      setData(response);
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
      <Heading>AI Analysis</Heading>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {data ? (
        <>
          <Card>
            <Label>Action</Label>
            <Value>{data.recommendation.action}</Value>
            <Label>Confidence</Label>
            <Value>{data.recommendation.confidence}%</Value>
            <Text style={styles.reason}>{data.recommendation.reason}</Text>
          </Card>

          <Card>
            <Label>Probabilities</Label>
            <Text style={styles.metric}>Up Short Term: {data.probabilities.upShortTerm}%</Text>
            <Text style={styles.metric}>Up Medium Term: {data.probabilities.upMediumTerm}%</Text>
            <Text style={styles.metric}>Down Risk: {data.probabilities.downRisk}%</Text>
          </Card>

          <Card>
            <Label>Scores</Label>
            <Text style={styles.metric}>Sentiment: {data.scores.sentiment}</Text>
            <Text style={styles.metric}>Technical: {data.scores.technical}</Text>
            <Text style={styles.metric}>Micro: {data.scores.micro}</Text>
            <Text style={styles.metric}>Macro: {data.scores.macro}</Text>
          </Card>
        </>
      ) : null}
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
  reason: {
    color: palette.textMuted,
    marginTop: 4,
    lineHeight: 20,
  },
});
