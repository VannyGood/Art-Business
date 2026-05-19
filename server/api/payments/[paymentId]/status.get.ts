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
  const [row] = await db
    .select({
      status: payments.status,
      amountRub: payments.amountRub,
      metadata: payments.metadata,
      customerName: bookings.customerName,
      appointmentStartAt: bookings.appointmentStartAt,
    })
    .from(payments)
    .innerJoin(bookings, eq(bookings.id, payments.bookingId))
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!row) {
    event.node.res.statusCode = 404;
    return { error: "Not found" };
  }

  const plan =
    row.metadata && typeof row.metadata === "object" && "plan" in row.metadata
      ? String((row.metadata as { plan?: string }).plan ?? "")
      : null;

  return {
    status: row.status,
    amountRub: row.amountRub,
    customerName: row.customerName,
    appointmentStartAt: row.appointmentStartAt.toISOString(),
    plan,
  };
});
