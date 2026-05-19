import { defineEventHandler } from "h3";
import { eq } from "drizzle-orm";

import { getDb } from "../../../src/db/client";
import { payments } from "../../../src/db/schema";
import { isAdminAuthed } from "../../lib/admin-auth";
import { parseJsonBody } from "../../lib/parse-json-body";
import { notifyPaymentPaidEmailOnly } from "../../lib/payment-notify";

export default defineEventHandler(async (event) => {
  if (!isAdminAuthed(event)) {
    event.node.res.statusCode = 401;
    return { error: "Unauthorized" };
  }

  let body: { paymentId?: string };
  try {
    body = await parseJsonBody(event);
  } catch {
    event.node.res.statusCode = 400;
    return { error: "Invalid JSON" };
  }

  const paymentId = body.paymentId?.trim();
  if (!paymentId) {
    event.node.res.statusCode = 400;
    return { error: "paymentId required" };
  }

  const db = getDb();
  const [p] = await db
    .select({ status: payments.status })
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!p) {
    event.node.res.statusCode = 404;
    return { error: "Payment not found" };
  }

  if (p.status !== "paid") {
    return { ok: false, error: "Payment is not paid yet" };
  }

  await notifyPaymentPaidEmailOnly(db, paymentId);
  return { ok: true };
});
