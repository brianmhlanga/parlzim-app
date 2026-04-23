import { Card, Screen } from "../../src/components/ui/Screen";
import { AppTitle, BodyText, MutedText, SectionTitle } from "../../src/components/ui/Primitives";

export default function LiveScreen() {
  return (
    <Screen>
      <AppTitle>Live</AppTitle>
      <Card>
        <SectionTitle>Parliament Live Broadcast</SectionTitle>
        <BodyText>Live chamber broadcasts, committee sessions, and press briefings will appear here.</BodyText>
        <MutedText>Stream integration placeholder for in-house media API.</MutedText>
      </Card>
    </Screen>
  );
}
