import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppTitle, BodyText, MutedText, SectionTitle } from "../../src/components/ui/Primitives";
import { Card, Screen } from "../../src/components/ui/Screen";
import { dataService } from "../../src/services/client";
import { CommitteeDetail } from "../../src/types/domain";
import { theme } from "../../src/theme/tokens";

function formatType(value?: string): string {
  if (value === "PORTFOLIO") return "Portfolio";
  if (value === "THEMATIC") return "Thematic";
  return "Committee";
}

export default function CommitteeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<CommitteeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const title = useMemo(() => "Committee Details", []);

  useEffect(() => {
    let mounted = true;
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    dataService
      .getCommitteeDetail(String(id))
      .then((result) => {
        if (!mounted) return;
        setItem(result);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <Screen>
      <AppTitle>{title}</AppTitle>
      {loading ? (
        <Card>
          <BodyText>Loading committee details...</BodyText>
        </Card>
      ) : !item ? (
        <Card>
          <BodyText>Committee details are not available right now.</BodyText>
        </Card>
      ) : (
        <>
          <Card>
            <SectionTitle>{item.name}</SectionTitle>
            <MutedText>{formatType(item.type)}</MutedText>
            <BodyText>{item.description}</BodyText>
            <View style={styles.metaRow}>
              <MutedText>Members: {item.memberCount}</MutedText>
              {item.updatedAt ? <MutedText>Updated: {item.updatedAt}</MutedText> : null}
            </View>
          </Card>

          <Card>
            <SectionTitle>Members</SectionTitle>
            {item.members.length === 0 ? (
              <BodyText>No committee members found.</BodyText>
            ) : (
              <View style={styles.memberList}>
                {item.members.map((member) => (
                  <View key={member.id} style={styles.memberRow}>
                    <Ionicons name="person-circle-outline" size={18} color={theme.colors.brand.primary} />
                    <View style={styles.memberMeta}>
                      <BodyText>{member.name}</BodyText>
                      <MutedText>
                        {member.role || "Member"}
                        {member.house ? ` | ${member.house === "SENATE" ? "Senate" : "National Assembly"}` : ""}
                      </MutedText>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    marginTop: theme.spacing.xs,
    gap: 4,
  },
  memberList: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  memberMeta: {
    flex: 1,
  },
});
