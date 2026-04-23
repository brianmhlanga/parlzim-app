import { useEffect, useMemo, useState } from "react";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Card, Screen } from "../../src/components/ui/Screen";
import { AppTitle, BodyText, MutedText, SectionTitle } from "../../src/components/ui/Primitives";
import { dataService } from "../../src/services/client";
import { MemberProfile } from "../../src/types/domain";
import { theme } from "../../src/theme/tokens";

function formatEntryType(value?: string): string {
  if (!value) return "N/A";
  return value
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function formatDate(value?: string): string {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function getDisplayName(title?: string, fullName?: string): string {
  const cleanTitle = title?.trim();
  const cleanFullName = fullName?.trim() ?? "";
  if (!cleanTitle) return cleanFullName;
  if (!cleanFullName) return cleanTitle;

  const titleLower = cleanTitle.toLowerCase();
  if (titleLower.startsWith("chief")) {
    if (/^chief\.?$/i.test(cleanTitle)) {
      return `Chief ${cleanFullName}`.trim();
    }
    if (titleLower.includes(cleanFullName.toLowerCase())) return cleanTitle;
    return `${cleanTitle} ${cleanFullName}`.trim();
  }
  const fullNameLower = cleanFullName.toLowerCase();
  if (titleLower.includes(fullNameLower)) return cleanTitle;
  return `${cleanTitle} ${cleanFullName}`.trim();
}

function InfoLine({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string }) {
  return (
    <View style={styles.infoLine}>
      <Ionicons name={icon} size={14} color={theme.colors.brand.primary} />
      <MutedText>
        {label}: {value || "N/A"}
      </MutedText>
    </View>
  );
}

function ListSection({ title, values }: { title: string; values: string[] }) {
  return (
    <Card>
      <SectionTitle>{title}</SectionTitle>
      {values.length ? (
        values.map((value) => (
          <View key={`${title}-${value}`} style={styles.listRow}>
            <Ionicons name="checkmark-circle-outline" size={14} color={theme.colors.brand.primary} />
            <BodyText>{value}</BodyText>
          </View>
        ))
      ) : (
        <MutedText>No records available.</MutedText>
      )}
    </Card>
  );
}

export default function MemberProfileScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const memberId = useMemo(() => (Array.isArray(params.id) ? params.id[0] : params.id), [params.id]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MemberProfile | null>(null);

  useEffect(() => {
    if (!memberId) return;
    let mounted = true;
    setLoading(true);
    dataService
      .getMemberProfile(memberId)
      .then((result) => {
        if (mounted) setProfile(result);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [memberId]);

  return (
    <Screen>
      <AppTitle>Member Profile</AppTitle>
      {loading ? (
        <Card>
          <BodyText>Loading profile...</BodyText>
        </Card>
      ) : !profile ? (
        <Card>
          <BodyText>Member profile not available right now.</BodyText>
        </Card>
      ) : (
        <>
          <Card>
            <View style={styles.heroWrap}>
              {profile.imageUrl ? (
                <Image source={{ uri: profile.imageUrl }} style={styles.image} />
              ) : (
                <View style={styles.initialsHero}>
                  <Text style={styles.initialsText}>{getInitials(profile.fullName)}</Text>
                </View>
              )}
            </View>
            <SectionTitle>{getDisplayName(profile.title, profile.fullName)}</SectionTitle>
            <InfoLine icon="business-outline" label="House" value={profile.chamber} />
            <InfoLine icon="pricetag-outline" label="Entry Type" value={formatEntryType(profile.entryType)} />
            <InfoLine icon="people-outline" label="Party" value={profile.party} />
            <InfoLine icon="location-outline" label="Constituency" value={profile.constituency} />
            <InfoLine icon="calendar-outline" label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
            <InfoLine icon="home-outline" label="Place of Birth" value={profile.placeOfBirth} />
            <InfoLine icon="heart-outline" label="Marital Status" value={profile.maritalStatus} />
            <InfoLine icon="flower-outline" label="Religion" value={profile.religion} />
            <InfoLine icon="mail-outline" label="Email" value={profile.email} />
            <InfoLine icon="call-outline" label="Contact Number" value={profile.contactNumber} />
          </Card>

          <Card>
            <SectionTitle>Biography</SectionTitle>
            <BodyText>{profile.biography || "No biography available."}</BodyText>
          </Card>

          <Card>
            <SectionTitle>Social Links</SectionTitle>
            <View style={styles.socialRow}>
              {profile.social.facebookUrl ? (
                <Pressable style={styles.socialBtn} onPress={() => Linking.openURL(profile.social.facebookUrl!)}>
                  <Ionicons name="logo-facebook" size={14} color={theme.colors.text.inverse} />
                  <Text style={styles.socialBtnText}>Facebook</Text>
                </Pressable>
              ) : null}
              {profile.social.linkedinUrl ? (
                <Pressable style={styles.socialBtn} onPress={() => Linking.openURL(profile.social.linkedinUrl!)}>
                  <Ionicons name="logo-linkedin" size={14} color={theme.colors.text.inverse} />
                  <Text style={styles.socialBtnText}>LinkedIn</Text>
                </Pressable>
              ) : null}
              {profile.social.twitterUrl ? (
                <Pressable style={styles.socialBtn} onPress={() => Linking.openURL(profile.social.twitterUrl!)}>
                  <Ionicons name="logo-twitter" size={14} color={theme.colors.text.inverse} />
                  <Text style={styles.socialBtnText}>Twitter</Text>
                </Pressable>
              ) : null}
              {profile.social.instagramUrl ? (
                <Pressable style={styles.socialBtn} onPress={() => Linking.openURL(profile.social.instagramUrl!)}>
                  <Ionicons name="logo-instagram" size={14} color={theme.colors.text.inverse} />
                  <Text style={styles.socialBtnText}>Instagram</Text>
                </Pressable>
              ) : null}
            </View>
            {!profile.social.facebookUrl &&
            !profile.social.linkedinUrl &&
            !profile.social.twitterUrl &&
            !profile.social.instagramUrl ? (
              <MutedText>No social links available.</MutedText>
            ) : null}
          </Card>

          <ListSection title="Committee Memberships" values={profile.committees} />
          <ListSection title="Parliament Memberships" values={profile.parliaments} />
          <ListSection title="Education" values={profile.education} />
          <ListSection title="Employment" values={profile.employment} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background.elevated,
  },
  image: { width: "100%", height: 220 },
  initialsHero: {
    width: "100%",
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.brand.primary,
  },
  initialsText: { color: theme.colors.text.inverse, fontSize: 36, fontWeight: "700" },
  infoLine: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs },
  listRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  socialRow: { flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap" },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.brand.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
  },
  socialBtnText: { color: theme.colors.text.inverse, fontSize: 12, fontWeight: "700" },
});
