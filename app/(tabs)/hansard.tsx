import { useEffect, useMemo, useState } from "react";
import { Card, Screen } from "../../src/components/ui/Screen";
import { AppTitle, BodyText, ChipRow, MutedText, SearchInput } from "../../src/components/ui/Primitives";
import { HansardEntry } from "../../src/types/domain";
import { dataService } from "../../src/services/client";
import { Alert, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../../src/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Linking from "expo-linking";

const bundledHansardPdf = require("../../assets/hansard.pdf");
const PAGE_SIZE = 4;
const REMOTE_PDF_BASE = "https://e-portal.parlzim.gov.zw/files/";

async function getBundledPdfUri() {
  const asset = Asset.fromModule(bundledHansardPdf);
  await asset.downloadAsync();
  if (!asset.localUri) throw new Error("Failed to prepare bundled Hansard PDF.");
  return asset.localUri;
}

function getPdfCandidates(pdfPath: string): string[] {
  if (!pdfPath) return [];
  if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) return [pdfPath];
  if (pdfPath.startsWith("assets/")) return [];
  const normalized = pdfPath.toLowerCase().endsWith(".pdf") ? pdfPath : `${pdfPath}.pdf`;
  return [`${REMOTE_PDF_BASE}${encodeURIComponent(normalized)}`];
}

function getRemotePdfUrl(pdfPath: string): string | null {
  const candidates = getPdfCandidates(pdfPath);
  return candidates.length > 0 ? candidates[0] : null;
}

async function resolveHansardPdfUri(entry: HansardEntry): Promise<string> {
  const cacheRoot = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (cacheRoot) {
    for (const candidate of getPdfCandidates(entry.pdfPath)) {
      try {
        const downloaded = await FileSystem.downloadAsync(candidate, `${cacheRoot}hansard-${entry.id}.pdf`);
        return downloaded.uri;
      } catch {
        // Try next candidate URL, then fall back to bundled sample.
      }
    }
  }

  return getBundledPdfUri();
}

async function openPdfForView(entry: HansardEntry) {
  try {
    const remoteUrl = getRemotePdfUrl(entry.pdfPath);
    if (remoteUrl) {
      await Linking.openURL(remoteUrl);
      return;
    }

    const sourceUri = await resolveHansardPdfUri(entry);
    const canOpen = await Linking.canOpenURL(sourceUri);

    if (canOpen) {
      await Linking.openURL(sourceUri);
      return;
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(sourceUri, {
        mimeType: "application/pdf",
        dialogTitle: `View ${entry.title}`,
      });
      return;
    }

    Alert.alert("View unavailable", "No app available to open this PDF on your device.");
  } catch (error) {
    Alert.alert("View failed", "Unable to open the Hansard PDF right now.");
  }
}

async function downloadPdf(entry: HansardEntry) {
  try {
    const remoteUrl = getRemotePdfUrl(entry.pdfPath);
    if (remoteUrl) {
      await Linking.openURL(remoteUrl);
      return;
    }

    const sourceUri = await resolveHansardPdfUri(entry);
    const canOpen = await Linking.canOpenURL(sourceUri);
    if (canOpen) {
      await Linking.openURL(sourceUri);
      return;
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(sourceUri, {
        mimeType: "application/pdf",
        dialogTitle: `Download ${entry.title}`,
      });
      return;
    }

    Alert.alert("Download unavailable", "No app available to open this PDF on your device.");
  } catch (error) {
    Alert.alert("Download failed", "Unable to download the Hansard PDF right now.");
  }
}

export default function HansardScreen() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<HansardEntry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    dataService
      .getHansards({ page, limit: PAGE_SIZE, search: query })
      .then((result) => {
        if (!mounted) return;
        setData(result.hansards);
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
  const pagedHansards = useMemo(() => data, [data]);

  return (
    <Screen>
      <AppTitle>Hansard</AppTitle>
      <SearchInput placeholder="Search debates, questions, sittings..." value={query} onChangeText={setQuery} />
      <ChipRow labels={["Latest", "National Assembly", "Senate", "Committees"]} />
      {loading ? (
        <Card>
          <BodyText>Loading Hansard records...</BodyText>
        </Card>
      ) : pagedHansards.length === 0 ? (
        <Card>
          <BodyText>No Hansard entries matched your search.</BodyText>
        </Card>
      ) : (
        <>
          {pagedHansards.map((item) => (
            <Card key={item.id}>
              <View
                style={[
                  styles.chamberOutline,
                  item.chamber === "Senate" ? styles.senateOutline : styles.nationalAssemblyOutline,
                ]}
              />
              <ImageBackground source={{ uri: item.coverImageUrl }} style={styles.cover} imageStyle={styles.coverImage}>
                <View style={styles.coverOverlay} />
                <View style={styles.coverContent}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.quarter}>{item.quarter}</Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badge, styles.greenBadge]}>
                        <Text style={styles.badgeText}>{item.chamber}</Text>
                      </View>
                      <View style={[styles.badge, styles.goldBadge]}>
                        <Text style={styles.badgeText}>{item.parliamentName}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ImageBackground>

              <BodyText>{item.title}</BodyText>
              <MutedText>Ref: {item.referenceNumber} | Vol. {item.volume}</MutedText>
              <Text style={styles.abstractPreview} numberOfLines={4}>
                {item.excerpt}
              </Text>
              <MutedText>Date: {item.sittingDate}</MutedText>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  <Ionicons name="eye-outline" size={14} color={theme.colors.brand.primary} /> {item.views}
                </Text>
                <Text style={styles.metaText}>
                  <Ionicons name="download-outline" size={14} color={theme.colors.brand.primary} /> {item.downloads}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.button, styles.viewButton]}
                  onPress={() => openPdfForView(item)}
                >
                  <Ionicons name="eye-outline" size={14} color={theme.colors.brand.primary} />
                  <Text style={styles.viewText}>View</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.downloadButton]}
                  onPress={() => downloadPdf(item)}
                >
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
  chamberOutline: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 2,
    borderRadius: theme.radius.lg,
  },
  senateOutline: { borderColor: "#dc2626" },
  nationalAssemblyOutline: { borderColor: theme.colors.brand.primary },
  cover: { height: 180, justifyContent: "flex-end" },
  coverImage: { borderRadius: theme.radius.md },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000f1d66",
    borderRadius: theme.radius.md,
  },
  coverContent: { padding: theme.spacing.md },
  badgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: theme.spacing.sm },
  quarter: { color: theme.colors.text.inverse, fontWeight: "700" },
  badge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 },
  greenBadge: { backgroundColor: theme.colors.brand.primary },
  goldBadge: { backgroundColor: theme.colors.brand.accent },
  badgeText: { color: theme.colors.text.inverse, fontSize: 11, fontWeight: "700" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaText: { color: theme.colors.text.muted, fontSize: 13 },
  abstractPreview: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
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
