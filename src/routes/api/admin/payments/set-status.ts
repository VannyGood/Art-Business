import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import setStatusPost from "../../../../../server/api/admin/payments/set-status.post";

const web = h3RoutesToFetch([
  { method: "post", path: "/api/admin/payments/set-status", handler: setStatusPost },
]);

export const Route = createFileRoute("/api/admin/payments/set-status")({
  server: {
    handlers: {
      POST: ({ request }) => web(request),
    },
  },
});
