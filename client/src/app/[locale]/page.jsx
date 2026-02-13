import OrderForm from "@features/OrderForm/ui/OrderForm";
import { getMessages } from "@shared/i18n/getMessages";
import { createI18nServer } from "@shared/i18n/server";
import { Partners } from "@widgets/Partners/ui/Partners";
import { Preview } from "@widgets/Preview/ui/Preview";
import { Products } from "@widgets/Products/ui/Products";

import Ticker from "@widgets/Ticker/ui/Ticker";

export default async function HomePage({ params }) {
  const { locale = "ua" } = await params;
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);

  return <>
    <Preview locale={locale} />
    <Partners locale={locale} />
    <Ticker locale={locale} />
    <Products locale={locale} />
    <OrderForm />
  </>;
}
