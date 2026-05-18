import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import remindersGet from "../../../../server/api/cron/reminders.get";

const web = h3RoutesToFetch([
  { method: "get", path: "/api/cron/reminders", handler: remindersGet },
]);

export const Route = createFileRoute("/api/cron/reminders")({
  server: {
    handlers: {
      GET: ({ request }) => web(request),
    },
  },
});
