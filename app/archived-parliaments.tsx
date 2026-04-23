import { Card, Screen } from "../src/components/ui/Screen";
import { AppTitle, BodyText, SectionTitle } from "../src/components/ui/Primitives";

export default function ArchivedParliamentsScreen() {
  return (
    <Screen>
      <AppTitle>Archived Parliaments</AppTitle>
      <Card>
        <SectionTitle>Parliament History</SectionTitle>
        <BodyText>Historic terms, key legislation, and archived records from previous parliaments will appear here.</BodyText>
      </Card>
    </Screen>
  );
}
