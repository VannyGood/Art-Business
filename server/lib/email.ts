import nodemailer from "nodemailer";

import { envString } from "./env";

export function getEmailConfig() {
  const port = Number(envString("SMTP_PORT") || 465);
  const user = envString("SMTP_USER");
  return {
    host: envString("SMTP_HOST") || "smtp.mail.ru",
    port,
    secure: port === 465,
    user,
    pass: envString("SMTP_PASS"),
    from: envString("SMTP_FROM") || user || "noreply@alyonart.online",
    adminEmail: envString("ADMIN_EMAIL") || "koroed.alena@mail.ru",
  };
}

function createTransport() {
  const cfg = getEmailConfig();
  if (!cfg.user || !cfg.pass) {
    throw new Error("SMTP_USER and SMTP_PASS are required");
  }

  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    tls: cfg.port === 465 ? { minVersion: "TLSv1.2" } : undefined,
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 25_000,
  });
}

export async function verifySmtp(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const cfg = getEmailConfig();
    if (!cfg.user || !cfg.pass) {
      return { ok: false, error: "SMTP_USER or SMTP_PASS missing in .env" };
    }
    const t = createTransport();
    await t.verify();
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

export async function sendEmailSafe(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  const cfg = getEmailConfig();
  if (!cfg.user || !cfg.pass) {
    console.warn("[email] SMTP_USER / SMTP_PASS not set — skip send to", options.to);
    return false;
  }

  try {
    const transporter = createTransport();
    const from = cfg.from.includes("<") ? cfg.from : `"Студия Алёны" <${cfg.from}>`;

    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text.replace(/\n/g, "<br>\n"),
    });

    console.info("[email] sent to", options.to, "messageId=", info.messageId);
    return true;
  } catch (err) {
    console.error("[email] send failed to", options.to, err);
    return false;
  }
}
