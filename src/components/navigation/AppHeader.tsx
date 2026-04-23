import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../../theme/tokens";
import { useDrawer } from "./DrawerProvider";

export function AppHeader() {
  const { toggleDrawer } = useDrawer();

  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>PZ</Text>
        </View>
        <View>
          <Text style={styles.title}>Parliament Zimbabwe</Text>
          <Text style={styles.subtitle}>Official Parliament App</Text>
        </View>
      </View>
      <Pressable
        style={styles.menuButton}
        onPress={toggleDrawer}
        accessibilityRole="button"
        accessibilityLabel="Open navigation drawer"
      >
        <Ionicons name="menu" size={22} color={theme.colors.brand.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.background.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.brand.primary,
  },
  logoText: { color: theme.colors.text.inverse, fontWeight: "700", fontSize: 13 },
  title: { color: theme.colors.text.primary, fontWeight: "700", fontSize: 14 },
  subtitle: { color: theme.colors.text.muted, fontSize: 12 },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background.elevated,
  },
});
