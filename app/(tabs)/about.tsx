import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppTitle, BodyText, MutedText, SectionTitle } from "../../src/components/ui/Primitives";
import { Card, Screen } from "../../src/components/ui/Screen";
import { theme } from "../../src/theme/tokens";

type AboutTopic = {
  key: string;
  title: string;
  websiteUrl: string;
  wpSlug: string;
};

type WpPage = {
  slug?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  link?: string;
};

type LoadedTopic = {
  key: string;
  title: string;
  body: string;
  websiteUrl: string;
};

const WORDPRESS_BASE = "https://www.parlzim.gov.zw/wp-json/wp/v2/pages";

const aboutTopics: AboutTopic[] = [
  {
    key: "roles-functions",
    title: "Roles and Functions of Parliament",
    websiteUrl: "https://www.parlzim.gov.zw/roles-functions-of-parliament/",
    wpSlug: "roles-functions-of-parliament",
  },
  {
    key: "history",
    title: "History of Parliament",
    websiteUrl: "https://www.parlzim.gov.zw/history-of-parliament/",
    wpSlug: "history-of-parliament",
  },
  {
    key: "reforms",
    title: "Our Reforms",
    websiteUrl: "https://www.parlzim.gov.zw/our-reforms/",
    wpSlug: "our-reforms",
  },
  {
    key: "constitution",
    title: "The Constitution",
    websiteUrl: "https://www.parlzim.gov.zw/constitution-of-zimbabwe/",
    wpSlug: "constitution-of-zimbabwe",
  },
  {
    key: "visitors",
    title: "Visitors of Parliament",
    websiteUrl: "https://www.parlzim.gov.zw/visitors-of-parliament/",
    wpSlug: "visitors-of-parliament",
  },
  {
    key: "what-we-do",
    title: "What We Do",
    websiteUrl: "https://www.parlzim.gov.zw/what-we-do/",
    wpSlug: "what-we-do",
  },
  {
    key: "structure",
    title: "Our Structure",
    websiteUrl: "https://www.parlzim.gov.zw/our-structure/",
    wpSlug: "our-structure",
  },
  {
    key: "gallery",
    title: "Photo Gallery",
    websiteUrl: "https://www.parlzim.gov.zw/photo-gallery/",
    wpSlug: "photo-gallery",
  },
  {
    key: "faqs",
    title: "FAQs",
    websiteUrl: "https://www.parlzim.gov.zw/faqs/",
    wpSlug: "faqs",
  },
];

function toPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#038;|&#38;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeTitle(value: string): string {
  return value
    .replace(/&#038;|&#38;|&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function extractSlugFromUrl(url: string): string {
  const clean = url.replace(/\/+$/, "");
  const parts = clean.split("/");
  return parts[parts.length - 1] || "";
}

async function loadTopic(topic: AboutTopic): Promise<LoadedTopic> {
  const fallbackSlug = extractSlugFromUrl(topic.websiteUrl);
  const slugCandidates = Array.from(new Set([topic.wpSlug, fallbackSlug].filter(Boolean)));
  const fields = "_fields=slug,title,content,link";
  let first: WpPage | undefined;

  for (const slug of slugCandidates) {
    const response = await fetch(`${WORDPRESS_BASE}?slug=${encodeURIComponent(slug)}&${fields}`);
    if (!response.ok) continue;
    const payload = (await response.json()) as WpPage[];
    if (payload?.[0]) {
      first = payload[0];
      break;
    }
  }

  if (!first) {
    // Last fallback: query by the search phrase from title.
    const response = await fetch(`${WORDPRESS_BASE}?search=${encodeURIComponent(topic.title)}&per_page=1&${fields}`);
    if (response.ok) {
      const payload = (await response.json()) as WpPage[];
      first = payload?.[0];
    }
  }

  if (!first) {
    return {
      key: topic.key,
      title: topic.title,
      body: "Content is not yet available in WordPress JSON for this page.",
      websiteUrl: topic.websiteUrl,
    };
  }
  const title = decodeTitle(first.title?.rendered?.trim() || topic.title);
  const body = toPlainText(first.content?.rendered || "");
  return {
    key: topic.key,
    title,
    body: body || "No summary content was returned for this page.",
    websiteUrl: first.link || topic.websiteUrl,
  };
}

export default function AboutScreen() {
  const [items, setItems] = useState<LoadedTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState(aboutTopics[0].key);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all(aboutTopics.map((topic) => loadTopic(topic).catch(() => ({
      key: topic.key,
      title: topic.title,
      body: "Unable to load this section right now. Tap View Page to open it directly.",
      websiteUrl: topic.websiteUrl,
    }))))
      .then((result) => {
        if (!mounted) return;
        setItems(result);
        if (result.length > 0) setActiveKey(result[0].key);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const activeItem = useMemo(() => items.find((item) => item.key === activeKey) ?? items[0], [activeKey, items]);

  return (
    <Screen>
      <AppTitle>About Parliament</AppTitle>
      <Card>
        <BodyText>
          Explore Parliament background information, constitutional context, reforms, structure, and visitor guidance.
        </BodyText>
      </Card>

      <Card>
        <SectionTitle>Browse Sections</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsWrap}>
          {aboutTopics.map((topic) => {
            const isActive = topic.key === activeKey;
            return (
              <Pressable
                key={topic.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveKey(topic.key)}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{topic.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Card>

      {loading ? (
        <Card>
          <View style={styles.loaderRow}>
            <ActivityIndicator color={theme.colors.brand.primary} />
            <MutedText>Loading About Parliament sections...</MutedText>
          </View>
        </Card>
      ) : activeItem ? (
        <Card key={activeItem.key}>
          <SectionTitle>{activeItem.title}</SectionTitle>
          <Text style={styles.previewText}>{activeItem.body}</Text>
          <Pressable style={styles.actionButton} onPress={() => Linking.openURL(activeItem.websiteUrl)}>
            <Ionicons name="open-outline" size={15} color={theme.colors.text.inverse} />
            <Text style={styles.actionButtonText}>View Page</Text>
          </Pressable>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  tabsWrap: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
  },
  tab: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
  },
  tabActive: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: "#e8f6ee",
  },
  tabLabel: {
    color: theme.colors.text.secondary,
    fontWeight: "600",
    fontSize: 12,
  },
  tabLabelActive: {
    color: theme.colors.brand.primary,
    fontWeight: "700",
  },
  previewText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  actionButton: {
    marginTop: theme.spacing.sm,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brand.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: "700",
  },
});
