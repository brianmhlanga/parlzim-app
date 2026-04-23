import { useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Card, Screen } from "../../src/components/ui/Screen";
import { AppTitle, BodyText, MutedText, SearchInput } from "../../src/components/ui/Primitives";
import { Bill } from "../../src/types/domain";
import { dataService } from "../../src/services/client";
import { theme } from "../../src/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";

const BILLS_PDF_BASE = "https://e-portal.parlzim.gov.zw/files/";

async function openBillPdf(bill: Bill) {
  if (!bill.pdfPath) return;
  const normalized = bill.pdfPath.toLowerCase().endsWith(".pdf") ? bill.pdfPath : `${bill.pdfPath}.pdf`;
  const url = `${BILLS_PDF_BASE}${encodeURIComponent(normalized)}`;
  await Linking.openURL(url);
}

export default function BillsScreen() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Bill[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    dataService
      .getBills({ page, limit: 12 })
      .then((result) => {
        if (!mounted) return;
        setData(result.bills);
        setTotalPages(Math.max(1, result.pagination.pages || 1));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page]);

  const filtered = data.filter((item) => {
    const q = query.toLowerCase();
    return item.title.toLowerCase().includes(q) || (item.billNumber || "").toLowerCase().includes(q);
  });
  useEffect(() => {
    setPage(1);
  }, [query]);
  const currentPage = Math.min(page, totalPages);

  return (
    <Screen>
      <AppTitle>Bills</AppTitle>
      <SearchInput placeholder="Search bills, sponsor, stage..." value={query} onChangeText={setQuery} />
      {loading ? (
        <Card>
          <BodyText>Loading bills...</BodyText>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <BodyText>No bills matched your search.</BodyText>
        </Card>
      ) : (
        <>
          {filtered.map((item) => (
            <Card key={item.id}>
              <BodyText>{item.title}</BodyText>
              {item.billNumber ? <MutedText>Bill No: {item.billNumber}</MutedText> : null}
              {item.pdfPath ? (
                <View style={styles.actionRow}>
                  <Pressable style={[styles.button, styles.viewButton]} onPress={() => openBillPdf(item)}>
                    <Ionicons name="eye-outline" size={14} color={theme.colors.brand.primary} />
                    <Text style={styles.viewText}>View</Text>
                  </Pressable>
                  <Pressable style={[styles.button, styles.downloadButton]} onPress={() => openBillPdf(item)}>
                    <Ionicons name="download-outline" size={14} color={theme.colors.text.inverse} />
                    <Text style={styles.downloadText}>Download</Text>
                  </Pressable>
                </View>
              ) : null}
            </Card>
          ))}
          {!query ? (
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
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionRow: { flexDirection: "row", gap: theme.spacing.md },
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
