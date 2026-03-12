import { Order } from "../models/Order.model.js";
import { createGoPayPayment, getGoPayPayment } from "../services/gopay.js";

function mapOrderItemsToGoPay(order) {
  return (order.items || []).map((item) => ({
    type: "ITEM",
    name: item.title,
    count: Number(item.quantity || 1),
    amount: Math.round(Number(item.discountedTotal || 0) * 100),
  }));
}

export const createOrderGoPayPayment = async (req, res) => {
  try {
    const { orderId } = req.body || {};

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payload = {
      payer: {
        default_payment_instrument: "PAYMENT_CARD",
        allowed_payment_instruments: ["PAYMENT_CARD"],
        allowed_swifts: ["PAYMENT_CARD"],
        contact: {
          first_name: order.customer?.name || "Customer",
          email: order.customer?.email || undefined,
          phone_number: order.customer?.phone || undefined,
        },
      },
      target: {
        type: "ACCOUNT",
        goid: Number(process.env.GOPAY_GOID),
      },
      amount: Math.round(Number(order.totals?.total || 0) * 100),
      currency: order.totals?.currency || "EUR",
      order_number: order.orderNumber,
      order_description: `Order ${order.orderNumber}`,
      items: mapOrderItemsToGoPay(order),
      callback: {
        return_url: process.env.GOPAY_RETURN_URL,
        notification_url: process.env.GOPAY_NOTIFY_URL,
      },
      lang: "en",
    };

    const payment = await createGoPayPayment(payload);

    order.payment = {
      ...(order.payment || {}),
      provider: "gopay",
      status: payment?.state || "CREATED",
      transactionId: String(payment?.id || ""),
      gwUrl: payment?.gw_url || "",
      raw: payment,
    };

    await order.save();

    return res.json({
      ok: true,
      paymentId: payment?.id,
      gwUrl: payment?.gw_url,
      state: payment?.state,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create GoPay payment",
      error: String(error?.message || error),
    });
  }
};

export const gopayReturn = async (req, res) => {
  try {
    const paymentId = req.query?.id;
    if (!paymentId) {
      return res.redirect(process.env.GOPAY_FRONT_FAIL_URL);
    }

    const payment = await getGoPayPayment(paymentId);

    const order = await Order.findOne({
      "payment.transactionId": String(paymentId),
    });

    if (order) {
      order.payment = {
        ...(order.payment || {}),
        status: payment?.state || order.payment?.status,
        raw: payment,
      };

      if (payment?.state === "PAID") {
        order.status = "confirmed";
        order.payment.status = "paid";
      }

      await order.save();
    }

    const redirectUrl =
      payment?.state === "PAID"
        ? process.env.GOPAY_FRONT_SUCCESS_URL
        : process.env.GOPAY_FRONT_FAIL_URL;

    return res.redirect(`${redirectUrl}?paymentId=${paymentId}`);
  } catch (error) {
    return res.redirect(process.env.GOPAY_FRONT_FAIL_URL);
  }
};

export const gopayNotify = async (req, res) => {
  try {
    const paymentId = req.query?.id;
    if (!paymentId) {
      return res.status(400).send("missing id");
    }

    const payment = await getGoPayPayment(paymentId);

    const order = await Order.findOne({
      "payment.transactionId": String(paymentId),
    });

    if (order) {
      order.payment = {
        ...(order.payment || {}),
        status: payment?.state || order.payment?.status,
        raw: payment,
      };

      if (payment?.state === "PAID") {
        order.status = "confirmed";
        order.payment.status = "paid";
      }

      if (["CANCELED", "TIMEOUT", "FAILED"].includes(payment?.state)) {
        order.payment.status = "failed";
      }

      await order.save();
    }

    return res.status(200).send("OK");
  } catch (error) {
    return res.status(500).send("ERROR");
  }
};