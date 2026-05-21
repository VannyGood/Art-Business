import { and, eq, ne, or, sql } from "drizzle-orm";

import type { getDb } from "../../src/db/client";
import { bookings, payments } from "../../src/db/schema";

type Db = ReturnType<typeof getDb>;

export type SlotRef = {
  id: string;
  startAt: Date;
  endAt: Date;
  capacity: number;
};

/** Бронь слота: оплачено или ожидает оплаты (не отменено). */
function activeReservationCondition() {
  return and(
    sql`${payments.metadata}->>'plan' = 'single'`,
    ne(bookings.status, "cancelled"),
    or(
      eq(payments.status, "paid"),
      and(
        eq(payments.status, "created"),
        or(eq(bookings.status, "pending"), eq(bookings.status, "confirmed")),
      ),
    ),
  );
}

/** Запись относится к этому слоту (по slotId в metadata или по времени — старые записи). */
function matchesSlot(slot: SlotRef) {
  return or(
    sql`${payments.metadata}->>'slotId' = ${slot.id}`,
    and(
      or(
        sql`${payments.metadata}->>'slotId' is null`,
        sql`${payments.metadata}->>'slotId' = ''`,
      ),
      eq(bookings.appointmentStartAt, slot.startAt),
      eq(bookings.appointmentEndAt, slot.endAt),
    ),
  );
}

export async function countActiveReservationsForSlot(db: Db, slot: SlotRef): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(payments)
    .innerJoin(bookings, eq(bookings.id, payments.bookingId))
    .where(and(activeReservationCondition(), matchesSlot(slot)));

  return row?.count ?? 0;
}

export async function isSlotAvailable(db: Db, slot: SlotRef): Promise<boolean> {
  const count = await countActiveReservationsForSlot(db, slot);
  return count < slot.capacity;
}

/** id слотов, у которых reservations >= capacity. */
export async function getFullyBookedSlotIds(db: Db, slots: SlotRef[]): Promise<Set<string>> {
  const booked = new Set<string>();
  for (const slot of slots) {
    const count = await countActiveReservationsForSlot(db, slot);
    if (count >= slot.capacity) booked.add(slot.id);
  }
  return booked;
}
