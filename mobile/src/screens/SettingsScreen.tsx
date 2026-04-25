import { StyleSheet, Text, View } from "react-native";
import { Card, Heading, Label, Screen, Value } from "../components/Ui";
import { palette } from "../theme/palette";

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "(not set)";

export function SettingsScreen() {
  return (
    <Screen>
      <Heading>Settings</Heading>
      <Card>
        <Label>API Base URL</Label>
        <Value>{apiBaseUrl}</Value>
        <Text style={styles.help}>
          Create mobile/.env from mobile/.env.example and set EXPO_PUBLIC_API_BASE_URL to your web API.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  help: {
    color: palette.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
});
