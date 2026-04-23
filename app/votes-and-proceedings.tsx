import { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Card, Screen } from "../src/components/ui/Screen";
import { AppTitle, BodyText, MutedText, SearchInput, SectionTitle } from "../src/components/ui/Primitives";
import { dataService } from "../src/services/client";
import { VoteProceeding } from "../src/types/domain";
import { theme } from "../src/theme/tokens";

const PAGE_SIZE = 12;
const REMOTE_PDF_BASE = "https://e-portal.parlzim.gov.zw/files/";

function formatDate(value?: string): string {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

function getPdfUrl(pdfPath: string): string | null {
  if (!pdfPath) return null;
  if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) return pdfPath;
  const normalized = pdfPath.toLowerCase().endsWith(".pdf") ? pdfPath : `${pdfPath}.pdf`;
  return `${REMOTE_PDF_BASE}${encodeURIComponent(normalized)}`;
}

async function openVotePdf(item: VoteProceeding) {
  const url = getPdfUrl(item.pdfPath);
  if (!url) {
    Alert.alert("Unavailable", "PDF link is not available for this record.");
    return;
  }
  await Linking.openURL(url);
}

export default function VotesAndProceedingsScreen() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<VoteProceeding[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    dataService
      .getVotes({ page, limit: PAGE_SIZE, sort: "dateDesc" })
      .then((result) => {
        if (!mounted) return;
        const filtered = query.trim()
          ? result.votes.filter((item) => {
              const q = query.toLowerCase();
              return (
                item.name.toLowerCase().includes(q) ||
                (item.session || "").toLowerCase().includes(q) ||
                item.house.toLowerCase().includes(q)
              );
            })
          : result.votes;
        setItems(filtered);
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
  const heading = useMemo(() => "Votes & Proceedings", []);

  return (
    <Screen>
      <AppTitle>{heading}</AppTitle>
      <SearchInput placeholder="Search vote title, house, session..." value={query} onChangeText={setQuery} />

      {loading ? (
        <Card>
          <BodyText>Loading votes and proceedings...</BodyText>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <BodyText>No votes and proceedings matched your search.</BodyText>
        </Card>
      ) : (
        <>
          {items.map((item) => (
            <Card key={item.id}>
              <SectionTitle>{item.name}</SectionTitle>
              <MutedText>
                {item.house === "SENATE" ? "Senate" : "National Assembly"}
                {item.session ? ` | Session ${item.session}` : ""}
              </MutedText>
              <View style={styles.metaWrap}>
                <MutedText>Date: {formatDate(item.date)}</MutedText>
                <MutedText>Uploaded: {formatDate(item.dateUploaded)}</MutedText>
                <MutedText>Parliament: {item.parliamentNumber ? `${item.parliamentNumber}th` : "N/A"}</MutedText>
              </View>
              <View style={styles.actionRow}>
                <Pressable style={[styles.button, styles.viewButton]} onPress={() => openVotePdf(item)}>
                  <Ionicons name="eye-outline" size={14} color={theme.colors.brand.primary} />
                  <Text style={styles.viewText}>View</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.downloadButton]} onPress={() => openVotePdf(item)}>
                  <Ionicons name="download-outline" size={14} color={theme.colors.text.inverse} />
                  <Text style={styles.downloadText}>Download</Text>
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
  metaWrap: { gap: 2, marginTop: 2 },
  actionRow: { flexDirection: "row", gap: theme.spacing.md, marginTop: theme.spacing.sm },
  button: {
    flex: 1,
    borderRadius: theme.radius.md,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  viewButton: {
    borderWidth: 2,
    borderColor: theme.colors.brand.primary,
    backgroundColor: "transparent",
  },
  viewText: { color: theme.colors.brand.primary, fontWeight: "700" },
  downloadButton: { backgroundColor: theme.colors.brand.accent },
  downloadText: { color: theme.colors.text.inverse, fontWeight: "700" },
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
