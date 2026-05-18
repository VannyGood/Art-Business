import { defineEventHandler } from "h3";
import { eq } from "drizzle-orm";

import { getDb } from "../../../../src/db/client";
import { bookings, payments } from "../../../../src/db/schema";

export default defineEventHandler(async (event) => {
  const paymentId = event.context.params?.paymentId;
  if (!paymentId) {
    event.node.res.statusCode = 400;
    return { error: "Missing paymentId" };
  }

  const db = getDb();
  const [p] = await db
    .select({
      id: payments.id,
      status: payments.status,
      bookingId: payments.bookingId,
    })
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

  await db
    .update(payments)
    .set({
      status: "paid",
      paidAt: new Date(),
    })
    .where(eq(payments.id, paymentId));

  await db
    .update(bookings)
    .set({
      status: "confirmed",
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, p.bookingId));

  return { ok: true };
});
