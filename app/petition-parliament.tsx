import { Card, Screen } from "../src/components/ui/Screen";
import { AppTitle, BodyText, SectionTitle } from "../src/components/ui/Primitives";

export default function PetitionParliamentScreen() {
  return (
    <Screen>
      <AppTitle>Petition Parliament</AppTitle>
      <Card>
        <SectionTitle>Citizen Petitions</SectionTitle>
        <BodyText>Petition submission guidance, criteria, and tracking will be available in this section.</BodyText>
      </Card>
    </Screen>
  );
}
