import { StyleSheet, Text, View } from "react-native";
import { BillStage } from "../../types/domain";
import { theme } from "../../theme/tokens";

const map = {
  Drafting: theme.colors.status.neutral,
  Committee: theme.colors.status.warning,
  "Second Reading": theme.colors.status.info,
  Passed: theme.colors.status.success,
} as const;

export function StatusBadge({ stage }: { stage: BillStage }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${map[stage]}22` }]}>
      <Text style={[styles.text, { color: map[stage] }]}>{stage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", borderRadius: theme.radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontWeight: "700", fontSize: 12 },
});
