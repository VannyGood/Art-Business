import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import antilopayCallback from "../../../../../server/api/payments/antilopay/callback.post";

const web = h3RoutesToFetch([
  { method: "post", path: "/api/payments/antilopay/callback", handler: antilopayCallback },
]);

export const Route = createFileRoute("/api/payments/antilopay/callback")({
  server: {
    handlers: {
      POST: ({ request }) => web(request),
    },
  },
});
