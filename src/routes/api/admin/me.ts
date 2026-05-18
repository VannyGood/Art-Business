import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import meGet from "../../../../server/api/admin/me.get";

const web = h3RoutesToFetch([
  { method: "get", path: "/api/admin/me", handler: meGet },
]);

export const Route = createFileRoute("/api/admin/me")({
  server: {
    handlers: {
      GET: ({ request }) => web(request),
    },
  },
});
