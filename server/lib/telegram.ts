type TelegramSendMessageResponse =
  | { ok: true; result: unknown }
  | { ok: false; description?: string; error_code?: number };

export function getTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const username = process.env.TELEGRAM_BOT_USERNAME;
  return { token, username };
}

export async function telegramSendMessage(chatId: string, text: string) {
  const { token } = getTelegramConfig();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const data = (await res.json()) as TelegramSendMessageResponse;
  if (!data.ok) {
    throw new Error(data.description ?? "Telegram sendMessage failed");
  }
}
