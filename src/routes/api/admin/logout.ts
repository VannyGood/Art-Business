import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import logoutPost from "../../../../server/api/admin/logout.post";

const web = h3RoutesToFetch([
  { method: "post", path: "/api/admin/logout", handler: logoutPost },
]);

export const Route = createFileRoute("/api/admin/logout")({
  server: {
    handlers: {
      POST: ({ request }) => web(request),
    },
  },
});
