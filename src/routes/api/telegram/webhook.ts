import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import webhookPost from "../../../../server/api/telegram/webhook.post";

const web = h3RoutesToFetch([
  { method: "post", path: "/api/telegram/webhook", handler: webhookPost },
]);

export const Route = createFileRoute("/api/telegram/webhook")({
  server: {
    handlers: {
      POST: ({ request }) => web(request),
    },
  },
});
