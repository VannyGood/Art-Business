import { defineEventHandler } from "h3";
import { eq } from "drizzle-orm";

import { getDb } from "../../../../src/db/client";
import { adminAvailabilitySlots } from "../../../../src/db/schema";
import { isAdminAuthed } from "../../../lib/admin-auth";

export default defineEventHandler(async (event) => {
  if (!isAdminAuthed(event)) {
    event.node.res.statusCode = 401;
    return { error: "Unauthorized" };
  }

  const id =
    (event.context.params?.id as string | undefined) ??
    new URL(event.req.url).pathname.split("/").filter(Boolean).at(-1);
  if (!id || id === "slots") {
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
