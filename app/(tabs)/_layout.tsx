import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../src/theme/tokens";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const labels: Record<string, string> = {
    index: "HOME",
    mps: "MPS",
    bills: "BILLS",
    hansard: "HANSARD",
    events: "EVENTS",
    live: "LIVE",
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand.primary,
        tabBarInactiveTintColor: theme.colors.text.muted,
        tabBarLabel: labels[route.name] ?? route.name.toUpperCase(),
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarStyle: {
          height: 56 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
          backgroundColor: "#fff",
        },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: focused ? "grid" : "grid-outline",
            mps: focused ? "people" : "people-outline",
            bills: focused ? "document-text" : "document-text-outline",
            hansard: focused ? "book" : "book-outline",
            events: focused ? "calendar" : "calendar-outline",
            live: focused ? "radio" : "radio-outline",
          };
          return <Ionicons name={icons[route.name] ?? "ellipse-outline"} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="mps" />
      <Tabs.Screen name="bills" />
      <Tabs.Screen name="hansard" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="live" />
      <Tabs.Screen name="news" options={{ href: null }} />
      <Tabs.Screen name="member/[id]" options={{ href: null }} />
      <Tabs.Screen name="bill-statuses" options={{ href: null }} />
      <Tabs.Screen name="votes-and-proceedings" options={{ href: null }} />
      <Tabs.Screen name="constituencies" options={{ href: null }} />
      <Tabs.Screen name="committees" options={{ href: null }} />
      <Tabs.Screen name="committee/[id]" options={{ href: null }} />
      <Tabs.Screen name="about" options={{ href: null }} />
    </Tabs>
  );
}
