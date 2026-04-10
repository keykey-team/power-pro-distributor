// app/[locale]/box/page.tsx

import OrderConfirm from "@features/OrderForm/OrderConfirm";
import { getMessages } from "@shared/i18n/getMessages";
import { createI18nServer } from "@shared/i18n/server";
import { getAllProducts } from "@shared/services/productsServices";
import FallingBackground from "@shared/ui/FallingBackground";
import OrderForm from "@widgets/Order/OrderForm/ui/OrderForm";
import OrderFunc from "@widgets/Order/OrderFunc/ui/OrderFunc";
import OrderWrapper from "@widgets/OrderWrapper/ui/OrderWrapper";







export default async function BoxPage({ params }) {
  const { locale = "ua" } = await params;
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);




  return (

    <OrderWrapper />

  );
}