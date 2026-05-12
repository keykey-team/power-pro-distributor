/**
 * Script to verify stock quantities were properly seeded
 * Shows a sample of products with their stock values
 */

import mongoose from "mongoose";
import { config } from "dotenv";
import { Product } from "../models/Product.model.js";

config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

function getPurchaseOptionsTotalStock(items = []) {
  return items.reduce((total, item) => {
    const stockQuantity = Number(item?.stockQuantity);

    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      return total;
    }

    return total + Math.trunc(stockQuantity);
  }, 0);
}

async function verifyStock() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected\n");

    const products = await Product.find({}).limit(10).lean();

    console.log("📊 Sample of seeded products:\n");
    console.log("─".repeat(80));

    products.forEach((product, idx) => {
      const purchaseOptionItems = Array.isArray(product?.purchaseOptionsV2?.items)
        ? product.purchaseOptionsV2.items
        : [];
      const purchaseOptionsTotalStock = getPurchaseOptionsTotalStock(
        purchaseOptionItems
      );

      console.log(`\n${idx + 1}. ${product.title.en}`);
      console.log(
        `   Stock: ${product.stockQuantity} | In Stock: ${product.inStock}` +
        (purchaseOptionItems.length > 0
          ? ` | Sum of items: ${purchaseOptionsTotalStock}`
          : "")
      );

      if (purchaseOptionItems.length > 0) {
        console.log(`   └─ purchaseOptionsV2:`);
        purchaseOptionItems.forEach((item) => {
          console.log(
            `      • ${item.title?.en || item.key}: ` +
            `Stock=${item.stockQuantity}, InStock=${item.inStock}, Mode=${item.mode}`
          );
        });

        if (Number(product.stockQuantity) !== purchaseOptionsTotalStock) {
          console.log("      ! MISMATCH: product stock does not equal sum of items");
        }
      }
    });

    console.log("\n" + "─".repeat(80));
    console.log("✅ Stock verification completed!");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

verifyStock();
