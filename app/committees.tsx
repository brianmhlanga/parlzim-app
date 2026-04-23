import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppTitle, BodyText, MutedText, SearchInput, SectionTitle } from "../src/components/ui/Primitives";
import { Card, Screen } from "../src/components/ui/Screen";
import { dataService } from "../src/services/client";
import { Committee } from "../src/types/domain";
import { theme } from "../src/theme/tokens";

const PAGE_SIZE = 9;

function formatType(value: Committee["type"]): string {
  if (value === "PORTFOLIO") return "Portfolio";
  if (value === "THEMATIC") return "Thematic";
  return "Committee";
}

export default function CommitteesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Committee[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const heading = useMemo(() => "Committees", []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    dataService
      .getCommittees({ page, limit: PAGE_SIZE, search: query })
      .then((result) => {
        if (!mounted) return;
        setItems(result.committees);
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
      <AppTitle>{heading}</AppTitle>
      <SearchInput placeholder="Search committees..." value={query} onChangeText={setQuery} />

      {loading ? (
        <Card>
          <BodyText>Loading committees...</BodyText>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <BodyText>No committees found.</BodyText>
        </Card>
      ) : (
        <>
          {items.map((committee) => (
            <Card key={committee.id}>
              <View style={styles.cardContent}>
                <View style={styles.topRow}>
                  <SectionTitle>{committee.name}</SectionTitle>
                  <View style={styles.typePill}>
                    <Text style={styles.typeText}>{formatType(committee.type)}</Text>
                  </View>
                </View>
                <Text numberOfLines={3} style={styles.descriptionText}>
                  {committee.description}
                </Text>
                <View style={styles.memberRow}>
                  <Ionicons name="people-outline" size={16} color={theme.colors.brand.primary} />
                  <MutedText>{committee.memberCount} Members</MutedText>
                </View>
                <Pressable
                  style={styles.detailButton}
                  onPress={() => router.push({ pathname: "/(tabs)/committee/[id]", params: { id: committee.id } })}
                >
                  <Ionicons name="information-circle-outline" size={16} color={theme.colors.text.inverse} />
                  <Text style={styles.detailButtonText}>View Details</Text>
                </Pressable>
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
  cardContent: { gap: theme.spacing.sm },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  typePill: {
    backgroundColor: "#e8f6ee",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeText: {
    color: theme.colors.brand.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: theme.spacing.xs },
  descriptionText: { ...theme.typography.body, color: theme.colors.text.secondary, lineHeight: 22 },
  detailButton: {
    marginTop: theme.spacing.md,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brand.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  detailButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: "700",
  },
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
