// ================================
// services/telegram.js
// ================================
const TG_API = "https://api.telegram.org";

export async function sendTelegramMessage({ token, chatId, text }) {
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is missing");
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID is missing");

  const url = `${TG_API}/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  const data = await res.json();
  if (!res.ok || !data?.ok) {
    throw new Error(data?.description || "Telegram sendMessage failed");
  }

  return data?.result; // { message_id, ... }
}
