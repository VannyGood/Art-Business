import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import slotsDelete from "../../../../../server/api/admin/slots/[id].delete";

const web = h3RoutesToFetch([
  { method: "delete", path: "/api/admin/slots/:id", handler: slotsDelete },
]);

export const Route = createFileRoute("/api/admin/slots/$id")({
  server: {
    handlers: {
      DELETE: ({ request }) => web(request),
    },
  },
});
