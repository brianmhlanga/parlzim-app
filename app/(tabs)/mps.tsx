import { useEffect, useState } from "react";
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Card, Screen } from "../../src/components/ui/Screen";
import { AppTitle, BodyText, MutedText, SearchInput } from "../../src/components/ui/Primitives";
import { Member } from "../../src/types/domain";
import { dataService } from "../../src/services/client";
import { theme } from "../../src/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

const maleAvatar = require("../../assets/male.png");
const femaleAvatar = require("../../assets/female.png");
const PAGE_SIZE = 8;

function getInitials(name: string): string {
  const clean = name
    .replace(/\b(Hon|Mr|Mrs|Ms|Dr|Sen|Chief)\.?\b/gi, "")
    .trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function formatEntryType(value?: string): string {
  if (!value) return "";
  return value
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function getParliamentarianDisplayName(name: string): string {
  const clean = (name || "").trim();
  if (!clean) return "Hon.";
  if (/^chief\b/i.test(clean)) return clean;
  if (/^hon\.?\b/i.test(clean)) return clean.replace(/^hon\.?\s*/i, "Hon. ");
  return `Hon. ${clean}`;
}

async function handleContact(member: Member) {
  const tel = member.contactNumber?.replace(/\s+/g, "");
  if (tel) {
    await Linking.openURL(`tel:${tel}`);
    return;
  }
  if (member.email) {
    await Linking.openURL(`mailto:${member.email}`);
    return;
  }
  Alert.alert("Contact unavailable", "No phone number or email is available for this member.");
}

export default function MembersScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Member[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    dataService
      .getMembers({ page, limit: PAGE_SIZE, search: query, archived: false, parliaments: 1 })
      .then((result) => {
        if (!mounted) return;
        setData(result.members);
        setTotalPages(Math.max(1, result.pagination.pages || 1));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page, query]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const currentPage = Math.min(page, totalPages);

  return (
    <Screen>
      <AppTitle>MPs & Senators</AppTitle>
      <SearchInput placeholder="Search member, constituency, party..." value={query} onChangeText={setQuery} />
      {loading ? (
        <Card>
          <BodyText>Loading member directory...</BodyText>
        </Card>
      ) : data.length === 0 ? (
        <Card>
          <BodyText>No members matched your search.</BodyText>
        </Card>
      ) : (
        <>
          {data.map((item) => (
            <Card key={item.id}>
              <View style={styles.profileCard}>
                <View style={styles.heroArea}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      defaultSource={item.imageType === "female" ? femaleAvatar : maleAvatar}
                      style={styles.heroImage}
                    />
                  ) : (
                    <View style={styles.initialsHero}>
                      <Text style={styles.initialsText}>{getInitials(getParliamentarianDisplayName(item.name))}</Text>
                    </View>
                  )}
                  <View style={styles.chamberBadgeWrap}>
                    <View
                      style={[
                        styles.chamberBadge,
                        item.chamber === "National Assembly" ? styles.naBadge : styles.senateBadge,
                      ]}
                    >
                      <Text style={styles.chamberBadgeText}>{item.chamber}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.meta}>
                  <BodyText>{getParliamentarianDisplayName(item.name)}</BodyText>
                  <MutedText>{item.constituency}</MutedText>

                  <View style={styles.infoRow}>
                    <Ionicons name="pricetag-outline" size={14} color={theme.colors.brand.primary} />
                    <MutedText>{formatEntryType(item.entryType) || "General Entry"}</MutedText>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="ellipse" size={8} color={theme.colors.text.muted} />
                    <MutedText>{formatEntryType(item.party) || "Independent"}</MutedText>
                  </View>

                  <View style={styles.chipRow}>
                    <View style={styles.statChip}>
                      <Ionicons name="business-outline" size={12} color={theme.colors.text.secondary} />
                      <Text style={styles.statChipText}>{item.parliamentCount ?? 0} Parliament</Text>
                    </View>
                    <View style={styles.statChip}>
                      <Ionicons name="people-outline" size={12} color={theme.colors.text.secondary} />
                      <Text style={styles.statChipText}>{item.committeeCount ?? 0} Committees</Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <Pressable
                      style={[styles.actionBtn, styles.profileBtn]}
                      onPress={() => router.push({ pathname: "/(tabs)/member/[id]", params: { id: item.id } })}
                    >
                      <Ionicons name="person-outline" size={14} color={theme.colors.text.inverse} />
                      <Text style={styles.actionBtnText}>View Profile</Text>
                    </Pressable>
                    <Pressable style={[styles.actionBtn, styles.contactBtn]} onPress={() => handleContact(item)}>
                      <Ionicons name="mail-outline" size={14} color={theme.colors.text.inverse} />
                      <Text style={styles.actionBtnText}>Contact</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Card>
          ))}
          <Card>
            <View style={styles.paginationRow}>
              <Pressable
                style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <Text style={[styles.pageButtonText, currentPage === 1 && styles.pageButtonTextDisabled]}>PREV</Text>
              </Pressable>
              <MutedText>
                Page {currentPage} of {totalPages}
              </MutedText>
              <Pressable
                style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <Text style={[styles.pageButtonText, currentPage === totalPages && styles.pageButtonTextDisabled]}>NEXT</Text>
              </Pressable>
            </View>
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  heroArea: {
    width: "100%",
    aspectRatio: 1,
    minHeight: 200,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  initialsHero: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  chamberBadgeWrap: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  chamberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  naBadge: { backgroundColor: theme.colors.brand.primary },
  senateBadge: { backgroundColor: theme.colors.brand.accent },
  chamberBadgeText: { color: theme.colors.text.inverse, fontSize: 12, fontWeight: "700" },
  initialsText: {
    color: theme.colors.text.inverse,
    fontSize: 32,
    fontWeight: "700",
  },
  meta: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs },
  chipRow: { flexDirection: "row", gap: theme.spacing.sm, marginTop: 4 },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: theme.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statChipText: { color: theme.colors.text.secondary, fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  actionBtn: {
    flex: 1,
    height: 38,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  profileBtn: { backgroundColor: theme.colors.brand.primary },
  contactBtn: { backgroundColor: theme.colors.brand.accent },
  actionBtnText: { color: theme.colors.text.inverse, fontWeight: "700", fontSize: 12 },
  paginationRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pageButton: {
    borderWidth: 1,
    borderColor: theme.colors.brand.primary,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    backgroundColor: theme.colors.background.elevated,
  },
  pageButtonDisabled: { borderColor: theme.colors.border, backgroundColor: "#eef2ef" },
  pageButtonText: { color: theme.colors.brand.primary, fontWeight: "700", fontSize: 12 },
  pageButtonTextDisabled: { color: theme.colors.text.muted },
});
