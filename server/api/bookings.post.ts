import { defineEventHandler, readBody } from "h3";
import { eq } from "drizzle-orm";

import { amountRubForPlan } from "../../src/lib/pricing";
import { getDb } from "../../src/db/client";
import { adminAvailabilitySlots, bookings, payments } from "../../src/db/schema";

type CreateBookingBody = {
  customerName: string;
  email: string;
  phone: string;
  telegramHandle?: string;
  slotId: string;
  plan: "single" | "pack5" | "pack10";
};

function placeholderAppointment() {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 14);
  start.setUTCHours(12, 0, 0, 0);
  const end = new Date(start);
  end.setUTCHours(13, 0, 0, 0);
  return { start, end };
}

function bookingNotesForPlan(plan: CreateBookingBody["plan"]): string | undefined {
  if (plan === "pack5") return "Пакет 5 уроков — время подберёт преподаватель";
  if (plan === "pack10") return "Пакет 10 уроков — время выберете позже";
  return undefined;
}

export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = (await readBody(event)) as Partial<CreateBookingBody>;

  if (
    !body.customerName ||
    !body.email ||
    !body.phone ||
    !body.plan ||
    !["single", "pack5", "pack10"].includes(body.plan)
  ) {
    event.node.res.statusCode = 400;
    return { error: "Invalid request" };
  }

  const isSingle = body.plan === "single";
  if (isSingle && !body.slotId) {
    event.node.res.statusCode = 400;
    return { error: "Выберите время занятия" };
  }

  let appointmentStartAt: Date;
  let appointmentEndAt: Date;

  if (isSingle) {
    const [slot] = await db
      .select({
        id: adminAvailabilitySlots.id,
        startAt: adminAvailabilitySlots.startAt,
        endAt: adminAvailabilitySlots.endAt,
      })
      .from(adminAvailabilitySlots)
      .where(eq(adminAvailabilitySlots.id, body.slotId!))
      .limit(1);

    if (!slot) {
      event.node.res.statusCode = 404;
      return { error: "Slot not found" };
    }
    appointmentStartAt = slot.startAt;
    appointmentEndAt = slot.endAt;
  } else {
    const placeholder = placeholderAppointment();
    appointmentStartAt = placeholder.start;
    appointmentEndAt = placeholder.end;
  }

  const amountRub = amountRubForPlan(body.plan);

  const [booking] = await db
    .insert(bookings)
    .values({
      customerName: body.customerName,
      email: body.email,
      phone: body.phone,
      telegramHandle: body.telegramHandle,
      appointmentStartAt,
      appointmentEndAt,
      status: "pending",
      notes: bookingNotesForPlan(body.plan),
    })
    .returning({ id: bookings.id });

  const [payment] = await db
    .insert(payments)
    .values({
      bookingId: booking.id,
      provider: "card",
      amountRub,
      status: "created",
      metadata: { plan: body.plan },
    })
    .returning({ id: payments.id });

  return {
    bookingId: booking.id,
    paymentId: payment.id,
    checkoutUrl: `/payment/${payment.id}`,
  };
});
