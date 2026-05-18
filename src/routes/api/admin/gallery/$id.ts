import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import galleryDelete from "../../../../../server/api/admin/gallery/[id].delete";

const web = h3RoutesToFetch([
  { method: "delete", path: "/api/admin/gallery/:id", handler: galleryDelete },
]);

export const Route = createFileRoute("/api/admin/gallery/$id")({
  server: {
    handlers: {
      DELETE: ({ request }) => web(request),
    },
  },
});
