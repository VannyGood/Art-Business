import { defineEventHandler, getHeader } from "h3";
import { and, eq, gte, lt } from "drizzle-orm";

import { getDb } from "../../../src/db/client";
import { bookings, telegramLinks } from "../../../src/db/schema";
import { telegramSendMessage } from "../../lib/telegram";

function getMoscowDayRangeUtc(now: Date) {
  const offsetMs = 3 * 60 * 60 * 1000; // Europe/Moscow (no DST)
  const shifted = new Date(now.getTime() + offsetMs);
  shifted.setUTCHours(0, 0, 0, 0);
  const startUtc = new Date(shifted.getTime() - offsetMs);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
  return { startUtc, endUtc };
}

export default defineEventHandler(async (event) => {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const got = getHeader(event, "x-cron-secret");
    if (got !== expected) {
      event.node.res.statusCode = 401;
      return { error: "Unauthorized" };
    }
  }

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) {
    event.node.res.statusCode = 500;
    return { error: "TELEGRAM_ADMIN_CHAT_ID is required" };
  }

  const { startUtc, endUtc } = getMoscowDayRangeUtc(new Date());

  const db = getDb();
  const todays = await db
    .select({
      id: bookings.id,
      customerName: bookings.customerName,
      appointmentStartAt: bookings.appointmentStartAt,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "confirmed"),
        gte(bookings.appointmentStartAt, startUtc),
        lt(bookings.appointmentStartAt, endUtc),
      ),
    )
    .orderBy(bookings.appointmentStartAt);

  const lines = todays.map((b) => {
    const start = new Date(b.appointmentStartAt).toLocaleString("ru-RU");
    return `• ${start} — ${b.customerName} (${b.id})`;
  });

  await telegramSendMessage(
    adminChatId,
    lines.length
      ? `<b>Занятия сегодня</b>\n${lines.join("\n")}`
      : "<b>Занятия сегодня</b>\nНет занятий на сегодня.",
  );

  let customerSent = 0;
  for (const b of todays) {
    const [link] = await db
      .select({ chatId: telegramLinks.chatId })
      .from(telegramLinks)
      .where(eq(telegramLinks.bookingId, b.id))
      .limit(1);
    if (!link) continue;

    const start = new Date(b.appointmentStartAt).toLocaleString("ru-RU");
    await telegramSendMessage(
      link.chatId,
      `Напоминание: сегодня занятие в <b>${start}</b>.\nЕсли нужно перенести — напишите Алёне.`,
    );
    customerSent++;
  }

  return { ok: true, bookings: todays.length, customerSent };
});
