import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import testEmailPost from "../../../../server/api/admin/test-email.post";

const web = h3RoutesToFetch([
  { method: "post", path: "/api/admin/test-email", handler: testEmailPost },
]);

export const Route = createFileRoute("/api/admin/test-email")({
  server: {
    handlers: {
      POST: ({ request }) => web(request),
    },
  },
});
