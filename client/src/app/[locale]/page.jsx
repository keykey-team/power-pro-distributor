import { getMessages } from "@shared/i18n/getMessages";
import { createI18nServer } from "@shared/i18n/server";

export default async function HomePage({ params }) {
  const { locale = "ua" } = await params;
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);

  return <div>hello</div>;
}
