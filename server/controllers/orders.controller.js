import axios from "axios";
import { Order } from "../models/Order.model.js";
import { buildOrderPositions, calcOrderTotals } from "../utils/orderPositions.js";
import { sendTelegramMessage } from "../services/telegram.js";

const safeMap = {
  box_invalid_size: "Невірний розмір боксу. Доступно лише 5 або 10.",
  box_empty: "Бокс порожній.",
  box_invalid_total_qty: "Кількість товарів у боксі має бути рівно 5 або 10.",
  box_product_not_found: "Один з товарів у боксі не знайдено.",
  product_invalid: "Некоректний товар у замовленні.",
  product_invalid_qty: "Некоректна кількість товару.",
  product_not_found: "Товар не знайдено.",
  product_purchase_mode_invalid: "Некоректний режим покупки товару.",
  product_box_not_available: "Для цього товару бокс недоступний.",
};

function handleOrderError(res, error) {
  const code = error?.message;
  const human = safeMap[code];
  const status = human ? 400 : 500;

  return res.status(status).json({
    message: human || "Не вдалося обробити замовлення",
    error: human ? code : String(error?.message || error),
  });
}



function formatDeliveryText(delivery = {}) {
  const lines = [];

  const entries = [
    ["Тип доставки", delivery?.type],
    ["Країна", delivery?.country],
    ["Місто", delivery?.city],
    ["Вулиця", delivery?.street],
    ["Будинок", delivery?.house],
    ["Квартира", delivery?.apartment],
    ["Адреса", delivery?.address],
    ["PSC", delivery?.psc],
    ["Вартість доставки", delivery?.price ? `${Number(delivery.price).toFixed(2)} €` : undefined],
    ["Коментар", delivery?.note],
    ["Відділення", delivery?.branch],
    ["Поштомат", delivery?.parcelLocker],
    ["Компанія доставки", delivery?.carrier],
  ].filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "");

  for (const [label, value] of entries) {
    lines.push(`• ${label}: ${value}`);
  }

  return lines;
}

function formatOrderTelegramText(order) {
  const lines = [];

  lines.push("🟢 Нове оплачене замовлення");
  lines.push("");

  lines.push(`📦 Замовлення: ${order.orderNumber || order._id}`);
  lines.push(`👤 Ім'я: ${order.customer?.name || "-"}`);
  lines.push(`👤 Прізвище: ${order.customer?.surname || "-"}`);
  lines.push(`📞 Телефон: ${order.customer?.phone || "-"}`);
  lines.push(`✉️ Email: ${order.customer?.email || "-"}`);
  lines.push(`🏷 Промокод: ${order.promoCode || "-"}`);
  lines.push("");

  if (!order.items?.length) {
    lines.push("🧾 Позиції: (немає)");
  } else {
    lines.push("🧾 Позиції:");

    for (const p of order.items) {
      if (p.kind === "product") {
        lines.push(
          `• ${p.title} × ${p.quantity} = ${Number(p.discountedTotal || 0).toFixed(2)} €`
        );
      }

      if (p.kind === "custom_box") {
        lines.push(
          `• ${p.title} = ${Number(p.discountedTotal || 0).toFixed(2)} €`
        );
        lines.push("  Склад:");
        for (const bi of p.box?.items || []) {
          lines.push(`  - ${bi.title} × ${bi.quantity}`);
        }
      }
    }
  }

  lines.push("");
  lines.push(`💰 Разом: ${Number(order.totals?.total || 0).toFixed(2)} €`);
  lines.push(`💳 Статус оплати: ${order.payment?.status || "-"}`);
  lines.push(`🧾 Транзакція: ${order.payment?.transactionId || "-"}`);

  const deliveryLines = formatDeliveryText(order.delivery);
  if (deliveryLines.length) {
    lines.push("");
    lines.push("🚚 Доставка:");
    lines.push(...deliveryLines);
  }

  if (order.comment) {
    lines.push("");
    lines.push(`📝 Коментар: ${order.comment}`);
  }

  return lines.join("\n");
}

async function sendPaidOrderTelegramNotification(order) {
  const token = "8349065764:AAGrt4Tm7VYqkF_lA505OabfHL_ZbBZgYyA";
  const chatId = '-1003884098696';

  if (!token || !chatId) {
    throw new Error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured");
  }

  const text = formatOrderTelegramText(order);

  await sendTelegramMessage({
    token,
    chatId,
    text,
  });
}

async function notifyPaidOrderOnce(order) {
  if (!order) return;
  if (order.payment?.status !== "paid") return;
  if (order.telegramNotification?.paidSentAt) return;

  await sendPaidOrderTelegramNotification(order);

  order.telegramNotification = {
    ...(order.telegramNotification || {}),
    paidSentAt: new Date(),
  };

  await order.save();
}

function parseComgateResponse(data) {
  if (typeof data === "object" && data !== null) return data;

  const text = String(data || "");
  const result = {};

  text.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key) result[key] = decodeURIComponent(value || "");
  });

  return result;
}

async function createComgatePayment({
  order,
  amountInCents,
  currency = "EUR",
}) {
  const COMGATE_MERCHANT = process.env.COMGATE_MERCHANT;
  const COMGATE_SECRET = process.env.COMGATE_SECRET;
  const COMGATE_BASE_URL =
    process.env.COMGATE_BASE_URL || "https://payments.comgate.cz/v1.0";
  const APP_URL = process.env.APP_URL;
  const COUNTRY = process.env.COMGATE_COUNTRY || "SK";
  const METHOD = process.env.COMGATE_METHOD || "ALL";
  const TEST_MODE = String(process.env.COMGATE_TEST || "false") === "true";

  if (!COMGATE_MERCHANT || !COMGATE_SECRET || !APP_URL) {
    throw new Error(
      "COMGATE env is not configured. Required: COMGATE_MERCHANT, COMGATE_SECRET, APP_URL"
    );
  }

  const fullName = [order.customer?.name, order.customer?.surname]
    .filter(Boolean)
    .join(" ")
    .trim();

  const label = String(order.orderNumber || order._id).slice(0, 16);

  const deliveryPrice = Number(order.delivery?.price || 0);

  // amountInCents — это сумма товаров в центах
  // delivery.price — сумма доставки в евро
  const finalAmountInCents = amountInCents + Math.round(deliveryPrice * 100);

  const body = new URLSearchParams();
  body.append("merchant", COMGATE_MERCHANT);
  body.append("secret", COMGATE_SECRET);
  body.append("prepareOnly", "true");
  body.append("price", String(finalAmountInCents));
  body.append("curr", currency);
  body.append("label", label);
  body.append("refId", String(order._id));
  body.append("method", METHOD);
  body.append("country", COUNTRY);

  if (TEST_MODE) {
    body.append("test", "true");
  }

  if (order.customer?.email) {
    body.append("email", order.customer.email);
  }

  if (order.customer?.phone) {
    body.append("phone", order.customer.phone);
  }

  if (fullName) {
    body.append("fullName", fullName);
  }

  body.append(
    "url_paid",
    `${APP_URL}?comgate=paid&id=\${id}&refId=\${refId}`
  );
  body.append(
    "url_cancelled",
    `${APP_URL}?comgate=cancelled&id=\${id}&refId=\${refId}`
  );
  body.append(
    "url_pending",
    `${APP_URL}?comgate=pending&id=\${id}&refId=\${refId}`
  );

  const { data } = await axios.post(
    `${COMGATE_BASE_URL}/create`,
    body.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 30000,
    }
  );

  const parsed = parseComgateResponse(data);

  if (parsed.code !== "0") {
    throw new Error(
      parsed.message
        ? `Comgate create error: ${parsed.message}`
        : "Comgate create error"
    );
  }

  if (!parsed.transId || !parsed.redirect) {
    throw new Error("Comgate create error: missing transId or redirect");
  }

  return {
    transactionId: parsed.transId,
    redirectUrl: parsed.redirect,
    raw: parsed,
    amountInCents: finalAmountInCents,
  };
}

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const {
      name,
      surname,
      phone,
      email = "",
      promoCode = "",
      items = [],
      delivery = {},
      payment = {},
      comment = "",
      status = "new",
    } = req.body || {};

    console.log("Creating order with data:", {
      name,
      surname,
      phone,
      email,
      promoCode,
      items,
      delivery,
      payment,
      comment,
      status
    });


    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ message: "Phone is required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    const positions = await buildOrderPositions(items);
    const totals = calcOrderTotals(positions);

    const order = await Order.create({
      customer: {
        name: String(name).trim(),
        surname: String(surname || "").trim(),
        phone: String(phone).trim(),
        email: String(email || "").trim(),
      },
      promoCode: String(promoCode || "").trim(),
      items: positions,
      totals,
      delivery,
      payment: {
        provider: "",
        method: payment?.method || "online",
        status: "pending",
        transactionId: "",
        refId: "",
        redirectUrl: "",
        amount: totals.total,
        currency: totals.currency || "EUR",
        paidAt: null,
        rawCallback: null,
      },
      telegramNotification: {
        paidSentAt: null,
      },
      comment: String(comment || "").trim(),
      status,
    });

    return res.status(201).json({
      ok: true,
      order,
    });
  } catch (error) {
    return handleOrderError(res, error);
  }
};

// START PAYMENT FOR EXISTING ORDER
export const createOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Замовлення не знайдено" });
    }

    if (!order.items?.length) {
      return res.status(400).json({ message: "У замовленні немає товарів" });
    }

    if (order.payment?.status === "paid") {
      return res.status(400).json({
        message: "Це замовлення вже оплачене",
      });
    }

    const currency = order.totals?.currency || "EUR";
    const amount = Number(order.totals?.total || 0);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Некоректна сума замовлення",
      });
    }

    const amountInCents = Math.round(amount * 100);

    const paymentData = await createComgatePayment({
      order,
      amountInCents,
      currency,
    });

    order.payment.provider = "comgate";
    order.payment.method = "online";
    order.payment.status = "pending";
    order.payment.transactionId = paymentData.transactionId;
    order.payment.refId = String(order._id);
    order.payment.redirectUrl = paymentData.redirectUrl;
    order.payment.amount = amount;
    order.payment.currency = currency;

    await order.save();

    return res.json({
      ok: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        transactionId: paymentData.transactionId,
        redirectUrl: paymentData.redirectUrl,
        paymentStatus: order.payment.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Не вдалося створити оплату Comgate",
      error: String(error?.message || error),
    });
  }
};

// COMGATE CALLBACK
export const comgateCallback = async (req, res) => {
  try {
    const payload = req.body || {};

    const transactionId = String(payload.transId || "").trim();
    const refId = String(payload.refId || "").trim();
    const statusRaw = String(payload.status || "").trim().toUpperCase();
    const curr = String(payload.curr || "").trim();
    const price = Number(payload.price || 0);

    if (!transactionId || !refId || !statusRaw) {
      return res.status(400).send("missing required fields");
    }

    const order = await Order.findById(refId);
    if (!order) {
      return res.status(404).send("order not found");
    }

    let paymentStatus = "pending";

    if (statusRaw === "PAID") {
      paymentStatus = "paid";
    } else if (statusRaw === "CANCELLED") {
      paymentStatus = "cancelled";
    } else if (statusRaw === "AUTHORIZED" || statusRaw === "PENDING") {
      paymentStatus = "pending";
    } else {
      paymentStatus = "failed";
    }

    order.payment.provider = "comgate";
    order.payment.method = "online";
    order.payment.status = paymentStatus;
    order.payment.transactionId = transactionId;
    order.payment.refId = refId;
    order.payment.currency =
      curr || order.payment.currency || order.totals.currency || "EUR";
    order.payment.amount =
      price > 0
        ? Number((price / 100).toFixed(2))
        : order.payment.amount || order.totals.total || 0;
    order.payment.rawCallback = payload;

    if (paymentStatus === "paid" && !order.payment.paidAt) {
      order.payment.paidAt = new Date();
    }

    if (paymentStatus === "paid" && order.status === "new") {
      order.status = "confirmed";
    }

    if (paymentStatus === "cancelled") {
      order.status = "cancelled";
    }

    await order.save();

    if (paymentStatus === "paid") {
      try {
        await notifyPaidOrderOnce(order);
      } catch (telegramError) {
        console.error(
          "Telegram notification failed for paid order:",
          order._id,
          telegramError
        );
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Comgate callback error:", error);
    return res.status(500).send("ERROR");
  }
};

// READ ALL
export const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      phone,
      q,
      sort = "-createdAt",
    } = req.query;

    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const filter = {};

    if (status) filter.status = status;
    if (phone) {
      filter["customer.phone"] = {
        $regex: String(phone),
        $options: "i",
      };
    }

    if (q) {
      filter.$or = [
        { orderNumber: { $regex: String(q), $options: "i" } },
        { "customer.name": { $regex: String(q), $options: "i" } },
        { "customer.surname": { $regex: String(q), $options: "i" } },
        { "customer.phone": { $regex: String(q), $options: "i" } },
        { "customer.email": { $regex: String(q), $options: "i" } },
        { promoCode: { $regex: String(q), $options: "i" } },
        { "payment.transactionId": { $regex: String(q), $options: "i" } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.json({
      ok: true,
      data: orders,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Не вдалося отримати замовлення",
      error: String(error?.message || error),
    });
  }
};

// READ ONE
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).lean();
    if (!order) {
      return res.status(404).json({ message: "Замовлення не знайдено" });
    }

    return res.json({
      ok: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Не вдалося отримати замовлення",
      error: String(error?.message || error),
    });
  }
};

// UPDATE
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      surname,
      phone,
      email,
      promoCode,
      items,
      delivery,
      payment,
      comment,
      status,
    } = req.body || {};

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Замовлення не знайдено" });
    }

    if (name !== undefined) order.customer.name = String(name).trim();
    if (surname !== undefined) order.customer.surname = String(surname).trim();
    if (phone !== undefined) order.customer.phone = String(phone).trim();
    if (email !== undefined) order.customer.email = String(email).trim();
    if (promoCode !== undefined) order.promoCode = String(promoCode).trim();
    if (comment !== undefined) order.comment = String(comment).trim();
    if (status !== undefined) order.status = status;

    if (delivery !== undefined) {
      order.delivery = {
        ...(order.delivery?.toObject?.() || order.delivery || {}),
        ...delivery,
      };
    }

    if (payment !== undefined) {
      order.payment = {
        ...(order.payment?.toObject?.() || order.payment || {}),
        ...payment,
      };
    }

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          message: "Items must be a non-empty array",
        });
      }

      const positions = await buildOrderPositions(items);
      const totals = calcOrderTotals(positions);

      order.items = positions;
      order.totals = totals;

      if (order.payment) {
        order.payment.amount = totals.total;
        order.payment.currency =
          totals.currency || order.payment.currency || "EUR";
      }
    }

    await order.save();

    return res.json({
      ok: true,
      data: order,
    });
  } catch (error) {
    return handleOrderError(res, error);
  }
};

// PATCH STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body || {};

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Замовлення не знайдено" });
    }

    if (status !== undefined) {
      order.status = status;
    }

    if (paymentStatus !== undefined) {
      order.payment.status = paymentStatus;

      if (paymentStatus === "paid" && !order.payment.paidAt) {
        order.payment.paidAt = new Date();
      }

      if (paymentStatus === "cancelled") {
        order.status = "cancelled";
      }

      if (paymentStatus === "paid" && order.status === "new") {
        order.status = "confirmed";
      }
    }

    await order.save();

    if (paymentStatus === "paid") {
      try {
        await notifyPaidOrderOnce(order);
      } catch (telegramError) {
        console.error(
          "Telegram notification failed for manual paid status:",
          order._id,
          telegramError
        );
      }
    }

    return res.json({
      ok: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Не вдалося оновити статус замовлення",
      error: String(error?.message || error),
    });
  }
};

// DELETE
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: "Замовлення не знайдено" });
    }

    return res.json({
      ok: true,
      message: "Замовлення видалено",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Не вдалося видалити замовлення",
      error: String(error?.message || error),
    });
  }
};