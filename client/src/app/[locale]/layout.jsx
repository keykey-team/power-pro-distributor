import { getMessages } from "@shared/i18n/getMessages";
import { notFound } from "next/navigation";
import Script from "next/script";
import { i18n } from "@shared/i18n/config";
import Providers from "@shared/providers";
import "../style/globals.scss";
import { Header } from "@widgets/header/ui/Header";
import { inter, unbounded } from "@shared/ui/styles/font";
import { Footer } from "@widgets/Footer/ui/Footer";


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
      <head>
        <Script id="gtm-init" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KZBFZX6L');
          `}
        </Script>
        {/* Google Analytics 4 (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-18YDYZQW01"
          strategy="afterInteractive"
          async
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-18YDYZQW01');
            `}
        </Script>
      </head>
      <body className={inter.className}> {/* Устанавливаем Inter как основной шрифт */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KZBFZX6L"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers locale={locale} messages={messages}>
          <div className="layout">
            <Header locale={locale} />
            <main className="main">{children}</main>
            <Footer locale={locale} />
          </div>
        </Providers>
      </body>
    </html>
  );
}