import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "../../theme/tokens";

export function AppTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.h3}>{children}</Text>;
}

export function BodyText({ children }: { children: ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

export function MutedText({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function SearchInput({
  placeholder,
  value,
  onChangeText,
}: {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={theme.colors.text.muted}
      style={styles.search}
      value={value}
      onChangeText={onChangeText}
      accessibilityLabel={placeholder}
    />
  );
}

export function Chip({ label }: { label: string }) {
  return (
    <Pressable style={styles.chip} accessibilityRole="button" accessibilityLabel={`Filter ${label}`}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ labels }: { labels: string[] }) {
  return (
    <View style={styles.chipRow}>
      {labels.map((label) => (
        <Chip key={label} label={label} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { ...theme.typography.h1, color: theme.colors.text.primary },
  h3: { ...theme.typography.h3, color: theme.colors.text.primary },
  body: { ...theme.typography.body, color: theme.colors.text.secondary, lineHeight: 22 },
  muted: { ...theme.typography.caption, color: theme.colors.text.muted },
  search: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    color: theme.colors.text.primary,
  },
  chipRow: { flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap" },
  chip: {
    backgroundColor: theme.colors.brand.accentSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
  },
  chipText: { color: theme.colors.brand.primaryDark, fontWeight: "600" },
});
