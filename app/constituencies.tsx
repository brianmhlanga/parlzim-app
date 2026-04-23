import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Card, Screen } from "../src/components/ui/Screen";
import { AppTitle, BodyText, MutedText, SearchInput, SectionTitle } from "../src/components/ui/Primitives";
import { dataService } from "../src/services/client";
import { ConstituencyProfile } from "../src/types/domain";
import { theme } from "../src/theme/tokens";

const PAGE_SIZE = 12;
const REMOTE_PDF_BASE = "https://e-portal.parlzim.gov.zw/files/";

function getProfilePdfUrl(pdfPath: string): string | null {
  if (!pdfPath) return null;
  if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) return pdfPath;
  const normalized = pdfPath.toLowerCase().endsWith(".pdf") ? pdfPath : `${pdfPath}.pdf`;
  return `${REMOTE_PDF_BASE}${encodeURIComponent(normalized)}`;
}

async function openConstituencyPdf(item: ConstituencyProfile) {
  const firstPdfPath = item.profilePdfPaths[0];
  const url = firstPdfPath ? getProfilePdfUrl(firstPdfPath) : null;
  if (!url) {
    Alert.alert("Unavailable", "No constituency profile PDF is available for this record.");
    return;
  }
  await Linking.openURL(url);
}

export default function ConstituenciesScreen() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ConstituencyProfile[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    dataService
      .getConstituencies({ page, limit: PAGE_SIZE, search: query, onlyWithRepresentative: true })
      .then((result) => {
        if (!mounted) return;
        setItems(result.constituencies);
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
      <AppTitle>Constituency Profiles</AppTitle>
      <SearchInput placeholder="Search constituency, province, district..." value={query} onChangeText={setQuery} />
      {loading ? (
        <Card>
          <BodyText>Loading constituency profiles...</BodyText>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <BodyText>No constituency profiles matched your search.</BodyText>
        </Card>
      ) : (
        <>
          {items.map((item) => (
            <Card key={item.id}>
              <SectionTitle>{item.name}</SectionTitle>
              <MutedText>
                {item.province}
                {item.district ? ` | ${item.district}` : ""}
              </MutedText>
              <View style={styles.metaWrap}>
                <MutedText>Representatives: {item.memberCount}</MutedText>
                <MutedText>Profile PDFs: {item.profilePdfPaths.length}</MutedText>
                <MutedText>Population: {item.population ?? "N/A"}</MutedText>
              </View>
              <View style={styles.actionRow}>
                <Pressable style={[styles.button, styles.viewButton]} onPress={() => openConstituencyPdf(item)}>
                  <Ionicons name="eye-outline" size={14} color={theme.colors.brand.primary} />
                  <Text style={styles.viewText}>View</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.downloadButton]} onPress={() => openConstituencyPdf(item)}>
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
  metaWrap: { marginTop: 2, gap: 2 },
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
