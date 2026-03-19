// services/comgate.service.js
import axios from "axios";

const COMGATE_BASE_URL =
  process.env.COMGATE_BASE_URL || "https://payments.comgate.cz/v1.0";

const COMGATE_MERCHANT = process.env.COMGATE_MERCHANT;
const COMGATE_SECRET = process.env.COMGATE_SECRET;
const COMGATE_TEST = String(process.env.COMGATE_TEST) === "true";

export async function createComgatePayment({
  order,
  amount,
  currency = "EUR",
  customerEmail,
  customerPhone,
  customerFullName,
}) {
  const params = new URLSearchParams();

  params.append("merchant", COMGATE_MERCHANT);
  params.append("secret", COMGATE_SECRET);
  params.append("prepareOnly", "true");
  params.append("test", COMGATE_TEST ? "true" : "false");

  // сумма в центах
  params.append("price", String(amount));
  params.append("curr", currency);

  // у Comgate label короткий
  params.append("label", `Order ${order.orderNumber || order._id}`.slice(0, 16));

  // refId — ссылка на заказ в твоей системе
  params.append("refId", String(order._id));

  // показать все разрешённые способы
  params.append("method", "ALL");

  // страна влияет на набор методов
  params.append("country", "SK");

  if (customerEmail) params.append("email", customerEmail);
  if (customerPhone) params.append("phone", customerPhone);
  if (customerFullName) params.append("fullName", customerFullName);

  params.append(
    "url_paid",
    `${process.env.APP_URL}/checkout/success?comgate=paid&id=\${id}&refId=\${refId}`
  );
  params.append(
    "url_cancelled",
    `${process.env.APP_URL}/checkout/fail?comgate=cancelled&id=\${id}&refId=\${refId}`
  );
  params.append(
    "url_pending",
    `${process.env.APP_URL}/checkout/pending?comgate=pending&id=\${id}&refId=\${refId}`
  );

  const { data } = await axios.post(
    `${COMGATE_BASE_URL}/create`,
    params.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  // Comgate в POST API часто возвращает x-www-form-urlencoded строку
  const parsed = new URLSearchParams(data);

  const code = parsed.get("code");
  const message = parsed.get("message");
  const transId = parsed.get("transId");
  const redirect = parsed.get("redirect");

  if (code !== "0") {
    throw new Error(`Comgate create error: ${message || code}`);
  }

  return {
    transId,
    redirect,
    raw: Object.fromEntries(parsed.entries()),
  };
}