import { asc } from "drizzle-orm";
import { defineEventHandler } from "h3";

import { getDb } from "../../src/db/client";
import { galleryWorks } from "../../src/db/schema";

export default defineEventHandler(async () => {
  const db = getDb();
  const rows = await db
    .select({
      id: galleryWorks.id,
      title: galleryWorks.title,
      category: galleryWorks.category,
      fileKey: galleryWorks.fileKey,
      sortOrder: galleryWorks.sortOrder,
    })
    .from(galleryWorks)
    .orderBy(asc(galleryWorks.sortOrder), asc(galleryWorks.createdAt));

  const items = rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    imageUrl: `/gallery/${encodeURIComponent(r.fileKey)}`,
    sortOrder: r.sortOrder,
  }));

  return { items };
});
