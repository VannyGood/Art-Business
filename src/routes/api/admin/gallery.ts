import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import galleryAdminGet from "../../../../server/api/admin/gallery.get";
import galleryAdminPost from "../../../../server/api/admin/gallery.post";

const web = h3RoutesToFetch([
  { method: "get", path: "/api/admin/gallery", handler: galleryAdminGet },
  { method: "post", path: "/api/admin/gallery", handler: galleryAdminPost },
]);

export const Route = createFileRoute("/api/admin/gallery")({
  server: {
    handlers: {
      GET: ({ request }) => web(request),
      POST: ({ request }) => web(request),
    },
  },
});
