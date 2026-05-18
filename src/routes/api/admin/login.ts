import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import loginPost from "../../../../server/api/admin/login.post";

const web = h3RoutesToFetch([
  { method: "post", path: "/api/admin/login", handler: loginPost },
]);

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: ({ request }) => web(request),
    },
  },
});
