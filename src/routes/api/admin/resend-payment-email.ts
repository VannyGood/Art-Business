import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import resendPost from "../../../../server/api/admin/resend-payment-email.post";

const web = h3RoutesToFetch([
  { method: "post", path: "/api/admin/resend-payment-email", handler: resendPost },
]);

export const Route = createFileRoute("/api/admin/resend-payment-email")({
  server: {
    handlers: {
      POST: ({ request }) => web(request),
    },
  },
});
