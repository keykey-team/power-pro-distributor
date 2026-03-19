// controllers/comgate.controller.js
import { Order } from "../models/Order.model.js";

export const comgateCallback = async (req, res) => {
  try {
    const {
      transId,
      refId,
      status,
      price,
      curr,
      method,
      email,
      payerName,
    } = req.body || {};

    if (!transId || !refId || !status) {
      return res.status(400).send("missing parameters");
    }

    const order = await Order.findById(refId);

    if (!order) {
      return res.status(404).send("order not found");
    }

    order.payment = {
      ...order.payment?.toObject?.(),
      provider: "comgate",
      transId: String(transId),
      status: String(status).toLowerCase(),
      currency: curr || order.payment?.currency || "EUR",
      method: method || order.payment?.method || "online",
      paidAt: status === "PAID" ? new Date() : order.payment?.paidAt || null,
      rawCallback: req.body,
    };

    if (status === "PAID") {
      order.status = "paid";
    } else if (status === "CANCELLED") {
      order.status = "cancelled";
    } else if (status === "PENDING") {
      order.status = "pending_payment";
    }

    await order.save();

    return res.status(200).send("OK");
  } catch (error) {
    return res.status(500).send("ERROR");
  }
};