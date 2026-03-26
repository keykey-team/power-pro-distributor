import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/Product.model.js";

dotenv.config();

const MONGODB_URI = 'mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0'

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI or MONGO_URI is not set");
}

const PRODUCTS_TO_UPDATE = [
  {
    slug: "fitwin-pistachio-cream-60g",
    unitPrice: 2.5,
    boxPrice: 30,
    boxQuantity: 12,
  },
  {
    slug: "fitwin-cookies-cream-60g",
    unitPrice: 2.5,
    boxPrice: 30,
    boxQuantity: 12,
  },
  {
    slug: "fitwin-caramel-peanuts-60g",
    unitPrice: 2.5,
    boxPrice: 30,
    boxQuantity: 12,
  },
  {
    slug: "crunch-bar-cokolada-mliecny-karamel-50g",
    unitPrice: 2.3,
    boxPrice: 27.6,
    boxQuantity: 12,
  },
  {
    slug: "crunch-bar-lici-jahoda-50g",
    unitPrice: 2.3,
    boxPrice: 27.6,
    boxQuantity: 12,
  },
  {
    slug: "crunch-bar-zmrzlina-slany-karamel-50g",
    unitPrice: 2.3,
    boxPrice: 27.6,
    boxQuantity: 12,
  },
  {
    slug: "protein-bar-orech-60g",
    unitPrice: 2.5,
    boxPrice: 50,
    boxQuantity: 20,
  },
  {
    slug: "protein-bar-makadamia-60g",
    unitPrice: 2.5,
    boxPrice: 50,
    boxQuantity: 20,
  },
  {
    slug: "protein-bar-vegan-32-60g",
    unitPrice: 2.3,
    boxPrice: 46,
    boxQuantity: 20,
  },
  {
    slug: "paste-bar-mandlova-pasta-45g",
    unitPrice: 2.3,
    boxPrice: 27.6,
    boxQuantity: 12,
  },
  {
    slug: "paste-bar-sezamova-pasta-45g",
    unitPrice: 2.3,
    boxPrice: 27.6,
    boxQuantity: 12,
  },
  {
    slug: "paste-bar-vlasske-orechy-45g",
    unitPrice: 2.3,
    boxPrice: 27.6,
    boxQuantity: 12,
  },
  {
    slug: "coconut-bar-50g",
    unitPrice: 1.5,
    boxPrice: 30,
    boxQuantity: 20,
  },
  {
    slug: "coconut-bar-vegan-chia-50g",
    unitPrice: 1.5,
    boxPrice: 30,
    boxQuantity: 20,
  },
  {
    slug: "brisee-arasidy-v-karameli-55g",
    unitPrice: 2.3,
    boxPrice: 40,
    boxQuantity: 20,
  },
  {
    slug: "brisee-kokos-55g",
    unitPrice: 2.3,
    boxPrice: 40,
    boxQuantity: 20,
  },
  {
    slug: "brisee-jahodove-konfit-55g",
    unitPrice: 2.3,
    boxPrice: 40,
    boxQuantity: 20,
  },
  {
    slug: "brisee-visnove-konfit-55g",
    unitPrice: 2.3,
    boxPrice: 40,
    boxQuantity: 20,
  },
  {
    slug: "whey-protein-1kg",
    unitPrice: 28,
    boxPrice: null,
    boxQuantity: null,
  },
  {
    slug: "gainer-1kg",
    unitPrice: 16,
    boxPrice: null,
    boxQuantity: null,
  },
  {
    slug: "bcaa-05kg",
    unitPrice: 18,
    boxPrice: null,
    boxQuantity: null,
  },
  {
    slug: "powerpro-bigbar-pistacia-100g",
    unitPrice: 3.85,
    boxPrice: 38.5,
    boxQuantity: 10,
  },
  {
    slug: "powerpro-bigbar-mandla-100g",
    unitPrice: 3.85,
    boxPrice: 38.5,
    boxQuantity: 10,
  },
  {
    slug: "powerpro-bigbar-lieskovy-orech-100g",
    unitPrice: 3.85,
    boxPrice: 38.5,
    boxQuantity: 10,
  },
];

function buildPurchaseOptions({ unitPrice, boxPrice, boxQuantity }) {
  return {
    unit: {
      enabled: unitPrice != null,
      price: unitPrice ?? null,
    },
    box: {
      enabled: boxPrice != null && boxQuantity != null,
      price: boxPrice ?? null,
      quantity: boxQuantity ?? null,
    },
    defaultMode: "unit",
  };
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Mongo connected");

  const now = new Date();

  const operations = PRODUCTS_TO_UPDATE.map((item) => ({
    updateOne: {
      filter: { slug: item.slug },
      update: {
        $set: {
          price: item.unitPrice,
          purchaseOptions: buildPurchaseOptions(item),
          updatedAt: now,
        },
      },
    },
  }));

  const result = await Product.collection.bulkWrite(operations, {
    ordered: false,
  });

  console.log("✅ bulkWrite done");
  console.log({
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  });

  const foundDocs = await Product.collection
    .find(
      { slug: { $in: PRODUCTS_TO_UPDATE.map((x) => x.slug) } },
      { projection: { slug: 1 } }
    )
    .toArray();

  const foundSlugs = new Set(foundDocs.map((x) => x.slug));
  const notFound = PRODUCTS_TO_UPDATE
    .map((x) => x.slug)
    .filter((slug) => !foundSlugs.has(slug));

  if (notFound.length) {
    console.log("\n⚠️ Not found:");
    notFound.forEach((slug) => console.log(`- ${slug}`));
  } else {
    console.log("\n✅ All products found");
  }

  await mongoose.disconnect();
  console.log("✅ Mongo disconnected");
}

run().catch(async (err) => {
  console.error("❌ Migration failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});