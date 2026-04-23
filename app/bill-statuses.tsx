import { useEffect, useMemo, useState } from "react";
import { Card, Screen } from "../src/components/ui/Screen";
import { AppTitle, BodyText, MutedText, SearchInput, SectionTitle } from "../src/components/ui/Primitives";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../src/theme/tokens";
import { dataService } from "../src/services/client";
import { BillStatusDocument } from "../src/types/domain";

function formatDate(value?: string): string {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

export default function BillStatusesScreen() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<BillStatusDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    dataService
      .getBillStatusDocuments(500)
      .then((result) => {
        if (mounted) setItems(result);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return items;
    return items.filter((item) =>
      [item.title, item.ministry, item.billNumber || "", item.status].some((field) => field.toLowerCase().includes(text))
    );
  }, [items, query]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  return (
    <Screen>
      <AppTitle>Bill Statuses</AppTitle>
      <Card>
        <SectionTitle>Legislative Status Tracker</SectionTitle>
        <BodyText>Live bill status records from Parliament, including ministry, bill number and status history.</BodyText>
      </Card>
      <SearchInput placeholder="Search bill title, ministry, bill number, status..." value={query} onChangeText={setQuery} />

      {loading ? (
        <Card>
          <BodyText>Loading bill statuses...</BodyText>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <BodyText>No bill statuses matched your search.</BodyText>
        </Card>
      ) : (
        <>
          {pagedItems.map((item) => (
            <Card key={item.id}>
              <View style={styles.statusRow}>
                <View style={styles.dot} />
                <SectionTitle>{item.title}</SectionTitle>
              </View>
              <MutedText>{item.billNumber || "Bill number not provided"}</MutedText>
              <BodyText>{item.status}</BodyText>
              <View style={styles.metaWrap}>
                <MutedText>Ministry: {item.ministry}</MutedText>
                <MutedText>Status Date: {formatDate(item.statusDate)}</MutedText>
                <MutedText>Gazette Date: {formatDate(item.gazetteDate)}</MutedText>
              </View>
            </Card>
          ))}
          <Card>
            <View style={styles.paginationRow}>
              <View style={styles.paginationMeta}>
                <MutedText>
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </MutedText>
                <MutedText>
                  Page {currentPage} of {totalPages}
                </MutedText>
              </View>
              <View style={styles.paginationActions}>
                <Pressable
                  style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                  onPress={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <Text style={[styles.pageButtonText, currentPage === 1 && styles.pageButtonTextDisabled]}>PREV</Text>
                </Pressable>
                <Pressable
                  style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                  onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <Text style={[styles.pageButtonText, currentPage === totalPages && styles.pageButtonTextDisabled]}>
                    NEXT
                  </Text>
                </Pressable>
              </View>
            </View>
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  dot: {
    width: 10,
    height: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  metaWrap: { marginTop: theme.spacing.xs, gap: 2 },
  paginationRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: theme.spacing.md },
  paginationMeta: { gap: 2 },
  paginationActions: { flexDirection: "row", gap: theme.spacing.sm },
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
