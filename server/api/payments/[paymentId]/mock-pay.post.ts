import { defineEventHandler } from "h3";
import { eq } from "drizzle-orm";

import { getDb } from "../../../../src/db/client";
import { payments } from "../../../../src/db/schema";
import { markBookingPaid, notifyPaymentPaidTelegram } from "../../../lib/payment-paid";

export default defineEventHandler(async (event) => {
  const paymentId = event.context.params?.paymentId;
  if (!paymentId) {
    event.node.res.statusCode = 400;
    return { error: "Missing paymentId" };
  }

  const db = getDb();
  const [p] = await db
    .select({ id: payments.id, status: payments.status })
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!p) {
    event.node.res.statusCode = 404;
    return { error: "Payment not found" };
  }

  if (p.status === "paid") {
    return { ok: true };
  }

  const marked = await markBookingPaid(db, paymentId);
  if (marked) {
    await notifyPaymentPaidTelegram(db, paymentId);
  }

  return { ok: true };
});
