import mongoose from "mongoose";
import { Product } from "../models/Product.model.js";

const uri =
  "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

async function migratePurchaseOptionsToV2() {
  try {
    await mongoose.connect(uri);
    console.log("Mongo connected");

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      if (product.purchaseOptionsV2?.items?.length) {
        skippedCount++;
        console.log(`Skipped: ${product.slug} (already has purchaseOptionsV2)`);
        continue;
      }

      const po = product.purchaseOptions;
      const items = [];

      if (po?.unit) {
        items.push({
          key: "unit",
          title: {
            ua: "1 шт",
            ru: "1 шт",
            en: "1 pc",
            sk: "1 ks",
          },
          enabled: po.unit.enabled ?? true,
          price: po.unit.price ?? product.price ?? null,
          quantity: 1,
          mode: "unit",
          sort: 1,
        });
      }

      if (po?.box && (po.box.enabled || po.box.price != null || po.box.quantity != null)) {
        const qty = po.box.quantity ?? 1;

        items.push({
          key: `box_${qty}`,
          title: {
            ua: `Бокс ${qty} шт`,
            ru: `Бокс ${qty} шт`,
            en: `Box ${qty} pcs`,
            sk: `Box ${qty} ks`,
          },
          enabled: po.box.enabled ?? false,
          price: po.box.price ?? null,
          quantity: qty,
          mode: "box",
          sort: 2,
        });
      }

      if (!items.length) {
        items.push({
          key: "unit",
          title: {
            ua: "1 шт",
            ru: "1 шт",
            en: "1 pc",
            sk: "1 ks",
          },
          enabled: true,
          price: product.price ?? null,
          quantity: 1,
          mode: "unit",
          sort: 1,
        });
      }

      let defaultKey = "unit";

      if (
        po?.defaultMode === "box" &&
        items.some((item) => item.mode === "box")
      ) {
        defaultKey = items.find((item) => item.mode === "box")?.key || "unit";
      }

      product.purchaseOptionsV2 = {
        items,
        defaultKey,
      };

      await product.save();

      migratedCount++;
      console.log(`Migrated: ${product.slug}`);
    }

    console.log("Migration completed");
    console.log({ migratedCount, skippedCount });
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

migratePurchaseOptionsToV2();