// app/[locale]/box/page.tsx
import { getMessages } from "@shared/i18n/getMessages";
import { createI18nServer } from "@shared/i18n/server";
import { getAllProducts } from "@shared/services/productsServices";
import BoxConfirm from "@widgets/BuildBox/BuildBoxConfirm/ui/BoxConfirm";
import BuildBoxConfirm from "@widgets/BuildBox/BuildBoxConfirm/ui/BuildBoxConfirm";
import BuildBoxFunc from "@widgets/BuildBox/BuildBoxFunc/ui/BuildBoxFunc";
import BuildBoxList from "@widgets/BuildBox/BuildBoxList/ui/BuildBoxList";

// Метаданные для разных языков
const metadataByLocale = {
  ua: {
    title: "Зібрати бокс – SportNutrition | Конструктор протеїнових наборів",
    description:
      "Створіть власний бокс з протеїновими батончиками PowerPro та FitWin. Оберіть улюблені смаки, без цукру, з високим вмістом білка. Зручна доставка по Україні.",
    keywords:
      "зібрати бокс, конструктор наборів, протеїнові батончики, PowerPro, FitWin, бокс з батончиками, замовити",
  },
  ru: {
    title: "Собрать бокс – SportNutrition | Конструктор протеиновых наборов",
    description:
      "Создайте собственный бокс с протеиновыми батончиками PowerPro и FitWin. Выберите любимые вкусы, без сахара, с высоким содержанием белка. Удобная доставка по Украине.",
    keywords:
      "собрать бокс, конструктор наборов, протеиновые батончики, PowerPro, FitWin, бокс с батончиками, заказать",
  },
  sk: {
    title: "Zostaviť box – SportNutrition | Konštruktér proteínových setov",
    description:
      "Vytvorte si vlastný box s proteínovými tyčinkami PowerPro a FitWin. Vyberte si obľúbené príchute, bez cukru, s vysokým obsahom bielkovín. Pohodlné doručenie po celej Ukrajine.",
    keywords:
      "zostaviť box, konštruktér setov, proteínové tyčinky, PowerPro, FitWin, box s tyčinkami, objednať",
  },
};

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
      icon: '/imag/google.ico', // путь к favicon
    },
    alternates: {
      canonical: locale === "ua" ? "/box" : `/${locale}/box`,
      languages: {
        uk: "/box",
        ru: "/ru/box",
        sk: "/sk/box",
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: locale === "ua" ? `${baseUrl}/box` : `${baseUrl}/${locale}/box`,
      siteName: "SportNutrition",
      images: [
        {
          url: "https://fitwin-powerpro.com/img/google.png", // замените на актуальное изображение для страницы бокса
          width: 1200,
          height: 630,
          alt: "SportNutrition",
        },
      ],
      locale: locale === "ua" ? "uk_UA" : locale === "ru" ? "ru_RU" : "sk_SK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/twitter-image.jpg"], // путь к изображению для Twitter
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

export default async function BoxPage({ params }) {
  const { locale = "ua" } = await params;
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);
  const data = await getAllProducts();

  return (
    <>
      <BoxConfirm locale={locale} />
      <BuildBoxFunc locale={locale} />
      <BuildBoxList locale={locale} data={data} />
      <BuildBoxConfirm locale={locale} products={data} />
    </>
  );
}