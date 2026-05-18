import type { H3Event } from "h3";
import { readBody } from "h3";

/** Parse JSON body from TanStack Start + h3 (readBody can be empty). */
export async function parseJsonBody<T extends Record<string, unknown>>(
  event: H3Event,
): Promise<T> {
  const contentType = event.req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await event.req.json()) as T;
  }
  return (await readBody(event)) as T;
}
