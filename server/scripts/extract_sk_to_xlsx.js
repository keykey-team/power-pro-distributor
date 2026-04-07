import { MongoClient } from "mongodb";
import ExcelJS from "exceljs";

const MONGO_URI =
  "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

const DB_NAME = "test";
const COLLECTION_NAME = "products";
const OUTPUT_FILE = "sk_translations.xlsx";
const ACTIVE_ONLY = false;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function pushRow(rows, product, fieldPath, sourceText, extra = {}) {
  if (!isNonEmptyString(sourceText)) return;

  rows.push({
    product_id: String(product._id),
    slug: product.slug || "",
    field_path: fieldPath,
    array_index: extra.array_index ?? "",
    item_key: extra.item_key ?? "",
    source_lang: "sk",
    source_text: sourceText.trim(),
    target_lang: "en",
    target_text: "",
  });
}

function extractRowsFromProduct(product) {
  const rows = [];

  pushRow(rows, product, "title.sk", product?.title?.sk);
  pushRow(rows, product, "subtitle.sk", product?.subtitle?.sk);
  pushRow(rows, product, "description.sk", product?.description?.sk);
  pushRow(rows, product, "ingredients.sk", product?.ingredients?.sk);
  pushRow(rows, product, "seoTitle.sk", product?.seoTitle?.sk);
  pushRow(rows, product, "seoDescription.sk", product?.seoDescription?.sk);
  pushRow(rows, product, "nutritionTable.title.sk", product?.nutritionTable?.title?.sk);
  pushRow(rows, product, "brand.title.sk", product?.brand?.title?.sk);

  if (Array.isArray(product?.features?.sk)) {
    product.features.sk.forEach((value, index) => {
      pushRow(rows, product, `features.sk[${index}]`, value, {
        array_index: index,
      });
    });
  }

  if (Array.isArray(product?.cardBadges)) {
    product.cardBadges.forEach((badge, index) => {
      pushRow(rows, product, `cardBadges[${index}].label.sk`, badge?.label?.sk, {
        array_index: index,
        item_key: badge?.key || "",
      });
    });
  }

  if (Array.isArray(product?.nutritionTable?.columns)) {
    product.nutritionTable.columns.forEach((column, index) => {
      pushRow(
        rows,
        product,
        `nutritionTable.columns[${index}].label.sk`,
        column?.label?.sk,
        {
          array_index: index,
          item_key: column?.key || "",
        }
      );
    });
  }

  if (Array.isArray(product?.nutritionTable?.rows)) {
    product.nutritionTable.rows.forEach((row, index) => {
      pushRow(rows, product, `nutritionTable.rows[${index}].label.sk`, row?.label?.sk, {
        array_index: index,
        item_key: row?.key || "",
      });
    });
  }

  return rows;
}

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const query = ACTIVE_ONLY ? { isActive: true } : {};

    const projection = {
      slug: 1,
      title: 1,
      subtitle: 1,
      description: 1,
      ingredients: 1,
      seoTitle: 1,
      seoDescription: 1,
      features: 1,
      cardBadges: 1,
      nutritionTable: 1,
      brand: 1,
      isActive: 1,
    };

    const cursor = collection.find(query, { projection });

    const allRows = [];
    let productsCount = 0;

    for await (const product of cursor) {
      productsCount++;
      const rows = extractRowsFromProduct(product);
      allRows.push(...rows);
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("translations");

    sheet.columns = [
      { header: "product_id", key: "product_id", width: 28 },
      { header: "slug", key: "slug", width: 36 },
      { header: "field_path", key: "field_path", width: 40 },
      { header: "array_index", key: "array_index", width: 12 },
      { header: "item_key", key: "item_key", width: 20 },
      { header: "source_lang", key: "source_lang", width: 12 },
      { header: "source_text", key: "source_text", width: 70 },
      { header: "target_lang", key: "target_lang", width: 12 },
      { header: "target_text", key: "target_text", width: 70 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    for (const row of allRows) {
      sheet.addRow(row);
    }

    sheet.getColumn("source_text").alignment = { wrapText: true, vertical: "top" };
    sheet.getColumn("target_text").alignment = { wrapText: true, vertical: "top" };

    await workbook.xlsx.writeFile(OUTPUT_FILE);

    console.log(`Готово.`);
    console.log(`DB: ${DB_NAME}`);
    console.log(`Collection: ${COLLECTION_NAME}`);
    console.log(`Товаров обработано: ${productsCount}`);
    console.log(`Строк выгружено: ${allRows.length}`);
    console.log(`Файл: ${OUTPUT_FILE}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Ошибка:", error);
  process.exit(1);
});