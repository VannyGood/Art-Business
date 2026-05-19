import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import slotsRemove from "../../../../../server/api/admin/slots.remove.post";

const web = h3RoutesToFetch([
  { method: "post", path: "/api/admin/slots/remove", handler: slotsRemove },
]);

export const Route = createFileRoute("/api/admin/slots/remove")({
  server: {
    handlers: {
      POST: ({ request }) => web(request),
    },
  },
});
