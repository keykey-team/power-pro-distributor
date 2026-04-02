// app/[locale]/page.tsx
import { getMessages } from "@shared/i18n/getMessages";
import { createI18nServer } from "@shared/i18n/server";
import { getAllProducts } from "@shared/services/productsServices";
import OrderForm from "@features/OrderForm/ui/OrderForm";
import { Partners } from "@widgets/Partners/ui/Partners";
import { Preview } from "@widgets/Preview/ui/Preview";
import { Products } from "@widgets/Products/ui/Products";
import Ticker from "@widgets/Ticker/ui/Ticker";
import OrderConfirm from "@features/OrderForm/OrderConfirm";
import FallingBackground from "@shared/ui/FallingBackground";

// Метаданные для разных языков
const metadataByLocale = {
  ua: {
    title: "SportNutrition – офіційний дистриб'ютор спортивного харчування",
    description:
      "Протеїнові батончики з чистим складом та високим вмістом білка. Бренди: PowerPro, FitWin. Здорові снеки без цукру. Швидка доставка по всій Україні.",
    keywords:
      "протеїнові батончики, спортивне харчування, SportNutrition, PowerPro, FitWin, здорові снеки, без цукру, купити в Україні",
  },
  ru: {
    title: "SportNutrition – официальный дистрибьютор спортивного питания",
    description:
      "Лидер на украинском рынке спортивного питания с 2013 года. Протеиновые батончики с чистым составом и высоким содержанием белка. Бренды: PowerPro, FitWin. Здоровые снэки без сахара. Быстрая доставка по всей Украине.",
    keywords:
      "протеиновые батончики, спортивное питание, SportNutrition, PowerPro, FitWin, здоровые снэки, без сахара, купить в Украине",
  },
  sk: {
    title: "SportNutrition – oficiálny distribútor športovej výživy",
    description:
      "Proteínové tyčinky s čistým zložením a vysokým obsahom bielkovín. Značky: PowerPro, FitWin. Zdravé snacky bez cukru. Rýchle doručenie po celej Ukrajine.",
    keywords:
      "proteínové tyčinky, športová výživa, SportNutrition, PowerPro, FitWin, zdravé snacky, bez cukru, kúpiť na Ukrajine",
  },
};

// Генерация метаданных на основе локали
export async function generateMetadata({ params }) {
  const { locale = "ua" } = await params;
  const meta = metadataByLocale[locale] || metadataByLocale.ua;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fitwin-powerpro.com";

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    metadataBase: new URL(baseUrl),
    icons: {
      icon: '/img/google.ico',

    },
    alternates: {
      canonical: locale === "ua" ? "/" : `/${locale}`,
      languages: {
        "uk": "/",
        "ru": "/ru",
        "sk": "/sk",
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: locale === "ua" ? baseUrl : `${baseUrl}/${locale}`,
      siteName: "SportNutrition",
      images: [
        {
          url: 'https://fitwin-powerpro.com/img/google.png', // <-- заменено/добавлено
          width: 1200,
          height: 630,
          alt: "SportNutrition - športová výživa",
        },
      ],
      locale: locale === "ua" ? "uk_UA" : locale === "ru" ? "ru_RU" : "sk_SK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/twitter-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function HomePage({ params }) {
  const { locale = "ua" } = await params;
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);
  const data = await getAllProducts();


  return (
    <>
      <FallingBackground />
      <OrderConfirm locale={"home"} title1={"OBJEDNÁVKA "} title2={"PRIJATÁ!"} subtitle={"Platba bola úspešne spracovaná. Začíname balenie vašej objednávky. Sledujte svoj e-mail, kde nájdete podrobné informácie o doručení."} />
      <Preview locale={locale} />
      <Partners locale={locale} />
      <Ticker locale={locale} />
      <Products locale={locale} data={data} />
      <OrderForm />
    </>
  );
}