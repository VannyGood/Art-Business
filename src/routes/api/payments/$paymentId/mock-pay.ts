import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import mockPayPost from "../../../../../server/api/payments/[paymentId]/mock-pay.post";

const web = h3RoutesToFetch([
  {
    method: "post",
    path: "/api/payments/:paymentId/mock-pay",
    handler: mockPayPost,
  },
]);

export const Route = createFileRoute("/api/payments/$paymentId/mock-pay")({
  server: {
    handlers: {
      POST: ({ request }) => web(request),
    },
  },
});
