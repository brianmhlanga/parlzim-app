import { useEffect, useState } from "react";
import { Card, Screen } from "../../src/components/ui/Screen";
import { AppTitle, BodyText, MutedText } from "../../src/components/ui/Primitives";
import { NewsItem } from "../../src/types/domain";
import { dataService } from "../../src/services/client";

export default function NewsScreen() {
  const [data, setData] = useState<NewsItem[]>([]);

  useEffect(() => {
    dataService.getNews().then(setData);
  }, []);

  return (
    <Screen>
      <AppTitle>News & Announcements</AppTitle>
      {data.length === 0 ? (
        <Card>
          <BodyText>Loading updates...</BodyText>
        </Card>
      ) : (
        data.map((item) => (
          <Card key={item.id}>
            <BodyText>{item.title}</BodyText>
            <MutedText>{item.date} - {item.category}</MutedText>
            <BodyText>{item.excerpt}</BodyText>
          </Card>
        ))
      )}
    </Screen>
  );
}
