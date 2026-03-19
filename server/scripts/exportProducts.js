import { MongoClient } from "mongodb";
import XLSX from "xlsx";

// 👉 URI
const MONGO_URI =
  "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

// 👉 если знаешь — укажи
const DB_NAME = "test"; // например "powerpro"
const COLLECTION_NAME = "products"; // например "products"

const PREFERRED_LANG = "sk";

function getTitle(doc) {
  if (doc.title) {
    if (doc.title[PREFERRED_LANG]) return doc.title[PREFERRED_LANG];

    for (const lang of ["ua", "ru", "en", "sk"]) {
      if (doc.title[lang]) return doc.title[lang];
    }

    const any = Object.values(doc.title).find(Boolean);
    if (any) return any;
  }

  if (doc.subtitle) {
    if (doc.subtitle[PREFERRED_LANG]) return doc.subtitle[PREFERRED_LANG];

    for (const lang of ["ua", "ru", "en", "sk"]) {
      if (doc.subtitle[lang]) return doc.subtitle[lang];
    }
  }

  return doc.slug || "Без назви";
}

async function run() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    // 👉 выбор БД
    let dbName = DB_NAME;

    if (!dbName) {
      const admin = client.db().admin();
      const dbs = await admin.listDatabases();

      const filtered = dbs.databases
        .map((d) => d.name)
        .filter((n) => !["admin", "local", "config"].includes(n));

      if (filtered.length === 1) {
        dbName = filtered[0];
      } else {
        console.log("❗ Укажи DB_NAME вручную");
        console.log("Доступные БД:", filtered);
        return;
      }
    }

    const db = client.db(dbName);

    // 👉 выбор коллекции
    let collectionName = COLLECTION_NAME;

    if (!collectionName) {
      const collections = await db.listCollections().toArray();
      const names = collections.map((c) => c.name);

      const preferred = ["products", "product", "items", "catalog"];

      collectionName =
        preferred.find((p) => names.includes(p)) || names[0];

      console.log("📦 Используем коллекцию:", collectionName);
    }

    const collection = db.collection(collectionName);

    const products = await collection
      .find({}, { projection: { title: 1, subtitle: 1, slug: 1 } })
      .toArray();

    console.log(`📊 Найдено товаров: ${products.length}`);

    const data = products.map((doc) => ({
      "Назва товару": getTitle(doc),
      "Ціна": "", // 👈 пусто
    }));

    // 👉 Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Товари");

    XLSX.writeFile(workbook, "products.xlsx");

    console.log("✅ Excel создан: products.xlsx");
  } catch (e) {
    console.error("❌ Ошибка:", e);
  } finally {
    await client.close();
  }
}

run();