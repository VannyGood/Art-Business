import { defineEventHandler } from "h3";
import { eq } from "drizzle-orm";

import { getDb } from "../../../src/db/client";
import { adminAvailabilitySlots } from "../../../src/db/schema";
import { isAdminAuthed } from "../../lib/admin-auth";
import { parseJsonBody } from "../../lib/parse-json-body";

export default defineEventHandler(async (event) => {
  if (!isAdminAuthed(event)) {
    event.node.res.statusCode = 401;
    return { error: "Unauthorized" };
  }

  const body = await parseJsonBody<{ id?: string }>(event);
  const id = body.id?.trim();
  if (!id) {
    event.node.res.statusCode = 400;
    return { error: "Missing id" };
  }

  const db = getDb();
  const deleted = await db
    .delete(adminAvailabilitySlots)
    .where(eq(adminAvailabilitySlots.id, id))
    .returning({ id: adminAvailabilitySlots.id });

  if (deleted.length === 0) {
    event.node.res.statusCode = 404;
    return { error: "Not found" };
  }

  return { ok: true };
});
