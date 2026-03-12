import { MongoClient } from "mongodb";
import fs from "fs-extra";
import path from "path";

/* =========================
   CONFIG
========================= */
const MONGO_URI =
  "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

const DB_NAME = "test";
const COLLECTION_NAME = "products";

// ❗ Папка на локальной машине, где лежат твои папки-товары
const ROOT_DIR =
  "C:/Users/uvaro/OneDrive/Desktop/FitWin-Power distrib Photo"; // <-- поменяй

// Безопасный режим: сначала true, чтобы посмотреть отчёт
const DRY_RUN = false;

// Если папка со slug уже существует:
// "skip" = не трогать и записать конфликт
// "merge" = перенести файлы в slug-папку и удалить старую (опаснее)
const CONFLICT_MODE = "skip"; // skip | merge
/* ========================= */

const s = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));

function normName(x) {
  return s(x)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['"’`´]/g, "")
    // оставляем буквы/цифры (и кириллицу на всякий)
    .replace(/[^a-z0-9а-яёїієґ\s]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickTitleCandidates(p) {
  const t = p?.title || {};
  return [t.sk, t.en, t.ua, t.ru, p.slug]
    .map((x) => s(x).trim())
    .filter(Boolean);
}

async function listDirs(root) {
  const items = await fs.readdir(root);
  const out = [];
  for (const it of items) {
    const full = path.join(root, it);
    const st = await fs.stat(full);
    if (st.isDirectory()) out.push({ name: it, full });
  }
  return out;
}

async function mergeDirs(fromDir, toDir) {
  await fs.ensureDir(toDir);
  const items = await fs.readdir(fromDir);

  for (const it of items) {
    const src = path.join(fromDir, it);
    const dst = path.join(toDir, it);

    if (await fs.pathExists(dst)) {
      const ext = path.extname(it);
      const base = path.basename(it, ext);
      let i = 2;
      while (true) {
        const alt = path.join(toDir, `${base}__${i}${ext}`);
        if (!(await fs.pathExists(alt))) {
          await fs.move(src, alt);
          break;
        }
        i++;
      }
    } else {
      await fs.move(src, dst);
    }
  }

  await fs.remove(fromDir);
}

async function main() {
  if (!(await fs.pathExists(ROOT_DIR))) {
    throw new Error(`ROOT_DIR not found: ${ROOT_DIR}`);
  }

  console.log("🔌 Connecting to Mongo...");
  const client = new MongoClient(MONGO_URI, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 20000,
  });
  await client.connect();
  console.log("✅ Mongo connected");

  const col = client.db(DB_NAME).collection(COLLECTION_NAME);

  const products = await col
    .find({}, { projection: { _id: 1, slug: 1, title: 1 } })
    .toArray();

  await client.close();
  console.log(`📦 Products loaded: ${products.length}`);
  console.log("🔒 Mongo disconnected");

  // index: normalized title -> list of matches (на случай дублей)
  const index = new Map();
  const slugSet = new Set(products.map((p) => s(p.slug).trim()).filter(Boolean));

  for (const p of products) {
    const slug = s(p.slug).trim();
    if (!slug) continue;

    for (const c of pickTitleCandidates(p)) {
      const key = normName(c);
      if (!key) continue;
      const arr = index.get(key) || [];
      arr.push({ _id: s(p._id), slug, title: c });
      index.set(key, arr);
    }
  }

  const dirs = await listDirs(ROOT_DIR);

  const report = {
    rootDir: ROOT_DIR,
    dryRun: DRY_RUN,
    conflictMode: CONFLICT_MODE,
    processedAt: new Date().toISOString(),
    renamed: [],
    skipped: [],
    ambiguous: [],
    notFound: [],
    conflicts: [],
  };

  for (const d of dirs) {
    const original = d.name;

    // если уже slug — пропускаем
    if (slugSet.has(original)) {
      report.skipped.push({ folder: original, reason: "ALREADY_SLUG" });
      continue;
    }

    const matches = index.get(normName(original)) || [];

    if (matches.length === 0) {
      report.notFound.push({ folder: original });
      continue;
    }

    // “точно соответствовало” => только один матч
    if (matches.length > 1) {
      report.ambiguous.push({ folder: original, matches });
      continue;
    }

    const targetSlug = matches[0].slug;
    const from = d.full;
    const to = path.join(ROOT_DIR, targetSlug);

    if (await fs.pathExists(to)) {
      if (CONFLICT_MODE === "merge") {
        if (!DRY_RUN) await mergeDirs(from, to);
        report.conflicts.push({ folder: original, targetSlug, action: "MERGE" });
      } else {
        report.conflicts.push({ folder: original, targetSlug, action: "SKIP_EXISTS" });
      }
      continue;
    }

    if (!DRY_RUN) {
      await fs.move(from, to);
    }

    report.renamed.push({ from: original, to: targetSlug });
    console.log(`✅ ${original} -> ${targetSlug}`);
  }

  const reportPath = path.join(process.cwd(), `rename_report_${Date.now()}.json`);
  await fs.writeJson(reportPath, report, { spaces: 2 });

  console.log("\n====================");
  console.log(`Renamed: ${report.renamed.length}`);
  console.log(`NotFound: ${report.notFound.length}`);
  console.log(`Ambiguous: ${report.ambiguous.length}`);
  console.log(`Conflicts: ${report.conflicts.length}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((e) => {
  console.error("❌ Fatal:", e);
  process.exit(1);
});