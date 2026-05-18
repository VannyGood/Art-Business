// Intentionally left as a small side-effect import so the error capture stays enabled
// in any runtime (Vercel/Nitro, local dev, etc).
import "./lib/error-capture";

import type { Register } from "@tanstack/react-router";
import {
  createStartHandler,
  defaultStreamHandler,
  type RequestHandler,
} from "@tanstack/react-start/server";

const startFetch = createStartHandler(defaultStreamHandler);

const serverEntry: { fetch: RequestHandler<Register> } = {
  async fetch(...args) {
    return await startFetch(...args);
  },
};

export default serverEntry;
