import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { createContext, PropsWithChildren, useContext, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../theme/tokens";

type DrawerContextValue = {
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

const drawerItems = [
  { label: "Home", route: "/(tabs)" },
  { label: "MPs & Senators", route: "/(tabs)/mps" },
  { label: "Bills", route: "/(tabs)/bills" },
  { label: "Bill Statuses", route: "/(tabs)/bill-statuses" },
  { label: "Hansard", route: "/(tabs)/hansard" },
  { label: "Votes & Proceedings", route: "/(tabs)/votes-and-proceedings" },
  { label: "Events", route: "/(tabs)/events" },
  { label: "Constituency Profiles", route: "/(tabs)/constituencies" },
  { label: "Committees", route: "/(tabs)/committees" },
  { label: "Petition Parliament", route: "/petition-parliament" },
  { label: "Vacancies", route: "/vacancies" },
  { label: "About", route: "/(tabs)/about" },
] as const;

export function DrawerProvider({ children }: PropsWithChildren) {
  const [visible, setVisible] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const openDrawer = () => {
    setVisible(true);
    Animated.timing(animation, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  };

  const closeDrawer = () => {
    Animated.timing(animation, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setVisible(false));
  };

  const value = useMemo(
    () => ({
      openDrawer,
      closeDrawer,
      toggleDrawer: () => (visible ? closeDrawer() : openDrawer()),
    }),
    [visible],
  );

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-280, 0],
  });

  return (
    <DrawerContext.Provider value={value}>
      {children}
      {visible ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[styles.backdrop, { opacity: animation }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} accessibilityRole="button" />
          </Animated.View>
          <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
            <SafeAreaView style={styles.drawerSafeArea} edges={["top", "bottom"]}>
              <View style={styles.drawerHeader}>
                <View style={styles.logo}>
                  <Text style={styles.logoText}>PZ</Text>
                </View>
                <View>
                  <Text style={styles.drawerTitle}>Parliament Zimbabwe</Text>
                  <Text style={styles.drawerSubtitle}>Parliament Services</Text>
                </View>
              </View>
              {drawerItems.map((item) => (
                <Pressable
                  key={item.route}
                  style={styles.item}
                  onPress={() => {
                    closeDrawer();
                    router.push(item.route);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to ${item.label}`}
                >
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.brand.primary} />
                  <Text style={styles.itemText}>{item.label}</Text>
                </Pressable>
              ))}
              <View style={styles.creditWrap}>
                <Text style={styles.creditText}>Designed by Webdev</Text>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      ) : null}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const value = useContext(DrawerContext);
  if (!value) throw new Error("useDrawer must be used within DrawerProvider");
  return value;
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00000066" },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: theme.colors.background.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  drawerSafeArea: { flex: 1, padding: theme.spacing.lg, gap: theme.spacing.md },
  drawerHeader: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md, marginBottom: theme.spacing.md },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.brand.primary,
  },
  logoText: { color: theme.colors.text.inverse, fontWeight: "700" },
  drawerTitle: { color: theme.colors.text.primary, fontWeight: "700", fontSize: 16 },
  drawerSubtitle: { color: theme.colors.text.muted, fontSize: 13 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemText: { color: theme.colors.text.secondary, fontWeight: "600" },
  creditWrap: {
    marginTop: "auto",
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  creditText: {
    color: theme.colors.text.muted,
    fontSize: 12,
    textAlign: "center",
  },
});
