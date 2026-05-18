import { defineEventHandler, readBody } from "h3";

import { requireAdminConfig, setAdminSession } from "../../lib/admin-auth";

export default defineEventHandler(async (event) => {
  const { password: expectedPassword } = requireAdminConfig();
  const body = (await readBody(event)) as { password?: string };

  if (!body.password || body.password !== expectedPassword) {
    event.node.res.statusCode = 401;
    return { error: "Invalid password" };
  }

  setAdminSession(event);
  return { ok: true };
});
