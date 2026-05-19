import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import bookingsDelete from "../../../../../server/api/admin/bookings/[id].delete";

const web = h3RoutesToFetch([
  { method: "delete", path: "/api/admin/bookings/:id", handler: bookingsDelete },
]);

export const Route = createFileRoute("/api/admin/bookings/$id")({
  server: {
    handlers: {
      DELETE: ({ request }) => web(request),
    },
  },
});
