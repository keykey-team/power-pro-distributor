import { MongoClient } from "mongodb";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";
import sharp from "sharp";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";

/* ========== CONFIG ========== */
const MONGO_URI =
  "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

const DB_NAME = "test";
const COLLECTION_NAME = "products";

const ZIP_PATH = "./Новий Архив ZIP - WinRAR.zip";
const WORD_PATH = "./FitWin & PowerPro sk prod oznacenie.docx";

const OUTPUT_ROOT = "./sorted-by-products";
const MODE = "move"; // move | copy

// OCR: если будет медленно/падать — поставь "eng+slk"
const OCR_LANG = "eng+slk+ukr+rus";

// насколько “уверенно” матчим по якорям
const MIN_ANCHOR_HITS = 2; // минимум найденных якорей
/* ============================ */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const absZip = path.resolve(__dirname, ZIP_PATH);
const absWord = path.resolve(__dirname, WORD_PATH);
const absOut = path.resolve(__dirname, OUTPUT_ROOT);
const workDir = path.join(absOut, "__work_unzipped");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".heic"]);
const s = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));

function sanitizeFolderName(name) {
  let n = s(name)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.\s]+$/g, "");
  if (!n) n = "unnamed";
  if (n.length > 120) n = n.slice(0, 120).trim();
  return n;
}

function normalize(text) {
  return s(text)
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9а-яёїієґ\s]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isImageFile(p) {
  return IMAGE_EXTS.has(path.extname(p).toLowerCase());
}

async function listAllFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    const items = await fs.readdir(cur);
    for (const it of items) {
      const full = path.join(cur, it);
      const st = await fs.stat(full);
      if (st.isDirectory()) stack.push(full);
      else out.push(full);
    }
  }
  return out;
}

/** Предобработка для OCR: rotate + центр-кроп + контраст */
async function preprocessForOCR(imagePath) {
  const img = sharp(imagePath).rotate(); // EXIF rotate

  const meta = await img.metadata();
  const w = meta.width || 0;
  const h = meta.height || 0;

  // кроп центральной области (70% по ширине/высоте)
  const cropW = Math.floor(w * 0.7);
  const cropH = Math.floor(h * 0.7);
  const left = Math.max(0, Math.floor((w - cropW) / 2));
  const top = Math.max(0, Math.floor((h - cropH) / 2));

  const buf = await img
    .extract({ left, top, width: cropW, height: cropH })
    .resize(1400, 1400, { fit: "inside" })
    .grayscale()
    .normalise()
    .sharpen()
    .toBuffer();

  return buf;
}

async function runOCR(preprocessedBuffer) {
  const { data } = await Tesseract.recognize(preprocessedBuffer, OCR_LANG, {
    logger: () => {},
  });
  return data?.text || "";
}

/**
 * Парсим Word:
 * В документе блоки идут заголовками типа "FitWin PISTACHIO&CREAM 60g", "Crunch Bar ... 50g", и т.п.
 * Мы берём каждую строку, которая выглядит как “название товара”, и строим якоря.
 */
function buildAnchorsFromWordText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const candidates = [];
  for (const line of lines) {
    // эвристика “это похоже на имя товара”: есть бренд/Bar и есть вес
    const n = normalize(line);
    const hasWeight = /\b(45|50|55|60|100)\b/.test(n) || /\b(45g|50g|55g|60g|100g)\b/.test(n);
    const hasBrand = n.includes("fitwin") || n.includes("crunch") || n.includes("brisee") || n.includes("coconut") || n.includes("whey") || n.includes("gainer") || n.includes("bcaa") || n.includes("paste");
    if (hasWeight && hasBrand) candidates.push(line);
  }

  // anchors: токены + важные фразы
  const map = candidates.map((title) => {
    const n = normalize(title);

    // токены-слова
    const tokens = Array.from(
      new Set(
        n.split(" ").filter((t) => t.length >= 3 && !["tycinka", "proteinova", "proteínová", "batonчик", "batonчик"].includes(t))
      )
    );

    // доп якоря: веса отдельно, вкусы часто латиницей
    const weights = (n.match(/\b(45|50|55|60|100)\b/g) || []);
    const anchors = Array.from(new Set([...tokens, ...weights]));

    return { title, normTitle: n, anchors };
  });

  return map;
}

/** скоринг: сколько якорей товара нашлось в OCR тексте */
function scoreByAnchors(ocrNorm, productAnchors) {
  let hits = 0;
  for (const a of productAnchors) {
    if (!a) continue;
    // фразовый матч (подстрока)
    if (ocrNorm.includes(a)) hits++;
  }
  return hits;
}

async function main() {
  await fs.ensureDir(absOut);
  await fs.emptyDir(workDir);

  // unzip
  new AdmZip(absZip).extractAllTo(workDir, true);
  const images = (await listAllFiles(workDir)).filter(isImageFile);
  console.log(`🖼️ Images found: ${images.length}`);

  // read word
  const { value: rawText } = await mammoth.extractRawText({ path: absWord });
  const wordAnchors = buildAnchorsFromWordText(rawText);
  console.log(`📄 Word product titles detected: ${wordAnchors.length}`);

  // load products from mongo (чтобы папки называть как в базе)
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const col = client.db(DB_NAME).collection(COLLECTION_NAME);

  const dbProducts = await col
    .find({}, { projection: { _id: 1, slug: 1, title: 1 } })
    .toArray();

  await client.close();
  console.log(`📦 Products loaded: ${dbProducts.length}`);

  // индекс по нормализованным заголовкам базы для сопоставления Word->DB
  // (если совпадёт плохо — просто будем папку создавать по Word title)
  const dbIndex = dbProducts.map((p) => {
    const bestTitle = p?.title?.sk || p?.title?.en || p?.title?.ua || p?.title?.ru || p?.slug || String(p?._id);
    return { title: bestTitle, norm: normalize(bestTitle) };
  });

  function bestDbTitleFor(wordTitleNorm) {
    let best = null;
    let bestScore = -1;
    for (const d of dbIndex) {
      // очень простой скор: совпадение токенов
      const wTokens = new Set(wordTitleNorm.split(" ").filter((t) => t.length >= 3));
      const dTokens = d.norm.split(" ").filter((t) => t.length >= 3);
      let hit = 0;
      for (const t of dTokens) if (wTokens.has(t)) hit++;
      if (hit > bestScore) {
        bestScore = hit;
        best = d.title;
      }
    }
    return bestScore >= 2 ? best : null;
  }

  const unmatchedDir = path.join(absOut, "__UNMATCHED");
  await fs.ensureDir(unmatchedDir);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const base = path.basename(img);

    console.log(`\n[${i + 1}/${images.length}] OCR -> ${base}`);

    const pre = await preprocessForOCR(img);
    const ocrText = await runOCR(pre);
    const ocrNorm = normalize(ocrText);

    // ищем лучший Word-товар по якорям
    let best = null;
    let bestHits = 0;

    for (const w of wordAnchors) {
      const hits = scoreByAnchors(ocrNorm, w.anchors);
      if (hits > bestHits) {
        bestHits = hits;
        best = w;
      }
    }

    if (!best || bestHits < MIN_ANCHOR_HITS) {
      const dest = path.join(unmatchedDir, base);
      if (MODE === "copy") await fs.copy(img, dest);
      else await fs.move(img, dest, { overwrite: true });
      console.log(`❌ Unmatched (hits=${bestHits})`);
      continue;
    }

    // название папки: предпочтительно как в базе, иначе Word title
    const dbTitle = bestDbTitleFor(best.normTitle);
    const folderName = sanitizeFolderName(dbTitle || best.title);

    const dir = path.join(absOut, folderName);
    await fs.ensureDir(dir);

    const dest = path.join(dir, base);
    if (MODE === "copy") await fs.copy(img, dest);
    else await fs.move(img, dest, { overwrite: true });

    console.log(`✅ Matched -> ${folderName} (hits=${bestHits})`);
  }

  await fs.remove(workDir);
  console.log(`\n📁 Output: ${absOut}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});