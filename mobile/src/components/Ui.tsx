import { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette } from "../theme/palette";

export function Screen({ children }: PropsWithChildren) {
  return <View style={styles.screen}>{children}</View>;
}

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

export function Label({ children }: PropsWithChildren) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Value({ children }: PropsWithChildren) {
  return <Text style={styles.value}>{children}</Text>;
}

export function Heading({ children }: PropsWithChildren) {
  return <Text style={styles.heading}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 6,
  },
  heading: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  label: {
    color: palette.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});
