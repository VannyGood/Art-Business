import { unlink } from "node:fs/promises";
import { join } from "node:path";

import { defineEventHandler } from "h3";
import { eq } from "drizzle-orm";

import { getGalleryDir } from "../../../../src/lib/gallery-paths";
import { getDb } from "../../../../src/db/client";
import { galleryWorks } from "../../../../src/db/schema";
import { isAdminAuthed } from "../../../lib/admin-auth";

export default defineEventHandler(async (event) => {
  if (!isAdminAuthed(event)) {
    event.node.res.statusCode = 401;
    return { error: "Unauthorized" };
  }

  const id = event.context.params?.id as string | undefined;
  if (!id) {
    event.node.res.statusCode = 400;
    return { error: "Missing id" };
  }

  const db = getDb();
  const [row] = await db.select().from(galleryWorks).where(eq(galleryWorks.id, id)).limit(1);
  if (!row) {
    event.node.res.statusCode = 404;
    return { error: "Not found" };
  }

  try {
    await unlink(join(getGalleryDir(), row.fileKey));
  } catch {
    // file may already be gone
  }

  await db.delete(galleryWorks).where(eq(galleryWorks.id, id));
  return { ok: true };
});
