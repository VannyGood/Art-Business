import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import slotsGet from "../../../server/api/slots.get";

const web = h3RoutesToFetch([
  { method: "get", path: "/api/slots", handler: slotsGet },
]);

export const Route = createFileRoute("/api/slots")({
  server: {
    handlers: {
      GET: ({ request }) => web(request),
    },
  },
});
