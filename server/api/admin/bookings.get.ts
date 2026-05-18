import { defineEventHandler } from "h3";
import { desc, eq } from "drizzle-orm";

import { getDb } from "../../../src/db/client";
import { bookings, payments } from "../../../src/db/schema";
import { isAdminAuthed } from "../../lib/admin-auth";

export default defineEventHandler(async (event) => {
  if (!isAdminAuthed(event)) {
    event.node.res.statusCode = 401;
    return { error: "Unauthorized" };
  }

  const db = getDb();
  const rows = await db
    .select({
      id: bookings.id,
      customerName: bookings.customerName,
      email: bookings.email,
      phone: bookings.phone,
      telegramHandle: bookings.telegramHandle,
      appointmentStartAt: bookings.appointmentStartAt,
      appointmentEndAt: bookings.appointmentEndAt,
      status: bookings.status,
      createdAt: bookings.createdAt,
      paymentStatus: payments.status,
      amountRub: payments.amountRub,
      paymentId: payments.id,
    })
    .from(bookings)
    .leftJoin(payments, eq(payments.bookingId, bookings.id))
    .orderBy(desc(bookings.createdAt))
    .limit(100);

  return { bookings: rows };
});
