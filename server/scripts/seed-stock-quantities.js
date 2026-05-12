/**
 * Script to seed stock quantities for all products
 * Assigns random stock quantity (0-10) to each product and their variations
 * 
 * Usage: npm run seed:stock
 */

import mongoose from "mongoose";
import { config } from "dotenv";
import { Product } from "../models/Product.model.js";

config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

/**
 * Generate random stock quantity between min and max
 */
function getRandomStock(min = 0, max = 10) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getPurchaseOptionsTotalStock(items = []) {
  return items.reduce((total, item) => {
    const stockQuantity = Number(item?.stockQuantity);

    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      return total;
    }

    return total + Math.trunc(stockQuantity);
  }, 0);
}

/**
 * Update product with random stock quantity and keep total stock
 * synchronized with purchaseOptionsV2 items.
 */
async function updateProductStock(product) {
  const purchaseOptionItems = Array.isArray(product?.purchaseOptionsV2?.items)
    ? product.purchaseOptionsV2.items
    : [];

  if (purchaseOptionItems.length > 0) {
    purchaseOptionItems.forEach((item) => {
      const optionStock = getRandomStock(0, 10);
      item.stockQuantity = optionStock;
      item.inStock = optionStock > 0;
    });

    const totalStock = getPurchaseOptionsTotalStock(purchaseOptionItems);

    product.stockQuantity = totalStock;
    product.inStock = totalStock > 0;
    product.markModified("purchaseOptionsV2");
    product.markModified("stockQuantity");
    product.markModified("inStock");

    return product;
  }

  const productStock = getRandomStock(0, 10);
  product.stockQuantity = productStock;
  product.inStock = productStock > 0;
  product.markModified("stockQuantity");
  product.markModified("inStock");

  return product;
}

/**
 * Main seed function
 */
async function seedStockQuantities() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n📦 Fetching all products...");
    const products = await Product.find({});
    console.log(`✅ Found ${products.length} products`);

    if (products.length === 0) {
      console.log("⚠️  No products found. Skipping...");
      await mongoose.disconnect();
      return;
    }

    console.log("\n🔄 Updating product stock quantities...");
    let updatedCount = 0;
    let variationUpdateCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const originalStock = product.stockQuantity;
      const purchaseOptionItems = Array.isArray(product?.purchaseOptionsV2?.items)
        ? product.purchaseOptionsV2.items
        : [];
      const hasV2Options = purchaseOptionItems.length > 0;

      // Update main product stock
      await updateProductStock(product);

      if (hasV2Options) {
        variationUpdateCount += purchaseOptionItems.length;
      }

      const updateData = {
        stockQuantity: product.stockQuantity,
        inStock: product.inStock,
      };

      if (hasV2Options) {
        updateData.purchaseOptionsV2 = product.purchaseOptionsV2;
      }

      await Product.updateOne(
        { _id: product._id },
        updateData
      );
      updatedCount++;

      const variationInfo = hasV2Options
        ? ` (+ ${purchaseOptionItems.length} v2 items, total=${product.stockQuantity})`
        : "";
      
      console.log(
        `${i + 1}/${products.length} - "${product.title.en}" ` +
        `Stock: ${originalStock ?? "untracked"} → ${product.stockQuantity}${variationInfo}`
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Stock seeding completed!");
    console.log(`   • Products updated: ${updatedCount}`);
    console.log(`   • Variations updated: ${variationUpdateCount}`);
    console.log("=".repeat(60) + "\n");

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error during seed:", error.message);
    process.exit(1);
  }
}

// Run the seed
seedStockQuantities();
