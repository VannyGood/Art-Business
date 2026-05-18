import { createFileRoute } from "@tanstack/react-router";

import { h3RoutesToFetch } from "@/lib/h3RoutesToFetch";
import galleryGet from "../../../server/api/gallery.get";

const web = h3RoutesToFetch([{ method: "get", path: "/api/gallery", handler: galleryGet }]);

export const Route = createFileRoute("/api/gallery")({
  server: {
    handlers: {
      GET: ({ request }) => web(request),
    },
  },
});
