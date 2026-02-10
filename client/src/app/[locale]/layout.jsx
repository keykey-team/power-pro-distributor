import { getMessages } from "@shared/i18n/getMessages";
import { notFound } from "next/navigation";
import { i18n } from "@shared/i18n/config";
import Providers from "@shared/providers";
import "../style/globals.scss";
import { Header } from "@widgets/header/ui/Header";
import { inter, unbounded } from "@shared/ui/styles/font";


export default async function LocaleLayout({ children, params }) {
  const { locale = "ua" } = await params;

  if (!i18n.locales.includes(locale)) {
    notFound();
  }

  // Загружаем сообщения
  const messages = await getMessages(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${unbounded.variable}`} // Добавляем переменные шрифтов
    >
      <body className={inter.className}> {/* Устанавливаем Inter как основной шрифт */}
        <Providers locale={locale} messages={messages}>
          <div className="layout">
            <Header locale={locale} />
            <main className="main">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}