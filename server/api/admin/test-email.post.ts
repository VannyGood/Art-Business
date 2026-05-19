import { defineEventHandler } from "h3";

import { isAdminAuthed } from "../../lib/admin-auth";
import { getEmailConfig, sendEmailSafe, verifySmtp } from "../../lib/email";

export default defineEventHandler(async (event) => {
  if (!isAdminAuthed(event)) {
    event.node.res.statusCode = 401;
    return { error: "Unauthorized" };
  }

  const verify = await verifySmtp();
  if (!verify.ok) {
    return { ok: false, error: verify.error };
  }

  const { adminEmail, user } = getEmailConfig();
  const sent = await sendEmailSafe({
    to: adminEmail,
    subject: "Тест почты — alyonart.online",
    text: [
      "Если вы видите это письмо, SMTP настроен правильно.",
      "",
      `Отправитель (SMTP_USER): ${user}`,
      `Получатель (ADMIN_EMAIL): ${adminEmail}`,
    ].join("\n"),
  });

  return { ok: sent, to: adminEmail };
});
