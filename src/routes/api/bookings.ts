import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import bookingsPost from "../../../server/api/bookings.post";

const web = h3RoutesToFetch([
  { method: "post", path: "/api/bookings", handler: bookingsPost },
]);

export const Route = createFileRoute("/api/bookings")({
  server: {
    handlers: {
      POST: ({ request }) => web(request),
    },
  },
});
