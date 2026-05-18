import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import bookingsGet from "../../../../server/api/admin/bookings.get";

const web = h3RoutesToFetch([
  { method: "get", path: "/api/admin/bookings", handler: bookingsGet },
]);

export const Route = createFileRoute("/api/admin/bookings")({
  server: {
    handlers: {
      GET: ({ request }) => web(request),
    },
  },
});
