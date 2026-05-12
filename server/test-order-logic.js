import mongoose from 'mongoose';
import { buildOrderPositions } from './utils/orderPositions.js';
import { Product } from './models/Product.model.js';

const MONGO_URI = "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Try finding product with at least one item
    const product = await Product.findOne({ "purchaseOptionsV2.items.0": { $exists: true } });

    if (!product) {
      console.log("No products with purchaseOptionsV2 found.");
      process.exit(0);
    }

    console.log('Testing with product: ' + product.title + ' (ID: ' + product._id + ')');

    const firstItem = product.purchaseOptionsV2.items[0];
    const firstMode = firstItem.purchaseMode || 'unit';

    console.log("\n--- Case 3: No v2Key, mode: " + firstMode + " ---");
    const payload = [{ productId: product._id, quantity: 1, purchaseMode: firstMode }];
    const [pos] = await buildOrderPositions(payload);
    console.log('Result: mode=' + pos.purchaseMode + ', v2Key=' + pos.v2Key + ', packQuantity=' + pos.packQuantity);

    console.log("\n--- Case 4: Explicit v2Key ---");
    const payloadExplicit = [{ productId: product._id, quantity: 1, v2Key: firstItem.key }];
    const [posExplicit] = await buildOrderPositions(payloadExplicit);
    console.log('Explicit: key=' + firstItem.key + ', mode=' + posExplicit.purchaseMode + ', v2Key=' + posExplicit.v2Key + ', packQuantity=' + posExplicit.packQuantity);

    console.log("\n--- Case 5: Mongo Match Check ---");
    const key = firstItem.key;
    const match = await Product.findOne({
      _id: product._id,
      "purchaseOptionsV2.items": { $elemMatch: { key, stockQuantity: { $gte: 0 } } }
    });
    console.log('Match check for key ' + key + ': ' + (match ? 'PASSED' : 'FAILED'));

    console.log("\nSummary status: ALL_CHECKS_RUN");

  } catch (err) {
    console.error("Error during validation:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
