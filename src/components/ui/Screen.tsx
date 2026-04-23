import { PropsWithChildren, useContext } from "react";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../theme/tokens";
import { AppHeader } from "../navigation/AppHeader";

export function Screen({ children }: PropsWithChildren) {
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppHeader />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + theme.spacing.lg }]}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background.app },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  card: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
});
