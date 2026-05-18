import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import checkoutGet from "../../../../../server/api/payments/[paymentId]/checkout.get";

const web = h3RoutesToFetch([
  {
    method: "get",
    path: "/api/payments/:paymentId/checkout",
    handler: checkoutGet,
  },
]);

export const Route = createFileRoute("/api/payments/$paymentId/checkout")({
  server: {
    handlers: {
      GET: ({ request }) => web(request),
    },
  },
});
