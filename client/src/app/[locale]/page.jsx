import { getMessages } from "@shared/i18n/getMessages";
import { createI18nServer } from "@shared/i18n/server";
import { Partners } from "@widgets/Partners/ui/Partners";
import { Preview } from "@widgets/Preview/ui/Preview";

export default async function HomePage({ params }) {
  const { locale = "ua" } = await params;
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);

  return <>
    <Preview locale={locale} />
    <Partners locale={locale} />
  </>;
}
