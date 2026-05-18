import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import bookingsGet from "../../../../server/api/admin/bookings.get";
import bookingsRemove from "../../../../server/api/admin/bookings.remove.post";

const web = h3RoutesToFetch([
  { method: "get", path: "/api/admin/bookings", handler: bookingsGet },
  { method: "post", path: "/api/admin/bookings/remove", handler: bookingsRemove },
]);

export const Route = createFileRoute("/api/admin/bookings")({
  server: {
    handlers: {
      GET: ({ request }) => web(request),
      POST: ({ request }) => web(request),
    },
  },
});
