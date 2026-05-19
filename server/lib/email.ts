import nodemailer from "nodemailer";

export function getEmailConfig() {
  const port = Number(process.env.SMTP_PORT || 465);
  return {
    host: process.env.SMTP_HOST || "smtp.mail.ru",
    port,
    secure: port === 465,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@alyonart.online",
    adminEmail: process.env.ADMIN_EMAIL || "koroed.alena@mail.ru",
  };
}

export async function sendEmailSafe(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const cfg = getEmailConfig();
  if (!cfg.user || !cfg.pass) {
    console.warn("[email] SMTP_USER / SMTP_PASS not set — skip send to", options.to);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
    });

    await transporter.sendMail({
      from: cfg.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text.replace(/\n/g, "<br>\n"),
    });
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}
