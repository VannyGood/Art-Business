import { eq } from "drizzle-orm";

import type { getDb } from "../../src/db/client";
import { bookings, payments } from "../../src/db/schema";
import { getEmailConfig, sendEmailSafe } from "./email";
import { notifyPaymentPaidTelegram } from "./payment-paid";

type Db = ReturnType<typeof getDb>;

const PLAN_LABELS: Record<string, string> = {
  single: "Один урок",
  pack5: "Пакет 5 уроков",
  pack10: "Пакет 10 уроков",
};

function normalizeTelegramHandle(handle: string | null | undefined): string {
  if (!handle?.trim()) return "—";
  const t = handle.trim();
  return t.startsWith("@") ? t : `@${t}`;
}

function formatDateRu(d: Date): string {
  return d.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
}

async function loadPaymentBooking(db: Db, paymentId: string) {
  const [row] = await db
    .select({
      paymentId: payments.id,
      amountRub: payments.amountRub,
      metadata: payments.metadata,
      customerName: bookings.customerName,
      email: bookings.email,
      phone: bookings.phone,
      telegramHandle: bookings.telegramHandle,
      appointmentStartAt: bookings.appointmentStartAt,
      bookingId: bookings.id,
    })
    .from(payments)
    .innerJoin(bookings, eq(bookings.id, payments.bookingId))
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!row) return null;

  const plan =
    row.metadata && typeof row.metadata === "object" && "plan" in row.metadata
      ? String((row.metadata as { plan?: string }).plan ?? "")
      : "";
  const planLabel = PLAN_LABELS[plan] ?? (plan || "—");

  return { ...row, planLabel };
}

async function notifyPaymentPaidEmail(db: Db, paymentId: string): Promise<void> {
  const row = await loadPaymentBooking(db, paymentId);
  if (!row) return;

  const { adminEmail } = getEmailConfig();
  const lessonWhen = formatDateRu(new Date(row.appointmentStartAt));
  const tg = normalizeTelegramHandle(row.telegramHandle);

  await sendEmailSafe({
    to: adminEmail,
    subject: `Новая оплата — ${row.customerName}, ${row.amountRub} ₽`,
    text: [
      "Новая оплата на сайте alyonart.online",
      "",
      `Имя: ${row.customerName}`,
      `Сумма: ${row.amountRub} ₽`,
      `Тариф: ${row.planLabel}`,
      `Занятие (если выбрано): ${lessonWhen}`,
      `Email: ${row.email}`,
      `Телефон: ${row.phone}`,
      `Telegram: ${tg}`,
      `Номер записи: ${row.bookingId}`,
    ].join("\n"),
  });

  await sendEmailSafe({
    to: row.email,
    subject: "Оплата получена — студия Алёны",
    text: [
      `Здравствуйте, ${row.customerName}!`,
      "",
      "Спасибо за оплату!",
      "",
      "Скоро с вами свяжется Алёна. Если есть вопросы — просто ответьте на это письмо.",
      "",
      `Сумма: ${row.amountRub} ₽`,
      `Тариф: ${row.planLabel}`,
      "",
      "С уважением,",
      "Студия Алёны",
      "https://alyonart.online",
    ].join("\n"),
  });
}

/** Email (основной канал) + Telegram по желанию, если настроен. */
export async function notifyPaymentPaid(db: Db, paymentId: string): Promise<void> {
  await notifyPaymentPaidEmail(db, paymentId);
  await notifyPaymentPaidTelegram(db, paymentId);
}
