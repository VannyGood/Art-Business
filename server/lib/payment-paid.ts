import { eq } from "drizzle-orm";

import type { getDb } from "../../src/db/client";
import { bookings, payments, telegramLinks } from "../../src/db/schema";
import { MSG_CUSTOMER_AFTER_PAYMENT } from "./telegram-messages";
import { escapeHtml, telegramGetChat, telegramSendMessageSafe } from "./telegram";

type Db = ReturnType<typeof getDb>;

const PLAN_LABELS: Record<string, string> = {
  single: "Один урок",
  pack5: "Пакет 5 уроков",
  pack10: "Пакет 10 уроков",
};

function normalizeTelegramHandle(handle: string | null | undefined): string | null {
  if (!handle?.trim()) return null;
  const t = handle.trim();
  return t.startsWith("@") ? t : `@${t}`;
}

function formatTelegramUsername(username: string | null | undefined): string {
  if (!username?.trim()) return "—";
  const t = username.trim();
  return t.startsWith("@") ? t : `@${t}`;
}

export async function markBookingPaid(db: Db, paymentId: string): Promise<boolean> {
  const [p] = await db
    .select({ id: payments.id, status: payments.status, bookingId: payments.bookingId })
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!p) return false;
  if (p.status === "paid") return false;

  await db
    .update(payments)
    .set({ status: "paid", paidAt: new Date() })
    .where(eq(payments.id, paymentId));

  await db
    .update(bookings)
    .set({ status: "confirmed", updatedAt: new Date() })
    .where(eq(bookings.id, p.bookingId));

  return true;
}

/** Уведомление в группу админа и клиенту в ЛС (если уже нажал Start в боте). */
export async function notifyPaymentPaidTelegram(db: Db, paymentId: string): Promise<void> {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) {
    console.warn("[telegram] TELEGRAM_ADMIN_CHAT_ID not set — skip payment notify");
    return;
  }

  const [row] = await db
    .select({
      paymentId: payments.id,
      amountRub: payments.amountRub,
      metadata: payments.metadata,
      customerName: bookings.customerName,
      email: bookings.email,
      phone: bookings.phone,
      telegramHandle: bookings.telegramHandle,
      bookingId: bookings.id,
    })
    .from(payments)
    .innerJoin(bookings, eq(bookings.id, payments.bookingId))
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!row) return;

  const plan =
    row.metadata && typeof row.metadata === "object" && "plan" in row.metadata
      ? String((row.metadata as { plan?: string }).plan ?? "")
      : "";
  const planLabel = PLAN_LABELS[plan] ?? (plan || "—");
  const handleFromForm = normalizeTelegramHandle(row.telegramHandle);

  const [link] = await db
    .select({
      chatId: telegramLinks.chatId,
      telegramUserId: telegramLinks.telegramUserId,
      telegramUsername: telegramLinks.telegramUsername,
    })
    .from(telegramLinks)
    .where(eq(telegramLinks.bookingId, row.bookingId))
    .limit(1);

  let botUsername = link?.telegramUsername ?? null;
  let botUserId = link?.telegramUserId ?? null;

  if (link?.chatId && (!botUsername || !botUserId)) {
    const chat = await telegramGetChat(link.chatId);
    if (chat?.username) botUsername = chat.username;
    if (chat?.id) botUserId = String(chat.id);
  }

  const adminLines = [
    "💳 <b>Новая оплата</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(row.customerName)}`,
    `<b>Сумма:</b> ${row.amountRub} ₽`,
    `<b>Тариф:</b> ${escapeHtml(planLabel)}`,
    `<b>Email:</b> ${escapeHtml(row.email)}`,
    `<b>Телефон:</b> ${escapeHtml(row.phone)}`,
    "",
    `<b>Telegram (в форме):</b> ${escapeHtml(handleFromForm ?? "—")}`,
    `<b>Username (бот):</b> ${escapeHtml(formatTelegramUsername(botUsername))}`,
    `<b>Telegram ID:</b> ${escapeHtml(botUserId ?? "—")}`,
    `<b>Запись:</b> <code>${row.bookingId}</code>`,
  ];

  if (handleFromForm && !link?.chatId) {
    adminLines.push(
      "",
      "<i>Клиент ещё не нажал Start в боте — можно написать по username из формы.</i>",
    );
  }

  await telegramSendMessageSafe(adminChatId, adminLines.join("\n"));

  if (link?.chatId) {
    await telegramSendMessageSafe(link.chatId, MSG_CUSTOMER_AFTER_PAYMENT);
  }
}
