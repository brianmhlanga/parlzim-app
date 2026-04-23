import { StyleSheet, Text, View } from "react-native";
import { BillStage } from "../../types/domain";
import { theme } from "../../theme/tokens";

const stages: BillStage[] = ["Drafting", "Committee", "Second Reading", "Passed"];

export function BillTimeline({ current }: { current: BillStage }) {
  const activeIndex = stages.indexOf(current);
  return (
    <View style={styles.wrapper}>
      {stages.map((item, index) => {
        const active = index <= activeIndex;
        return (
          <View key={item} style={styles.row}>
            <View style={[styles.dot, active && styles.activeDot]} />
            <Text style={[styles.label, active && styles.activeLabel]}>{item}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: theme.spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  dot: { width: 10, height: 10, borderRadius: theme.radius.pill, backgroundColor: theme.colors.border },
  activeDot: { backgroundColor: theme.colors.brand.primary },
  label: { color: theme.colors.text.muted, fontSize: 13 },
  activeLabel: { color: theme.colors.text.secondary, fontWeight: "600" },
});
