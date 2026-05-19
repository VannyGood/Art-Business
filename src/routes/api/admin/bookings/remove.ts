import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import bookingsRemove from "../../../../../server/api/admin/bookings.remove.post";

const web = h3RoutesToFetch([
  { method: "post", path: "/api/admin/bookings/remove", handler: bookingsRemove },
]);

export const Route = createFileRoute("/api/admin/bookings/remove")({
  server: {
    handlers: {
      POST: ({ request }) => web(request),
    },
  },
});
