import { H3, toWebHandler } from "h3";
import type { EventHandler } from "h3";

type Method = "get" | "post" | "delete";

/**
 * Mounts Nitro-style `defineEventHandler` handlers on paths and exposes them as a Web Fetch handler.
 * Used so `server/api/**` works with TanStack Start (which only wires `src/routes` server handlers).
 */
export function h3RoutesToFetch(
  routes: Array<{ method: Method; path: string; handler: EventHandler }>,
) {
  const app = new H3();
  for (const r of routes) {
    if (r.method === "get") app.get(r.path, r.handler);
    else if (r.method === "post") app.post(r.path, r.handler);
    else app.delete(r.path, r.handler);
  }
  return toWebHandler(app);
}
