import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import statusGet from "../../../../../server/api/payments/[paymentId]/status.get";

const web = h3RoutesToFetch([
  {
    method: "get",
    path: "/api/payments/:paymentId/status",
    handler: statusGet,
  },
]);

export const Route = createFileRoute("/api/payments/$paymentId/status")({
  server: {
    handlers: {
      GET: ({ request }) => web(request),
    },
  },
});
