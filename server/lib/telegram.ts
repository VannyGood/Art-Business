type TelegramApiResponse<T> =
  | { ok: true; result: T }
  | { ok: false; description?: string; error_code?: number };

type TelegramSendMessageResponse = TelegramApiResponse<unknown>;

type TelegramChat = {
  id: number;
  type: string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

export function getTelegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const username = process.env.TELEGRAM_BOT_USERNAME;
  return { token, username };
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function telegramApiGet<T>(method: string, params: Record<string, string>): Promise<T | null> {
  const { token } = getTelegramConfig();
  if (!token) return null;

  const qs = new URLSearchParams(params).toString();
  const url = `https://api.telegram.org/bot${token}/${method}?${qs}`;
  const res = await fetch(url);
  const data = (await res.json()) as TelegramApiResponse<T>;
  if (!data.ok) {
    console.warn(`[telegram] ${method} failed:`, data.description);
    return null;
  }
  return data.result;
}

export async function telegramGetChat(
  chatId: string,
): Promise<{ id: number; username?: string } | null> {
  const chat = await telegramApiGet<TelegramChat>("getChat", { chat_id: chatId });
  if (!chat) return null;
  return { id: chat.id, username: chat.username };
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

/** Не роняет оплату, если Telegram недоступен. */
export async function telegramSendMessageSafe(chatId: string, text: string): Promise<void> {
  try {
    await telegramSendMessage(chatId, text);
  } catch (err) {
    console.error("[telegram] sendMessage failed:", err);
  }
}
