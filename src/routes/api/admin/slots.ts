import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import slotsGet from "../../../../server/api/admin/slots.get";
import slotsPost from "../../../../server/api/admin/slots.post";
import slotsRemove from "../../../../server/api/admin/slots.remove.post";

const web = h3RoutesToFetch([
  { method: "get", path: "/api/admin/slots", handler: slotsGet },
  { method: "post", path: "/api/admin/slots", handler: slotsPost },
  { method: "post", path: "/api/admin/slots/remove", handler: slotsRemove },
]);

export const Route = createFileRoute("/api/admin/slots")({
  server: {
    handlers: {
      GET: ({ request }) => web(request),
      POST: ({ request }) => web(request),
    },
  },
});
