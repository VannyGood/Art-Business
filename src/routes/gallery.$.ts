import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { createFileRoute } from "@tanstack/react-router";

import { getGalleryDir } from "@/lib/gallery-paths";

const mime: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function fileKeyFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/gallery\/(.+)$/);
  if (!m?.[1]) return null;
  const decoded = decodeURIComponent(m[1]);
  if (!/^[a-zA-Z0-9._-]+$/.test(decoded)) return null;
  return decoded;
}

export const Route = createFileRoute("/gallery/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const key = fileKeyFromPath(u.pathname);
        if (!key) return new Response("Not found", { status: 404 });
        const path = join(getGalleryDir(), key);
        try {
          const buf = await readFile(path);
          const lower = key.toLowerCase();
          const ext = lower.endsWith(".png")
            ? ".png"
            : lower.endsWith(".webp")
              ? ".webp"
              : ".jpg";
          return new Response(buf, {
            headers: {
              "content-type": mime[ext] ?? "application/octet-stream",
              "cache-control": "public, max-age=86400",
            },
          });
        } catch {
          return new Response("Not found", { status: 404 });
        }
      },
    },
  },
});
