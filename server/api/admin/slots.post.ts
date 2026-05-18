import { defineEventHandler, readBody } from "h3";

import { getDb } from "../../../src/db/client";
import { adminAvailabilitySlots } from "../../../src/db/schema";
import { isAdminAuthed } from "../../lib/admin-auth";

export default defineEventHandler(async (event) => {
  if (!isAdminAuthed(event)) {
    event.node.res.statusCode = 401;
    return { error: "Unauthorized" };
  }

  // Prefer Request.json() — readBody can be empty when routed via TanStack Start + h3.
  let body: {
    startAt?: string;
    endAt?: string;
    capacity?: number;
    notes?: string;
  };
  const contentType = event.req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = (await event.req.json()) as typeof body;
  } else {
    body = (await readBody(event)) as typeof body;
  }

  if (!body.startAt || !body.endAt) {
    event.node.res.statusCode = 400;
    return { error: "startAt and endAt are required" };
  }

  const startAt = new Date(body.startAt);
  const endAt = new Date(body.endAt);
  if (!(startAt instanceof Date) || Number.isNaN(startAt.getTime())) {
    event.node.res.statusCode = 400;
    return { error: "Invalid startAt" };
  }
  if (!(endAt instanceof Date) || Number.isNaN(endAt.getTime())) {
    event.node.res.statusCode = 400;
    return { error: "Invalid endAt" };
  }
  if (endAt <= startAt) {
    event.node.res.statusCode = 400;
    return { error: "endAt must be after startAt" };
  }

  const db = getDb();
  const [slot] = await db
    .insert(adminAvailabilitySlots)
    .values({
      startAt,
      endAt,
      capacity: body.capacity ?? 1,
      notes: body.notes,
    })
    .returning({
      id: adminAvailabilitySlots.id,
      startAt: adminAvailabilitySlots.startAt,
      endAt: adminAvailabilitySlots.endAt,
      capacity: adminAvailabilitySlots.capacity,
      notes: adminAvailabilitySlots.notes,
    });

  return { slot };
});
