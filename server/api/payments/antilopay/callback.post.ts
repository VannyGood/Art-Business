import { defineEventHandler } from "h3";

import { parseJsonBody } from "../../../lib/parse-json-body";

/**
 * Antilopay server-to-server callback (callback v1).
 * Finish wiring when you receive Secret Key for callbacks from Antilopay email.
 */
export default defineEventHandler(async (event) => {
  let payload: unknown;
  try {
    payload = await parseJsonBody<Record<string, unknown>>(event);
  } catch {
    payload = null;
  }

  // TODO: verify signature with ANTILOPAY_CALLBACK_SECRET, update payments + bookings
  console.info("[antilopay callback]", JSON.stringify(payload));

  return { ok: true };
});
