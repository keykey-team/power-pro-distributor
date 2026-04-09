import mongoose from "mongoose";
import { Product } from "../models/Product.model.js";

const uri =
  "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

async function seedSportJamMultiFlavor() {
  try {
    await mongoose.connect(uri);

    const unitPrice = 0; // подставь цену
    const productData = {
      slug: "sport-jam",
      currency: "EUR",
      isActive: true,
      inStock: true,
      isBar: false,

      cover: "",
      gallery: [],

      price: unitPrice,
      oldPrice: null,
      sort: 0,

      weightG: null,
      proteinG: 0,

      brand: {
        title: {
          ua: "",
          ru: "",
          en: "powerpro",
          sk: "powerpro",
        },
      },

      title: {
        ua: "",
        ru: "",
        en: "Jam for sports nutrition",
        sk: "Džem pre športovú výživu",
      },

      subtitle: {
        ua: "",
        ru: "",
        en: "Contains sweetener",
        sk: "Obsahuje sladidlo",
      },

      description: {
        ua: "",
        ru: "",
        en: "Jam for sports nutrition. Contains sweetener.",
        sk: "Džem pre športovú výživu. Obsahuje sladidlo.",
      },

      ingredients: {
        ua: "",
        ru: "",
        en: "Ingredients: treated drinking water, thickener – modified starch, apple juice concentrate, acidity regulator – malic acid (E296), carnitine – 0.1 g / 100 g, sweetener – sucralose (E955), flavouring according to flavour on the package, natural colour (E150a).",
        sk: "Zloženie: pitná upravená voda, zahusťovadlo – modifikovaný škrob, koncentrát jablkovej šťavy, regulátor kyslosti – kyselina jablčná (E296), karnitín – 0,1 g / 100 g, sladidlo – sukralóza (E955), aróma podľa príchute na obale, prírodné farbivo (E150a).",
      },

      features: {
        ua: [],
        ru: [],
        en: [
          "No added sugar",
          "Suitable for people who monitor their diet or limit sweet intake",
          "Universal use",
          "Ideal for breakfasts, snacks, fitness desserts, baking or porridge",
          "Practical use",
          "Does not leak, easy to carry and store",
          "Long-lasting feeling of satiety",
          "Helps maintain a stable energy level throughout the day",
          "Alternative to traditional sweets",
          "Lets you enjoy your favourite flavour without unnecessary sugar",
        ],
        sk: [
          "Bez pridaného cukru",
          "Vhodné pre tých, ktorí si kontrolujú stravu alebo obmedzujú príjem sladkého",
          "Univerzálne použitie",
          "Ideálne na raňajky, desiaty, fitness dezerty, pečenie či kaše",
          "Praktické používanie",
          "Netečie, ľahko sa prenáša a jednoducho skladuje",
          "Dlhodobý pocit sýtosti",
          "Pomáha udržiavať stabilnú hladinu energie počas dňa",
          "Alternatíva k tradičným sladkostiam",
          "Umožňuje vychutnať si obľúbenú chuť bez zbytočného cukru",
        ],
      },

      cardBadges: [
        {
          key: "sugar",
          label: {
            ua: "",
            ru: "",
            en: "Sugar",
            sk: "Cukry",
          },
          valueNumber: 0,
          valueText: "",
          unit: "g",
          display: "value",
          sort: 1,
          isHighlighted: false,
        },
        {
          key: "protein",
          label: {
            ua: "",
            ru: "",
            en: "Proteins",
            sk: "Bielkoviny",
          },
          valueNumber: 0,
          valueText: "",
          unit: "g",
          display: "value",
          sort: 2,
          isHighlighted: false,
        },
        {
          key: "kcal",
          label: {
            ua: "",
            ru: "",
            en: "Calories",
            sk: "Kalórie",
          },
          valueNumber: 0,
          valueText: "",
          unit: "kcal",
          display: "value",
          sort: 3,
          isHighlighted: false,
        },
      ],

      nutritionTable: {
        title: {
          ua: "",
          ru: "",
          en: "Nutritional information",
          sk: "Výživové údaje",
        },
        columns: [
          {
            key: "per_100g",
            label: {
              ua: "",
              ru: "",
              en: "per 100 g",
              sk: "na 100 g",
            },
            meta: { grams: 100 },
            sort: 1,
          },
        ],
        rows: [
          {
            key: "energy",
            label: {
              ua: "",
              ru: "",
              en: "Energy",
              sk: "Energia",
            },
            values: {
              per_100g: {
                value: null,
                text: "0 kJ",
                unit: "",
              },
            },
            sort: 1,
          },
          {
            key: "carbs",
            label: {
              ua: "",
              ru: "",
              en: "Carbohydrates",
              sk: "Sacharidy",
            },
            values: {
              per_100g: {
                value: 0.5,
                text: "0.5 g",
                unit: "g",
              },
            },
            sort: 2,
          },
          {
            key: "protein",
            label: {
              ua: "",
              ru: "",
              en: "Proteins",
              sk: "Bielkoviny",
            },
            values: {
              per_100g: {
                value: 0,
                text: "0 g",
                unit: "g",
              },
            },
            sort: 3,
          },
          {
            key: "fat",
            label: {
              ua: "",
              ru: "",
              en: "Fats",
              sk: "Tuky",
            },
            values: {
              per_100g: {
                value: 0,
                text: "0 g",
                unit: "g",
              },
            },
            sort: 4,
          },
          {
            key: "sugars",
            label: {
              ua: "",
              ru: "",
              en: "of which sugars",
              sk: "z toho cukry",
            },
            values: {
              per_100g: {
                value: 0,
                text: "0 g",
                unit: "g",
              },
            },
            sort: 5,
          },
        ],
      },

      seoTitle: {
        ua: "",
        ru: "",
        en: "",
        sk: "",
      },

      seoDescription: {
        ua: "",
        ru: "",
        en: "",
        sk: "",
      },

      // Старый формат: без вариаций
      purchaseOptions: {
        unit: {
          enabled: true,
          price: unitPrice,
        },
        box: {
          enabled: false,
          price: null,
          quantity: null,
        },
        defaultMode: "unit",
      },

      // Новый формат: 5 unit-вариаций по вкусам
      purchaseOptionsV2: {
        items: [
          {
            key: "malina-s-vitaminom-c",
            title: {
              ua: "",
              ru: "",
              en: "Raspberry with vitamin C",
              sk: "Malina s vitamínom C",
            },
            enabled: true,
            price: unitPrice,
            quantity: 1,
            mode: "unit",
            sort: 1,
          },
          {
            key: "jahoda",
            title: {
              ua: "",
              ru: "",
              en: "Strawberry",
              sk: "Jahoda",
            },
            enabled: true,
            price: unitPrice,
            quantity: 1,
            mode: "unit",
            sort: 2,
          },
          {
            key: "stavnaty-pomaranc",
            title: {
              ua: "",
              ru: "",
              en: "Juicy orange",
              sk: "Šťavnatý pomaranč",
            },
            enabled: true,
            price: unitPrice,
            quantity: 1,
            mode: "unit",
            sort: 3,
          },
          {
            key: "lesne-ovocie",
            title: {
              ua: "",
              ru: "",
              en: "Forest fruit",
              sk: "Lesné ovocie",
            },
            enabled: true,
            price: unitPrice,
            quantity: 1,
            mode: "unit",
            sort: 4,
          },
          {
            key: "visna",
            title: {
              ua: "",
              ru: "",
              en: "Cherry",
              sk: "Višňa",
            },
            enabled: true,
            price: unitPrice,
            quantity: 1,
            mode: "unit",
            sort: 5,
          },
        ],
        defaultKey: "malina-s-vitaminom-c",
      },
    };

    const result = await Product.findOneAndUpdate(
      { slug: productData.slug },
      { $set: productData },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    console.log("Product saved:", result.slug);
  } catch (error) {
    console.error("Error seeding product:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedSportJamMultiFlavor();