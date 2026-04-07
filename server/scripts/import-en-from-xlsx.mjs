import { MongoClient, ObjectId } from "mongodb";
import ExcelJS from "exceljs";

const MONGO_URI =
  "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

const DB_NAME = "test";
const COLLECTION_NAME = "products";
const INPUT_FILE = "sk_translations.xlsx";
const DRY_RUN = false;

function parseFieldPath(fieldPath) {
  const matchers = [
    {
      regex: /^title\.sk$/,
      buildSetPath: () => "title.en",
    },
    {
      regex: /^subtitle\.sk$/,
      buildSetPath: () => "subtitle.en",
    },
    {
      regex: /^description\.sk$/,
      buildSetPath: () => "description.en",
    },
    {
      regex: /^ingredients\.sk$/,
      buildSetPath: () => "ingredients.en",
    },
    {
      regex: /^seoTitle\.sk$/,
      buildSetPath: () => "seoTitle.en",
    },
    {
      regex: /^seoDescription\.sk$/,
      buildSetPath: () => "seoDescription.en",
    },
    {
      regex: /^nutritionTable\.title\.sk$/,
      buildSetPath: () => "nutritionTable.title.en",
    },
    {
      regex: /^brand\.title\.sk$/,
      buildSetPath: () => "brand.title.en",
    },
    {
      regex: /^features\.sk\[(\d+)\]$/,
      buildSetPath: (m) => `features.en.${Number(m[1])}`,
    },
    {
      regex: /^cardBadges\[(\d+)\]\.label\.sk$/,
      buildSetPath: (m) => `cardBadges.${Number(m[1])}.label.en`,
    },
    {
      regex: /^nutritionTable\.columns\[(\d+)\]\.label\.sk$/,
      buildSetPath: (m) => `nutritionTable.columns.${Number(m[1])}.label.en`,
    },
    {
      regex: /^nutritionTable\.rows\[(\d+)\]\.label\.sk$/,
      buildSetPath: (m) => `nutritionTable.rows.${Number(m[1])}.label.en`,
    },
  ];

  for (const item of matchers) {
    const match = fieldPath.match(item.regex);
    if (match) {
      return item.buildSetPath(match);
    }
  }

  return null;
}

async function readRowsFromXlsx(inputPath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputPath);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new Error("Не найден лист в xlsx");
  }

  const headerRow = sheet.getRow(1);
  const headers = {};

  headerRow.eachCell((cell, colNumber) => {
    headers[String(cell.value).trim()] = colNumber;
  });

  const requiredHeaders = ["product_id", "field_path", "target_text"];
  for (const name of requiredHeaders) {
    if (!headers[name]) {
      throw new Error(`В xlsx нет обязательной колонки: ${name}`);
    }
  }

  const rows = [];

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);

    const productId = row.getCell(headers.product_id).value;
    const fieldPath = row.getCell(headers.field_path).value;
    const targetText = row.getCell(headers.target_text).value;

    const normalizedProductId = productId != null ? String(productId).trim() : "";
    const normalizedFieldPath = fieldPath != null ? String(fieldPath).trim() : "";
    const normalizedTargetText = targetText != null ? String(targetText).trim() : "";

    if (!normalizedProductId || !normalizedFieldPath || !normalizedTargetText) {
      continue;
    }

    rows.push({
      product_id: normalizedProductId,
      field_path: normalizedFieldPath,
      target_text: normalizedTargetText,
      excel_row: rowNumber,
    });
  }

  return rows;
}

async function main() {
  const excelRows = await readRowsFromXlsx(INPUT_FILE);

  if (!excelRows.length) {
    console.log("Нет строк с переводами для импорта.");
    return;
  }

  const groupedUpdates = new Map();

  for (const row of excelRows) {
    const setPath = parseFieldPath(row.field_path);

    if (!setPath) {
      console.warn(
        `Пропущена строка ${row.excel_row}: неподдерживаемый путь ${row.field_path}`
      );
      continue;
    }

    if (!groupedUpdates.has(row.product_id)) {
      groupedUpdates.set(row.product_id, {});
    }

    groupedUpdates.get(row.product_id)[setPath] = row.target_text;
  }

  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    let affectedProducts = 0;
    let totalFields = 0;

    for (const [productId, setObject] of groupedUpdates.entries()) {
      const fieldCount = Object.keys(setObject).length;
      totalFields += fieldCount;

      if (DRY_RUN) {
        console.log(`DRY RUN -> product_id=${productId}`);
        console.log(JSON.stringify({ $set: setObject }, null, 2));
        affectedProducts++;
        continue;
      }

      let _id;
      try {
        _id = new ObjectId(productId);
      } catch {
        console.warn(`Пропущен некорректный ObjectId: ${productId}`);
        continue;
      }

      const result = await collection.updateOne({ _id }, { $set: setObject });

      if (result.matchedCount === 0) {
        console.warn(`Товар не найден: ${productId}`);
        continue;
      }

      affectedProducts++;
      console.log(`Обновлен товар ${productId}, полей: ${fieldCount}`);
    }

    console.log(`Готово.`);
    console.log(`DB: ${DB_NAME}`);
    console.log(`Collection: ${COLLECTION_NAME}`);
    console.log(`Товаров обработано: ${affectedProducts}`);
    console.log(`Полей en обновлено/подготовлено: ${totalFields}`);
    console.log(`Режим: ${DRY_RUN ? "dry-run" : "write"}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Ошибка:", error);
  process.exit(1);
});