import { Order } from "../models/Order.model.js";
import { buildOrderPositions, calcOrderTotals } from "../utils/orderPositions.js";

const safeMap = {
  box_invalid_size: "Невірний розмір боксу. Доступно лише 5 або 10.",
  box_empty: "Бокс порожній.",
  box_invalid_total_qty: "Кількість товарів у боксі має бути рівно 5 або 10.",
  box_product_not_found: "Один з товарів у боксі не знайдено.",
  product_invalid: "Некоректний товар у замовленні.",
  product_invalid_qty: "Некоректна кількість товару.",
  product_not_found: "Товар не знайдено.",
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

// CREATE
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
      payment,
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
    if (phone) filter["customer.phone"] = { $regex: String(phone), $options: "i" };

    if (q) {
      filter.$or = [
        { orderNumber: { $regex: String(q), $options: "i" } },
        { "customer.name": { $regex: String(q), $options: "i" } },
        { "customer.phone": { $regex: String(q), $options: "i" } },
        { promoCode: { $regex: String(q), $options: "i" } },
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
    if (phone !== undefined) order.customer.phone = String(phone).trim();
    if (email !== undefined) order.customer.email = String(email).trim();
    if (promoCode !== undefined) order.promoCode = String(promoCode).trim();
    if (comment !== undefined) order.comment = String(comment).trim();
    if (status !== undefined) order.status = status;

    if (delivery !== undefined) {
      order.delivery = {
        ...order.delivery?.toObject?.(),
        ...delivery,
      };
    }

    if (payment !== undefined) {
      order.payment = {
        ...order.payment?.toObject?.(),
        ...payment,
      };
    }

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items must be a non-empty array" });
      }

      const positions = await buildOrderPositions(items);
      const totals = calcOrderTotals(positions);

      order.items = positions;
      order.totals = totals;
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
    }

    await order.save();

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