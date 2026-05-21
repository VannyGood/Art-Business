import { defineEventHandler } from "h3";
import { eq } from "drizzle-orm";

import { getDb } from "../../../../src/db/client";
import { bookings, payments } from "../../../../src/db/schema";
import { isAdminAuthed } from "../../../lib/admin-auth";
import { parseJsonBody } from "../../../lib/parse-json-body";

type Body = {
  paymentId?: string;
  status?: "paid" | "unpaid";
};

export default defineEventHandler(async (event) => {
  if (!isAdminAuthed(event)) {
    event.node.res.statusCode = 401;
    return { error: "Unauthorized" };
  }

  let body: Body;
  try {
    body = await parseJsonBody<Body>(event);
  } catch {
    event.node.res.statusCode = 400;
    return { error: "Invalid JSON" };
  }

  const paymentId = body.paymentId?.trim();
  if (!paymentId || !["paid", "unpaid"].includes(body.status ?? "")) {
    event.node.res.statusCode = 400;
    return { error: "paymentId and status (paid|unpaid) required" };
  }

  const db = getDb();
  const [p] = await db
    .select({ id: payments.id, bookingId: payments.bookingId })
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!p) {
    event.node.res.statusCode = 404;
    return { error: "Payment not found" };
  }

  const now = new Date();

  if (body.status === "paid") {
    await db
      .update(payments)
      .set({ status: "paid", paidAt: now })
      .where(eq(payments.id, paymentId));
    await db
      .update(bookings)
      .set({ status: "confirmed", updatedAt: now })
      .where(eq(bookings.id, p.bookingId));
  } else {
    await db
      .update(payments)
      .set({ status: "created", paidAt: null })
      .where(eq(payments.id, paymentId));
    await db
      .update(bookings)
      .set({ status: "pending", updatedAt: now })
      .where(eq(bookings.id, p.bookingId));
  }

  return { ok: true, status: body.status === "paid" ? "paid" : "created" };
});
