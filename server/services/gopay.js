import axios from "axios";

const GOPAY_IS_SANDBOX = String(process.env.GOPAY_IS_SANDBOX) === "true";

const GOPAY_API_BASE = GOPAY_IS_SANDBOX
  ? "https://gw.sandbox.gopay.com/api"
  : "https://gate.gopay.cz/api";

const GOPAY_GATEWAY_BASE = GOPAY_IS_SANDBOX
  ? "https://gw.sandbox.gopay.com"
  : "https://gate.gopay.cz";

function getBasicAuthHeader() {
  const raw = `${process.env.GOPAY_CLIENT_ID}:${process.env.GOPAY_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

export async function getGoPayToken(scope = "payment-create") {
  const { data } = await axios.post(
    `${GOPAY_API_BASE}/oauth2/token`,
    new URLSearchParams({
      grant_type: "client_credentials",
      scope,
    }).toString(),
    {
      headers: {
        Authorization: getBasicAuthHeader(),
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return data?.access_token;
}

export async function createGoPayPayment(payload) {
  const token = await getGoPayToken("payment-create");

  const { data } = await axios.post(
    `${GOPAY_API_BASE}/payments/payment`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  return data;
}

export async function getGoPayPayment(paymentId) {
  const token = await getGoPayToken("payment-all");

  const { data } = await axios.get(
    `${GOPAY_API_BASE}/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  return data;
}

export { GOPAY_GATEWAY_BASE, GOPAY_API_BASE };