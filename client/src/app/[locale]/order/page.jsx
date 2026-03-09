// app/[locale]/box/page.tsx
import { getMessages } from "@shared/i18n/getMessages";
import { createI18nServer } from "@shared/i18n/server";
import { getAllProducts } from "@shared/services/productsServices";
import OrderForm from "@widgets/Order/OrderForm/ui/OrderForm";
import OrderFunc from "@widgets/Order/OrderFunc/ui/OrderFunc";





export default async function BoxPage({ params }) {
  const { locale = "ua" } = await params;
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);


  return (
    <>
      <section className="order-preview">
        <h1>{t("order.title1")}<b>{t("order.title2")}</b></h1>
        <p>{t("order.desc")}</p>
      </section>
      <div className="order-content">
        <OrderForm />
        <OrderFunc />
      </div>
    </>
  );
}