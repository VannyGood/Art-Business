import { mkdir } from "node:fs/promises";
import { join } from "node:path";

/** Writable directory for uploaded gallery files. Override on VPS with persistent storage. */
export function getGalleryDir(): string {
  const env = process.env.GALLERY_UPLOAD_DIR?.trim();
  if (env) return env;
  return join(process.cwd(), "public", "gallery");
}

export async function ensureGalleryDir(): Promise<string> {
  const dir = getGalleryDir();
  await mkdir(dir, { recursive: true });
  return dir;
}
