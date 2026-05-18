import { defineEventHandler } from "h3";
import { eq } from "drizzle-orm";

import { getDb } from "../../../../src/db/client";
import { bookings, payments } from "../../../../src/db/schema";
import { getTelegramConfig } from "../../../lib/telegram";

export default defineEventHandler(async (event) => {
  const paymentId = event.context.params?.paymentId;
  if (!paymentId) {
    event.node.res.statusCode = 400;
    return "Missing paymentId";
  }

  const db = getDb();
  const [row] = await db
    .select({
      paymentId: payments.id,
      status: payments.status,
      amountRub: payments.amountRub,
      bookingId: payments.bookingId,
      customerName: bookings.customerName,
      startAt: bookings.appointmentStartAt,
    })
    .from(payments)
    .innerJoin(bookings, eq(bookings.id, payments.bookingId))
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!row) {
    event.node.res.statusCode = 404;
    return "Payment not found";
  }

  const { username } = getTelegramConfig();
  const connectUrl = username ? `https://t.me/${username}?start=booking_${row.bookingId}` : null;

  event.node.res.setHeader("content-type", "text/html; charset=utf-8");
  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Оплата</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; max-width: 720px; margin: 0 auto; }
      .card { border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; }
      button { border: 0; border-radius: 999px; padding: 12px 16px; background: #111827; color: white; cursor: pointer; }
      button:disabled { opacity: .6; cursor: not-allowed; }
      .muted { color: #6b7280; }
      .row { display:flex; gap: 12px; align-items: center; flex-wrap: wrap; }
      code { background: #f3f4f6; padding: 2px 6px; border-radius: 8px; }
    </style>
  </head>
  <body>
    <h1>Оплата</h1>
    <p class="muted">Пока это тестовая страница (заглушка) для карты/SBP.</p>
    <div class="card">
      <p><b>Сумма:</b> ${row.amountRub} ₽</p>
      <p><b>Занятие:</b> ${new Date(row.startAt).toLocaleString()}</p>
      <p><b>Статус:</b> <code id="status">${row.status}</code></p>
      ${
        connectUrl
          ? `<p class="muted">После оплаты подключи Telegram, чтобы получить напоминание: <a href="${connectUrl}" target="_blank" rel="noreferrer">Открыть бота</a></p>`
          : `<p class="muted">Чтобы подключить Telegram-напоминания, добавь env переменную <code>TELEGRAM_BOT_USERNAME</code>.</p>`
      }
      <div class="row">
        <button id="payBtn">Оплатить (тест)</button>
        <span class="muted">paymentId: <code>${row.paymentId}</code></span>
      </div>
      <p id="msg" class="muted"></p>
    </div>
    <script>
      const btn = document.getElementById('payBtn')
      const status = document.getElementById('status')
      const msg = document.getElementById('msg')
      async function refresh() {
        const res = await fetch('/api/payments/${row.paymentId}/status')
        const data = await res.json()
        status.textContent = data.status
        btn.disabled = data.status === 'paid'
      }
      btn.addEventListener('click', async () => {
        btn.disabled = true
        msg.textContent = 'Обрабатываю...'
        const res = await fetch('/api/payments/${row.paymentId}/mock-pay', { method: 'POST' })
        const data = await res.json()
        msg.textContent = data.ok ? 'Готово! Оплата отмечена.' : (data.error || 'Ошибка')
        await refresh()
      })
      refresh().catch(() => {})
    </script>
  </body>
</html>`;
});
