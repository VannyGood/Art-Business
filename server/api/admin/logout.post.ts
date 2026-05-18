import { defineEventHandler } from "h3";

import { clearAdminSession } from "../../lib/admin-auth";

export default defineEventHandler(async (event) => {
  clearAdminSession(event);
  return { ok: true };
});
