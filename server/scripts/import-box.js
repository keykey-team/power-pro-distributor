import { MongoClient } from "mongodb";

const MONGO_URI =
  "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

const DB_NAME = "test";
const COLLECTION_NAME = "products";

const BOXES = [
  {
    slug: "starter-box",
    price: 13.45,
    title: {
      sk: "Starter box",
      en: "Starter box",
    },
    itemsSk: [
      "FitWin Pistachio&Cream",
      "FitWin Cookies&Cream",
      "FitWin Crunch čokolád a mliečna caramel",
      "PowerPro Brisee jahoda",
      "PowerPro BigBar lieskový orech",
    ],
    itemsEn: [
      "FitWin Pistachio&Cream",
      "FitWin Cookies&Cream",
      "FitWin Crunch chocolate & milk caramel",
      "PowerPro Brisee strawberry",
      "PowerPro BigBar hazelnut",
    ],
  },
  {
    slug: "sweet-box",
    price: 13.25,
    title: {
      sk: "Sweet box",
      en: "Sweet box",
    },
    itemsSk: [
      "FitWin Caramel&Arašidy",
      "FitWin Crunch zmrzlina a slaná caramel",
      "FitWin Crunch líči a jahoda",
      "PowerPro Brisee arašidy a caramel",
      "PowerPro BigBar Mandľa",
    ],
    itemsEn: [
      "FitWin Caramel&Peanuts",
      "FitWin Crunch ice cream & salted caramel",
      "FitWin Crunch lychee & strawberry",
      "PowerPro Brisee peanuts & caramel",
      "PowerPro BigBar Almond",
    ],
  },
  {
    slug: "light-box",
    price: 9.9,
    title: {
      sk: "Light box",
      en: "Light box",
    },
    itemsSk: [
      "PowerPro Vegan Bar",
      "PowerPro Coconut Bar",
      "PowerPro Coconut Bar s Chia",
      "PowerPro Paste Bar Sezam",
      "PowerPro PasteBar vlašský orech",
    ],
    itemsEn: [
      "PowerPro Vegan Bar",
      "PowerPro Coconut Bar",
      "PowerPro Coconut Bar with Chia",
      "PowerPro Paste Bar Sesame",
      "PowerPro PasteBar Walnut",
    ],
  },
  {
    slug: "nut-box",
    price: 13.65,
    title: {
      sk: "Nut box",
      en: "Nut box",
    },
    itemsSk: [
      "PowerPro Makadamia",
      "PowerPro Orechy",
      "PowerPro Paste Bar mandľa",
      "PowerPro BigBar Pistacia",
      "FitWin Caramel&Arašidy",
    ],
    itemsEn: [
      "PowerPro Macadamia",
      "PowerPro Nuts",
      "PowerPro Paste Bar Almond",
      "PowerPro BigBar Pistachio",
      "FitWin Caramel&Peanuts",
    ],
  },
  {
    slug: "protein-box",
    price: 27.1,
    title: {
      sk: "Protein box",
      en: "Protein box",
    },
    itemsSk: [
      "FitWin Pistachio&Cream",
      "FitWin Cookies&Cream",
      "FitWin Caramel&Arašidy",
      "PowerPro Makadamia",
      "PowerPro Orechy",
      "PowerPro Vegan Bar",
      "PowerPro Paste Bar Mandľa",
      "PowerPro PasteBar Sezam",
      "PowerPro BigBar Pistacia",
      "PowerPro BigBar Lieskovy orech",
    ],
    itemsEn: [
      "FitWin Pistachio&Cream",
      "FitWin Cookies&Cream",
      "FitWin Caramel&Peanuts",
      "PowerPro Macadamia",
      "PowerPro Nuts",
      "PowerPro Vegan Bar",
      "PowerPro Paste Bar Almond",
      "PowerPro PasteBar Sesame",
      "PowerPro BigBar Pistachio",
      "PowerPro BigBar Hazelnut",
    ],
  },
  {
    slug: "dessert-box",
    price: 28.05,
    title: {
      sk: "Dessert box",
      en: "Dessert box",
    },
    itemsSk: [
      "FitWin Cookies&Cream",
      "FitWin Crunch čokoláda a mliečna caramel",
      "FitWin Crunch zmrzlina a slaná caramel",
      "FitWin Caramel&Arašidy",
      "PowerPro Brisee Kokos",
      "PowerPro Brisee Jahoda",
      "PowerPro Brisee Višna",
      "PowerPro Big Bar Pistacia",
      "PowerPro Big Bar Mandľa",
      "PowerPro Big Bar Lieskovy Orech",
    ],
    itemsEn: [
      "FitWin Cookies&Cream",
      "FitWin Crunch chocolate & milk caramel",
      "FitWin Crunch ice cream & salted caramel",
      "FitWin Caramel&Peanuts",
      "PowerPro Brisee Coconut",
      "PowerPro Brisee Strawberry",
      "PowerPro Brisee Sour Cherry",
      "PowerPro Big Bar Pistachio",
      "PowerPro Big Bar Almond",
      "PowerPro Big Bar Hazelnut",
    ],
  },
];

function buildDescription(title, items, lang) {
  const heading = lang === "sk" ? "Obsah balenia:" : "Box contents:";
  const list = items.map((item) => `• ${item}`).join("\n");
  return `${title}\n\n${heading}\n${list}`;
}

function buildSubtitle(title, items, lang) {
  const countLabel = lang === "sk" ? "batonikov" : "bars";
  return `${title}, ${items.length} ${countLabel}`;
}

function buildProduct(box) {
  const now = new Date();

  return {
    slug: box.slug,

    title: {
      ua: "",
      ru: "",
      sk: box.title.sk,
      en: box.title.en,
    },

    subtitle: {
      ua: "",
      ru: "",
      sk: buildSubtitle(box.title.sk, box.itemsSk, "sk"),
      en: buildSubtitle(box.title.en, box.itemsEn, "en"),
    },

    description: {
      ua: "",
      ru: "",
      sk: buildDescription(box.title.sk, box.itemsSk, "sk"),
      en: buildDescription(box.title.en, box.itemsEn, "en"),
    },

    seoTitle: {
      ua: "",
      ru: "",
      sk: box.title.sk,
      en: box.title.en,
    },

    seoDescription: {
      ua: "",
      ru: "",
      sk: `Box s výberom produktov: ${box.itemsSk.join(", ")}`,
      en: `Box with selected products: ${box.itemsEn.join(", ")}`,
    },

    features: {
      ua: [],
      ru: [],
      sk: [],
      en: [],
    },

    ingredients: {
      ua: "",
      ru: "",
      sk: "",
      en: "",
    },

    brand: {
      title: {
        sk: "powerpro",
        en: "powerpro",
      },
    },

    currency: "EUR",
    price: box.price,
    oldPrice: null,

    isActive: true,
    inStock: true,
    isBar: false,
    type: "box",

    purchaseOptions: {
      unit: {
        enabled: true,
        price: box.price,
      },
    },

    updatedAt: now,
  };
}

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    for (const box of BOXES) {
      const product = buildProduct(box);

      const result = await collection.updateOne(
        { slug: box.slug },
        {
          $set: product,
          $setOnInsert: {
            createdAt: new Date(),
            cover: "https://fitwin-powerpro.com//ftp/IMG_4512.webp",
            gallery: ['https://fitwin-powerpro.com//ftp/IMG_4512.webp', 'https://fitwin-powerpro.com//ftp/IMG_4513.webp'],
            cardBadges: [],
            nutritionTable: {
              title: {
                ua: "",
                ru: "",
                sk: "",
                en: "",
              },
              columns: [],
              rows: [],
            },
            sort: 999,
            weightG: null,
            proteinG: null,
          },
        },
        { upsert: true }
      );

      console.log(
        `[${box.slug}] matched=${result.matchedCount} modified=${result.modifiedCount} upserted=${result.upsertedCount}`
      );
    }

    console.log("Готово.");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Ошибка:", error);
  process.exit(1);
});