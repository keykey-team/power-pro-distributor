// ================================
// controllers/leads.controller.js
// ================================
import { Lead } from "../models/Lead.model.js";
import { Product } from "../models/Product.model.js";
import { sendTelegramMessage } from "../services/telegram.js";
import { calcDiscountedTotal } from "../utils/pricing.js";
import { toTitleString } from "../utils/title.js";

/**
 * Custom box format:
 * {
 *   kind:"custom_box",
 *   size: 5|10,
 *   items: [{ _id|id|productId, quantity|qty }]
 * }
 */
async function buildCustomBoxPosition(boxPayload) {
  const { size, items } = boxPayload || {};

  const boxSize = Number(size);
  if (![5, 10].includes(boxSize)) throw new Error("box_invalid_size");

  if (!Array.isArray(items) || items.length === 0) throw new Error("box_empty");

  const normalized = items
    .map((x) => ({
      id: x._id || x.id || x.productId,
      quantity: Number(x.quantity || x.qty || 0),
    }))
    .filter((x) => x.id && x.quantity > 0);

  const totalQty = normalized.reduce((s, x) => s + x.quantity, 0);
  if (totalQty !== boxSize) throw new Error("box_invalid_total_qty");

  const ids = normalized.map((x) => x.id);

  const products = await Product.find({ _id: { $in: ids } }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const boxItems = normalized.map((x) => {
    const p = byId.get(String(x.id));
    if (!p) throw new Error("box_product_not_found");

    const unitPrice = Number(p.cost ?? p.price ?? 0);
    const qty = x.quantity;

    const total = +(qty * unitPrice).toFixed(2);
    const discountedTotal = calcDiscountedTotal(total, p.discount || 0);

    return {
      id: p._id,
      barcode: p.barcode || "",
      title: toTitleString(p.title),
      quantity: qty,
      unitPrice: +unitPrice.toFixed(2),
      total,
      discountedTotal,
      img: (p.imageURL && p.imageURL[0]) || "",
      multiplicity: p.multiplicity || 1,
    };
  });

  const boxTotal = boxItems.reduce((s, it) => s + Number(it.discountedTotal || 0), 0);

  return {
    kind: "custom_box",
    title: `Balený box ${boxSize} ks`,
    quantity: 1,
    unitPrice: +boxTotal.toFixed(2),
    total: +boxTotal.toFixed(2),
    discountedTotal: +boxTotal.toFixed(2),
    img: boxItems[0]?.img || "",
    multiplicity: 1,
    box: { size: boxSize, items: boxItems },
  };
}

async function buildProductPosition(item) {
  const productId = item?._id || item?.id || item?.productId;
  if (!productId) throw new Error("product_invalid");

  const qty = Number(item.quantity || item.qty || 1);
  if (qty <= 0) throw new Error("product_invalid_qty");

  const dbProduct = await Product.findById(productId).lean();
  if (!dbProduct) throw new Error("product_not_found");

  const unitPrice = Number(dbProduct.cost ?? dbProduct.price ?? 0);
  const discount = Number(dbProduct.discount || 0);

  const total = +(qty * unitPrice).toFixed(2);
  const discountedTotal = calcDiscountedTotal(total, discount);

  return {
    kind: "product",
    id: dbProduct._id,
    barcode: dbProduct.barcode || "",
    title: toTitleString(dbProduct.title),
    quantity: qty,
    unitPrice: +unitPrice.toFixed(2),
    total,
    discountedTotal,
    img: (dbProduct.imageURL && dbProduct.imageURL[0]) || "",
    multiplicity: dbProduct.multiplicity || 1,
  };
}

function formatLeadTelegramText({ lead, positions, totalCost }) {
  const lines = [];
  lines.push("🟡 Нова заявка");
  lines.push("");
  lines.push(`👤 Ім'я: ${lead.name}`);
  lines.push(`📞 Телефон: ${lead.phone}`);
  lines.push(`🏷 Промокод: ${lead.promoCode || "-"}`);
  lines.push("");

  // ✅ теперь нормально обрабатываем "без товаров"
  if (!positions || positions.length === 0) {
    lines.push("🧾 Позиції: (немає)");
    lines.push("");
    lines.push("💰 Разом: 0.00 €");
    return lines.join("\n");
  }

  lines.push("🧾 Позиції:");
  for (const p of positions) {
    if (p.kind === "product") {
      lines.push(`• ${p.title} × ${p.quantity} = ${Number(p.discountedTotal || 0).toFixed(2)} €`);
    }

    if (p.kind === "custom_box") {
      lines.push(`• ${p.title} = ${Number(p.discountedTotal || 0).toFixed(2)} €`);
      lines.push("  Склад:");
      for (const bi of p.box.items) {
        lines.push(`  - ${bi.title} × ${bi.quantity}`);
      }
    }
  }

  lines.push("");
  lines.push(`💰 Разом: ${Number(totalCost || 0).toFixed(2)} €`);

  return lines.join("\n");
}

/**
 * POST /api/leads/send
 * body:
 * {
 *   name, phone, promoCode,
 *   items?: [
 *     { kind:"product", _id:"...", quantity:2 },
 *     { kind:"custom_box", size:10, items:[{_id:"..", qty:3}, ...] }
 *   ]
 * }
 *
 * ✅ items может отсутствовать / быть пустым — заявку всё равно отправляем
 */
export const sendLeadToTelegram = async (req, res) => {
  try {
    const { name, phone, promoCode = "", items } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ message: "Phone is required" });
    }

    // ✅ Save only 3 fields to DB
    const lead = await Lead.create({
      name: String(name).trim(),
      phone: String(phone).trim(),
      promoCode: String(promoCode || "").trim(),
    });

    // ✅ items optional
    const safeItems = Array.isArray(items) ? items : [];

    // ✅ Build positions only if there are items
    const positions =
      safeItems.length === 0
        ? []
        : await Promise.all(
            safeItems.map(async (item) => {
              if (item?.kind === "custom_box") return await buildCustomBoxPosition(item);
              return await buildProductPosition(item);
            })
          );

    const totalCost = positions.reduce((sum, p) => sum + Number(p.discountedTotal || 0), 0);

    const text = formatLeadTelegramText({
      lead,
      positions,
      totalCost: +Number(totalCost).toFixed(2),
    });

    await sendTelegramMessage({
      token: "8349065764:AAGrt4Tm7VYqkF_lA505OabfHL_ZbBZgYyA",
      chatId: "-1003884098696",
      text,
    });

    return res.status(201).json({
      ok: true,
      leadId: lead._id,
      totalCost: +Number(totalCost).toFixed(2),
      itemsCount: positions.length,
    });
  } catch (error) {
    const safeMap = {
      box_invalid_size: "Невірний розмір боксу. Доступно лише 5 або 10.",
      box_empty: "Бокс порожній.",
      box_invalid_total_qty: "Кількість товарів у боксі має бути рівно 5 або 10.",
      box_product_not_found: "Один з товарів у боксі не знайдено.",
      product_invalid: "Некоректний товар у заявці.",
      product_invalid_qty: "Некоректна кількість товару.",
      product_not_found: "Товар не знайдено.",
    };

    const code = error?.message;
    const human = safeMap[code];

    // ✅ если это наша "ожидаемая" ошибка — 400, иначе 500
    const status = human ? 400 : 500;

    return res.status(status).json({
      message: human || "Не удалось отправить заявку",
      error: human ? code : String(error?.message || error),
    });
  }
};
