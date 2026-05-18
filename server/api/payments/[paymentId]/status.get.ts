import { defineEventHandler } from "h3";
import { eq } from "drizzle-orm";

import { getDb } from "../../../../src/db/client";
import { payments } from "../../../../src/db/schema";

export default defineEventHandler(async (event) => {
  const paymentId = event.context.params?.paymentId;
  if (!paymentId) {
    event.node.res.statusCode = 400;
    return { error: "Missing paymentId" };
  }

  const db = getDb();
  const [row] = await db
    .select({ status: payments.status })
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!row) {
    event.node.res.statusCode = 404;
    return { error: "Not found" };
  }

  return { status: row.status };
});
