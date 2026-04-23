import { Card, Screen } from "../src/components/ui/Screen";
import { AppTitle, BodyText, SectionTitle } from "../src/components/ui/Primitives";

export default function VacanciesScreen() {
  return (
    <Screen>
      <AppTitle>Vacancies</AppTitle>
      <Card>
        <SectionTitle>Opportunities</SectionTitle>
        <BodyText>Current parliamentary vacancies, role requirements, and application timelines will be displayed here.</BodyText>
      </Card>
    </Screen>
  );
}
