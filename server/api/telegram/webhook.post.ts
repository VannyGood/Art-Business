import { defineEventHandler, readBody } from "h3";
import { eq } from "drizzle-orm";

import { getDb } from "../../../src/db/client";
import { telegramLinks } from "../../../src/db/schema";
import { telegramSendMessage } from "../../lib/telegram";

type TelegramUpdate = {
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
  };
};

function extractStartPayload(text: string): string | null {
  // Typical: "/start payload"
  const m = text.match(/^\/start(?:@[\w_]+)?\s+(.+)$/i);
  return m?.[1]?.trim() ?? null;
}

export default defineEventHandler(async (event) => {
  const update = (await readBody(event)) as TelegramUpdate;
  const msg = update.message;
  if (!msg?.chat?.id || !msg.text) return { ok: true };

  const payload = extractStartPayload(msg.text);
  if (!payload) return { ok: true };

  if (payload.startsWith("booking_")) {
    const bookingId = payload.slice("booking_".length);
    const chatId = String(msg.chat.id);

    const db = getDb();

    // Upsert-ish: try update by chatId, else insert.
    const updated = await db
      .update(telegramLinks)
      .set({
        bookingId,
        chatId,
        linkedAt: new Date(),
      })
      .where(eq(telegramLinks.chatId, chatId))
      .returning({ id: telegramLinks.id });

    if (updated.length === 0) {
      await db.insert(telegramLinks).values({
        bookingId,
        chatId,
      });
    }

    await telegramSendMessage(
      chatId,
      "Готово! Я буду присылать напоминания в день занятия. Если нужно изменить дату — напишите Алёне.",
    );
  }

  return { ok: true };
});
