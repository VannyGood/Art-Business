import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { defineEventHandler } from "h3";

import { ensureGalleryDir } from "../../../src/lib/gallery-paths";
import { getDb } from "../../../src/db/client";
import { galleryWorks } from "../../../src/db/schema";
import { isAdminAuthed } from "../../lib/admin-auth";

const ALLOWED_CATEGORIES = ["Портреты", "Абстракция", "Скетчи"] as const;
const MAX_BYTES = 8 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function safeFileKey(name: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(name) && !name.includes("..");
}

export default defineEventHandler(async (event) => {
  if (!isAdminAuthed(event)) {
    event.node.res.statusCode = 401;
    return { error: "Unauthorized" };
  }

  const form = await event.req.formData();
  const file = form.get("image");
  const title = String(form.get("title") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const sortRaw = form.get("sortOrder");

  if (!(file instanceof File)) {
    event.node.res.statusCode = 400;
    return { error: "Image file is required" };
  }
  if (!title) {
    event.node.res.statusCode = 400;
    return { error: "Title is required" };
  }
  if (!ALLOWED_CATEGORIES.includes(category as (typeof ALLOWED_CATEGORIES)[number])) {
    event.node.res.statusCode = 400;
    return { error: "Invalid category" };
  }

  const mime = file.type || "application/octet-stream";
  const ext = MIME_TO_EXT[mime];
  if (!ext) {
    event.node.res.statusCode = 400;
    return { error: "Only JPEG, PNG, or WebP images are allowed" };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_BYTES) {
    event.node.res.statusCode = 400;
    return { error: "File too large or empty (max 8 MB)" };
  }

  const fileKey = `${randomUUID()}${ext}`;
  if (!safeFileKey(fileKey)) {
    event.node.res.statusCode = 500;
    return { error: "Invalid generated name" };
  }

  const dir = await ensureGalleryDir();
  await writeFile(join(dir, fileKey), buf);

  let sortOrder = 0;
  if (sortRaw != null && String(sortRaw).trim() !== "") {
    const n = Number.parseInt(String(sortRaw), 10);
    if (!Number.isNaN(n)) sortOrder = n;
  }

  const db = getDb();
  const [row] = await db
    .insert(galleryWorks)
    .values({
      title,
      category,
      fileKey,
      sortOrder,
    })
    .returning({ id: galleryWorks.id });

  return {
    ok: true,
    id: row.id,
    imageUrl: `/gallery/${encodeURIComponent(fileKey)}`,
  };
});
