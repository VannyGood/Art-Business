import { defineEventHandler } from "h3";
import { asc } from "drizzle-orm";

import { getDb } from "../../../src/db/client";
import { galleryWorks } from "../../../src/db/schema";
import { isAdminAuthed } from "../../lib/admin-auth";

export default defineEventHandler(async (event) => {
  if (!isAdminAuthed(event)) {
    event.node.res.statusCode = 401;
    return { error: "Unauthorized" };
  }

  const db = getDb();
  const rows = await db
    .select({
      id: galleryWorks.id,
      title: galleryWorks.title,
      category: galleryWorks.category,
      fileKey: galleryWorks.fileKey,
      sortOrder: galleryWorks.sortOrder,
      createdAt: galleryWorks.createdAt,
    })
    .from(galleryWorks)
    .orderBy(asc(galleryWorks.sortOrder), asc(galleryWorks.createdAt));

  return {
    items: rows.map((r) => ({
      ...r,
      imageUrl: `/gallery/${encodeURIComponent(r.fileKey)}`,
    })),
  };
});
