import { defineEventHandler, readBody } from "h3";
import { and, eq } from "drizzle-orm";

import { getDb } from "../../../src/db/client";
import { bookings, payments, telegramLinks } from "../../../src/db/schema";
import { MSG_CUSTOMER_AFTER_PAYMENT, MSG_CUSTOMER_LINKED_REMINDERS } from "../../lib/telegram-messages";
import { telegramSendMessageSafe } from "../../lib/telegram";

type TelegramUpdate = {
  message?: {
    message_id: number;
    from?: { id: number; username?: string; first_name?: string };
    chat: { id: number; type?: string };
    text?: string;
  };
};

function extractStartPayload(text: string): string | null {
  const m = text.match(/^\/start(?:@[\w_]+)?\s+(.+)$/i);
  return m?.[1]?.trim() ?? null;
}

export default defineEventHandler(async (event) => {
  const update = (await readBody(event)) as TelegramUpdate;
  const msg = update.message;
  if (!msg?.chat?.id || !msg.text) return { ok: true };

  // Только личные чаты — не привязываем booking к группе
  if (msg.chat.type && msg.chat.type !== "private") return { ok: true };

  const payload = extractStartPayload(msg.text);
  if (!payload) return { ok: true };

  if (!payload.startsWith("booking_")) return { ok: true };

  const bookingId = payload.slice("booking_".length);
  const chatId = String(msg.chat.id);
  const telegramUserId = msg.from?.id != null ? String(msg.from.id) : null;
  const telegramUsername = msg.from?.username ?? null;

  const db = getDb();

  const updated = await db
    .update(telegramLinks)
    .set({
      bookingId,
      chatId,
      telegramUserId,
      telegramUsername,
      linkedAt: new Date(),
    })
    .where(eq(telegramLinks.chatId, chatId))
    .returning({ id: telegramLinks.id });

  if (updated.length === 0) {
    await db.insert(telegramLinks).values({
      bookingId,
      chatId,
      telegramUserId,
      telegramUsername,
    });
  }

  const [paid] = await db
    .select({ id: payments.id })
    .from(payments)
    .innerJoin(bookings, eq(bookings.id, payments.bookingId))
    .where(and(eq(bookings.id, bookingId), eq(payments.status, "paid")))
    .limit(1);

  if (paid) {
    await telegramSendMessageSafe(chatId, MSG_CUSTOMER_AFTER_PAYMENT);
  } else {
    const [booking] = await db
      .select({ status: bookings.status })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    await telegramSendMessageSafe(
      chatId,
      booking?.status === "confirmed"
        ? MSG_CUSTOMER_AFTER_PAYMENT
        : MSG_CUSTOMER_LINKED_REMINDERS,
    );
  }

  return { ok: true };
});
