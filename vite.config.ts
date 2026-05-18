import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig(({ command }) => ({
  server: {
    // On some Windows setups Vite may bind only to IPv6 (::1),
    // which makes http://localhost or http://127.0.0.1 fail.
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    // Enables TanStack Start deployments on Vercel (and other providers)
    // via Nitro's server output.
    nitro(),
    // TanStack Start requires React plugin after it.
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
}));
