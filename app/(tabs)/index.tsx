import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Card, Screen } from "../../src/components/ui/Screen";
import { AppTitle, BodyText, MutedText, SectionTitle } from "../../src/components/ui/Primitives";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { dataService } from "../../src/services/client";
import { Member } from "../../src/types/domain";
import { theme } from "../../src/theme/tokens";

const HERO_IMAGE = require("../../assets/zimbabwe-parliament2.jpg");

const quickActions = [
  { label: "MPs & Senators", icon: "people-outline", route: "/(tabs)/mps" },
  { label: "Bills", icon: "document-text-outline", route: "/(tabs)/bills" },
  { label: "Hansard", icon: "book-outline", route: "/(tabs)/hansard" },
  { label: "Events", icon: "calendar-outline", route: "/(tabs)/events" },
  { label: "Votes", icon: "checkmark-done-outline", route: "/(tabs)/votes-and-proceedings" },
  { label: "Committees", icon: "people-circle-outline", route: "/(tabs)/committees" },
  { label: "Constituencies", icon: "map-outline", route: "/(tabs)/constituencies" },
  { label: "About", icon: "information-circle-outline", route: "/(tabs)/about" },
] as const;

type BreakdownItem = { label: string; value: number; color: string };

const DEFAULT_PARTY_BREAKDOWN: BreakdownItem[] = [
  { label: "ZANU-PF", value: 136, color: theme.colors.brand.primary },
  { label: "CCC", value: 73, color: theme.colors.brand.accent },
  { label: "Others", value: 11, color: theme.colors.status.neutral },
];

function formatEntryType(value?: string): string {
  const raw = (value || "").trim().toLowerCase();
  if (!raw) return "Other";
  if (raw === "constituency") return "Constituency Seats";
  if (raw === "womens_quota" || raw === "women_quota") return "Proportional Representation";
  if (raw === "chief" || raw === "chiefs") return "Chiefs";
  if (raw === "disability" || raw === "persons_with_disabilities") return "Disability";
  if (raw === "youth_quota" || raw === "youth") return "Youth Quota";
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildRingSizes(totalSeats: number): number[] {
  const total = Math.max(1, totalSeats);
  const ringWeights = [2, 3, 4, 5, 6, 7, 8];
  const weightTotal = ringWeights.reduce((a, b) => a + b, 0);
  const base = ringWeights.map((w) => Math.max(1, Math.floor((total * w) / weightTotal)));
  let assigned = base.reduce((a, b) => a + b, 0);
  let idx = base.length - 1;
  while (assigned < total) {
    base[idx] += 1;
    assigned += 1;
    idx = idx === 0 ? base.length - 1 : idx - 1;
  }
  while (assigned > total) {
    const next = base.findIndex((value) => value > 1);
    if (next === -1) break;
    base[next] -= 1;
    assigned -= 1;
  }
  return base;
}

async function loadAllMembers(): Promise<Member[]> {
  const pageSize = 100;
  const first = await dataService.getMembers({ page: 1, limit: pageSize, archived: false, parliaments: 1, search: "" });
  const all = [...first.members];
  const totalPages = Math.max(1, first.pagination.pages || 1);
  if (totalPages === 1) return all;
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      dataService.getMembers({ page: i + 2, limit: pageSize, archived: false, parliaments: 1, search: "" }),
    ),
  );
  rest.forEach((result) => all.push(...result.members));
  return all;
}

export default function HomeScreen() {
  const router = useRouter();
  const [partyBreakdown, setPartyBreakdown] = useState<BreakdownItem[]>(DEFAULT_PARTY_BREAKDOWN);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ label: string; value: number }[]>([
    { label: "Constituency Seats", value: 210 },
    { label: "Proportional Representation", value: 60 },
    { label: "Chiefs", value: 18 },
    { label: "Disability", value: 2 },
    { label: "Youth Quota", value: 10 },
  ]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [womenPct, setWomenPct] = useState(33);
  const [menPct, setMenPct] = useState(67);
  const [youthSeats, setYouthSeats] = useState(10);
  const [membersCount, setMembersCount] = useState(0);
  const [activeBillsCount, setActiveBillsCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    setIsStatsLoading(true);
    Promise.all([loadAllMembers(), dataService.getBills({ page: 1, limit: 12 })])
      .then(([members, billsResult]) => {
        if (!mounted || members.length === 0) return;

        const partyCounts = new Map<string, number>();
        const entryCounts = new Map<string, number>();
        members.forEach((member) => {
          const party = (member.party || "Independent").trim();
          partyCounts.set(party, (partyCounts.get(party) ?? 0) + 1);
          const entry = formatEntryType(member.entryType);
          entryCounts.set(entry, (entryCounts.get(entry) ?? 0) + 1);
        });

        const sortedParties = Array.from(partyCounts.entries()).sort((a, b) => b[1] - a[1]);
        const topTwo = sortedParties.slice(0, 2);
        const others = sortedParties.slice(2).reduce((sum, [, value]) => sum + value, 0);
        const dynamicParty: BreakdownItem[] = [
          { label: topTwo[0]?.[0] ?? "Leading Party", value: topTwo[0]?.[1] ?? 0, color: theme.colors.brand.primary },
          { label: topTwo[1]?.[0] ?? "Second Party", value: topTwo[1]?.[1] ?? 0, color: theme.colors.brand.accent },
          { label: "Others", value: others, color: theme.colors.status.neutral },
        ].filter((item) => item.value > 0);

        const preferredOrder = ["Constituency Seats", "Proportional Representation", "Chiefs", "Disability", "Youth Quota"];
        const dynamicCategories = preferredOrder
          .map((label) => ({ label, value: entryCounts.get(label) ?? 0 }))
          .filter((item) => item.value > 0);
        setMembersCount(members.length);
        setActiveBillsCount(billsResult.pagination?.total ?? billsResult.bills.length);

        const totalMembers = members.length;
        const womenCount = members.filter((member) => (member.gender || "").trim().toLowerCase() === "female").length;
        const menCount = members.filter((member) => (member.gender || "").trim().toLowerCase() === "male").length;
        const youthCount = members.filter((member) => formatEntryType(member.entryType) === "Youth Quota").length;
        if (totalMembers > 0) {
          const womenPercent = Math.round((womenCount / totalMembers) * 100);
          const menPercent = Math.round((menCount / totalMembers) * 100);
          setWomenPct(womenPercent);
          setMenPct(menPercent);
        }
        setYouthSeats(youthCount);

        if (dynamicParty.length > 0) setPartyBreakdown(dynamicParty);
        if (dynamicCategories.length > 0) setCategoryBreakdown(dynamicCategories);
      })
      .finally(() => {
        if (mounted) setIsStatsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totalAssemblySeats = partyBreakdown.reduce((total, party) => total + party.value, 0);
  const seatRingSizes = useMemo(() => buildRingSizes(totalAssemblySeats), [totalAssemblySeats]);
  const seatColors = partyBreakdown.flatMap((party) => Array.from({ length: party.value }, () => party.color));
  const seatDots = seatRingSizes.flatMap((ringCount, ringIndex) => {
    const radius = 28 + ringIndex * 18;
    const originX = 160;
    const originY = 210;
    return Array.from({ length: ringCount }, (_, seatIndex) => {
      const t = ringCount <= 1 ? 0.5 : seatIndex / (ringCount - 1);
      const angle = Math.PI - Math.PI * t;
      const x = originX + radius * Math.cos(angle);
      const y = originY - radius * Math.sin(angle);
      return { x, y };
    });
  });

  return (
    <Screen>
      <ImageBackground source={HERO_IMAGE} style={styles.heroImage} imageStyle={styles.heroImageInner}>
        <LinearGradient
          colors={["rgba(15,90,46,0.97)", "rgba(26,127,66,0.90)", "rgba(26,127,66,0.42)", "rgba(26,127,66,0.0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.heroOverlay}
        >
          <Text style={styles.heroLabel}>Welcome to</Text>
          <Text style={styles.heroTitle}>Parliament of Zimbabwe</Text>
          <Text style={styles.heroSubtext}>Track business, bills, hansards, and public participation in one place.</Text>
        </LinearGradient>
      </ImageBackground>

      <Card>
        <SectionTitle>Quick Access</SectionTitle>
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              style={styles.quickButton}
              onPress={() => router.push(action.route)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${action.label}`}
            >
              <View style={styles.quickIconWrap}>
                <Ionicons name={action.icon} size={20} color={theme.colors.brand.primary} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>National Assembly Breakdown (Latest Parliament)</SectionTitle>
        <View style={styles.seatMapWrap}>
          <View style={styles.seatMap}>
            {seatDots.map((dot, index) => (
              <View
                key={`seat-${index}`}
                style={[
                  styles.seatDot,
                  {
                    left: dot.x,
                    top: dot.y,
                    backgroundColor: seatColors[index] ?? theme.colors.status.neutral,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.totalSeatsLabel}>{totalAssemblySeats} Total Seats</Text>
          <View style={styles.partyLegend}>
            {partyBreakdown.map((party) => (
              <View key={`legend-${party.label}`} style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: party.color }]} />
                <Text style={styles.legendText}>
                  {party.label} ({party.value})
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownCell}>
            <View style={styles.breakdownIconWrap}>
              <Ionicons name="female-outline" size={16} color={theme.colors.brand.primary} />
            </View>
            <Text style={styles.metricValue}>{womenPct}%</Text>
            <MutedText>Women</MutedText>
          </View>
          <View style={styles.breakdownCell}>
            <View style={styles.breakdownIconWrap}>
              <Ionicons name="male-outline" size={16} color={theme.colors.brand.accent} />
            </View>
            <Text style={[styles.metricValue, styles.gold]}>{menPct}%</Text>
            <MutedText>Men</MutedText>
          </View>
          <View style={styles.breakdownCell}>
            <View style={styles.breakdownIconWrap}>
              <Ionicons name="school-outline" size={16} color={theme.colors.brand.primary} />
            </View>
            <Text style={styles.metricValue}>{youthSeats}</Text>
            <MutedText>Youth Seats</MutedText>
          </View>
        </View>
      </Card>

      <Card>
        <SectionTitle>Political Party Breakdown</SectionTitle>
        {isStatsLoading ? <MutedText>Loading real-time breakdown...</MutedText> : null}
        {partyBreakdown.map((party) => (
          <View key={party.label} style={styles.breakdownRow}>
            <View style={styles.breakdownLabelRow}>
              <Text style={styles.breakdownLabel}>{party.label}</Text>
              <Text style={styles.breakdownValue}>{party.value}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round((party.value / totalAssemblySeats) * 100)}%`,
                    backgroundColor: party.color,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </Card>

      <Card>
        <SectionTitle>Seats by Allocation Type</SectionTitle>
        {isStatsLoading ? <MutedText>Loading real-time seat allocation...</MutedText> : null}
        {categoryBreakdown.map((item) => (
          <View key={item.label} style={styles.categoryRow}>
            <Text style={styles.breakdownLabel}>{item.label}</Text>
            <Text style={styles.breakdownValue}>{item.value}</Text>
          </View>
        ))}
      </Card>

      <View style={styles.metrics}>
        <Card>
          <View style={styles.metricCardIcon}>
            <Ionicons name="people-outline" size={18} color={theme.colors.brand.primary} />
          </View>
          <Text style={styles.metricValue}>{membersCount || "..."}</Text>
          <MutedText>Members</MutedText>
        </Card>
        <Card>
          <View style={styles.metricCardIcon}>
            <Ionicons name="document-text-outline" size={18} color={theme.colors.brand.accent} />
          </View>
          <Text style={[styles.metricValue, styles.gold]}>{activeBillsCount || "..."}</Text>
          <MutedText>Active bills</MutedText>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    height: 210,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
  },
  heroImageInner: {
    borderRadius: theme.radius.lg,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    padding: theme.spacing.lg,
    paddingRight: 84,
    gap: 6,
  },
  heroLabel: { color: "#e6ffef", fontSize: 15, fontWeight: "500" },
  heroTitle: { color: theme.colors.text.inverse, fontSize: 30, fontWeight: "700", lineHeight: 36, letterSpacing: 0.2 },
  heroSubtext: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "400", lineHeight: 20 },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  quickButton: {
    width: "22%",
    alignItems: "center",
    gap: 8,
  },
  quickIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d7e7db",
    backgroundColor: theme.colors.background.elevated,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  quickLabel: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 16,
  },
  metrics: { flexDirection: "row", gap: theme.spacing.md },
  metricValue: { fontSize: 24, fontWeight: "600", color: theme.colors.brand.primary },
  gold: { color: theme.colors.brand.accent },
  breakdownGrid: { flexDirection: "row", flexWrap: "nowrap", justifyContent: "space-between", gap: theme.spacing.xs },
  breakdownCell: {
    width: "31%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.elevated,
  },
  breakdownIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef6f0",
    marginBottom: 6,
  },
  seatMapWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  seatMap: {
    width: 320,
    height: 228,
    borderRadius: 24,
    backgroundColor: "#f8fbf9",
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: "relative",
    overflow: "hidden",
  },
  seatDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 0.3,
    borderColor: "#ffffff",
    transform: [{ translateX: -3 }, { translateY: -3 }],
  },
  totalSeatsLabel: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text.secondary,
    fontWeight: "700",
  },
  partyLegend: {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.background.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: theme.colors.text.secondary,
    fontWeight: "600",
    fontSize: 12,
  },
  breakdownRow: { gap: 6, marginTop: theme.spacing.sm },
  breakdownLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  breakdownLabel: { color: theme.colors.text.secondary, fontWeight: "600" },
  breakdownValue: { color: theme.colors.text.primary, fontWeight: "700" },
  progressTrack: {
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.border,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: theme.radius.pill },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  metricCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eef6f0",
    alignItems: "center",
    justifyContent: "center",
  },
});
