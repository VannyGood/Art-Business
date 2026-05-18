import { defineEventHandler, getQuery } from "h3";
import { and, gte, lte } from "drizzle-orm";

import { getDb } from "../../src/db/client";
import { adminAvailabilitySlots } from "../../src/db/schema";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const from = typeof query.from === "string" ? query.from : null;
  const to = typeof query.to === "string" ? query.to : null;

  const now = new Date();
  const fromDate = from ? new Date(from) : now;
  const toDate = to ? new Date(to) : new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);

  const db = getDb();
  const rows = await db
    .select({
      id: adminAvailabilitySlots.id,
      startAt: adminAvailabilitySlots.startAt,
      endAt: adminAvailabilitySlots.endAt,
      capacity: adminAvailabilitySlots.capacity,
      notes: adminAvailabilitySlots.notes,
    })
    .from(adminAvailabilitySlots)
    .where(
      and(
        gte(adminAvailabilitySlots.startAt, fromDate),
        lte(adminAvailabilitySlots.startAt, toDate),
      ),
    )
    .orderBy(adminAvailabilitySlots.startAt);

  return { slots: rows };
});
