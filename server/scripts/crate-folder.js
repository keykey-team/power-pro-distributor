// create-folders.mjs
import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* =========================
   НАСТРОЙКИ (вставь свои)
========================= */

const MONGO_URI =
  "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

const DB_NAME = "test"; // <-- имя базы
const COLLECTION_NAME = "products"; // <-- имя коллекции

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, "product-folders");

/* =========================
   HELPERS
========================= */

function pickTitle(doc) {
  return (
    doc?.title?.sk?.trim() ||
    doc?.title?.ua?.trim() ||
    doc?.title?.ru?.trim() ||
    doc?.title?.en?.trim() ||
    doc?.slug?.trim() ||
    String(doc?._id)
  );
}

function sanitize(name) {
  let n = String(name ?? "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  n = n.replace(/[.\s]+$/g, "").trim(); // windows-safe
  if (!n) n = "unnamed";
  if (n.length > 120) n = n.slice(0, 120).trim();
  return n;
}

function uniqueFolder(base, name) {
  const first = path.join(base, name);
  if (!fs.existsSync(first)) return first;

  let i = 2;
  while (true) {
    const next = path.join(base, `${name}__${i}`);
    if (!fs.existsSync(next)) return next;
    i++;
  }
}

/* =========================
   MAIN
========================= */

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const client = new MongoClient(MONGO_URI, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 20000,
  });

  await client.connect();
  console.log("✅ Mongo connected");

  const col = client.db(DB_NAME).collection(COLLECTION_NAME);

  const cursor = col.find(
    {},
    { projection: { _id: 1, title: 1, slug: 1 } }
  );

  let total = 0;
  let created = 0;

  for await (const doc of cursor) {
    total++;

    const safeName = sanitize(pickTitle(doc));
    const folderPath = uniqueFolder(OUTPUT_DIR, safeName);

    fs.mkdirSync(folderPath, { recursive: true });
    created++;

    if (total % 200 === 0) console.log(`… обработано ${total}`);
  }

  await client.close();
  console.log("🔒 Mongo disconnected");
  console.log(`🏁 Done: total=${total}, created=${created}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
}

run().catch((e) => {
  console.error("❌ Fatal:", e);
  process.exit(1);
});