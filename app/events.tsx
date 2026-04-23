import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppTitle, BodyText, MutedText, SearchInput } from "../src/components/ui/Primitives";
import { Card, Screen } from "../src/components/ui/Screen";
import { dataService } from "../src/services/client";
import { ParliamentEvent } from "../src/types/domain";
import { theme } from "../src/theme/tokens";

const PAGE_SIZE = 9;

function formatDate(value?: string): string {
  if (!value) return "Date not provided";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

export default function EventsScreen() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ParliamentEvent[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    dataService
      .getEvents({ page, limit: PAGE_SIZE, search: query })
      .then((result) => {
        if (!mounted) return;
        setItems(result.events);
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
      <AppTitle>Events</AppTitle>
      <SearchInput placeholder="Search event title, location..." value={query} onChangeText={setQuery} />
      {loading ? (
        <Card>
          <BodyText>Loading events...</BodyText>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <BodyText>No events found.</BodyText>
        </Card>
      ) : (
        <>
          {items.map((item) => (
            <Card key={item.id}>
              <View style={styles.topRow}>
                <Text style={styles.titleText}>{item.title}</Text>
                <View style={[styles.houseBadge, item.house === "SENATE" ? styles.senateBadge : styles.naBadge]}>
                  <Text style={styles.houseText}>{item.house === "SENATE" ? "Senate" : "National Assembly"}</Text>
                </View>
              </View>
              <Text style={styles.bodyText}>{item.description || "No description provided."}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.brand.primary} />
                <Text style={styles.metaText}>{formatDate(item.date)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color={theme.colors.brand.primary} />
                <Text style={styles.metaText}>{item.location || "Location not provided"}</Text>
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
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  titleText: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    flex: 1,
    flexShrink: 1,
    lineHeight: 24,
  },
  houseBadge: { borderRadius: theme.radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  senateBadge: { backgroundColor: "#fee2e2" },
  naBadge: { backgroundColor: "#e8f6ee" },
  houseText: { fontSize: 11, fontWeight: "700", color: theme.colors.text.primary },
  bodyText: { ...theme.typography.body, color: theme.colors.text.secondary, lineHeight: 22 },
  metaRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  metaText: { ...theme.typography.caption, color: theme.colors.text.muted, flex: 1, flexShrink: 1, lineHeight: 18 },
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
