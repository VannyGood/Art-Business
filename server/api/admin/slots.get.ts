import { defineEventHandler } from "h3";
import { and, gte } from "drizzle-orm";

import { getDb } from "../../../src/db/client";
import { adminAvailabilitySlots } from "../../../src/db/schema";
import { isAdminAuthed } from "../../lib/admin-auth";

export default defineEventHandler(async (event) => {
  if (!isAdminAuthed(event)) {
    event.node.res.statusCode = 401;
    return { error: "Unauthorized" };
  }

  const db = getDb();
  const now = new Date();
  const rows = await db
    .select({
      id: adminAvailabilitySlots.id,
      startAt: adminAvailabilitySlots.startAt,
      endAt: adminAvailabilitySlots.endAt,
      capacity: adminAvailabilitySlots.capacity,
      notes: adminAvailabilitySlots.notes,
    })
    .from(adminAvailabilitySlots)
    .where(and(gte(adminAvailabilitySlots.startAt, now)))
    .orderBy(adminAvailabilitySlots.startAt);

  return { slots: rows };
});
