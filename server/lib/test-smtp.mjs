/**
 * Run on VPS: node scripts/test-smtp.mjs
 * Loads /var/www/aliona/.env and sends one test message to ADMIN_EMAIL.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = process.env.ENV_FILE || resolve(root, ".env");

function loadEnv(file) {
  const text = readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = val;
  }
}

loadEnv(envPath);

const host = process.env.SMTP_HOST || "smtp.mail.ru";
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const to = process.env.ADMIN_EMAIL || "koroed.alena@mail.ru";

if (!user || !pass) {
  console.error("Missing SMTP_USER or SMTP_PASS in", envPath);
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  tls: port === 465 ? { minVersion: "TLSv1.2" } : undefined,
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 20_000,
});

console.log("Verifying SMTP", host, port, "as", user, "(max 15s)...");
try {
  await transporter.verify();
} catch (e) {
  console.error("SMTP verify failed:", e?.message || e);
  console.error("Try: SMTP_PORT=587 in .env, or check firewall outbound 465/587");
  process.exit(1);
}
console.log("SMTP OK, sending test to", to);

const info = await transporter.sendMail({
  from: `"Тест сайта" <${user}>`,
  to,
  subject: "Тест SMTP alyonart.online",
  text: "Если письмо пришло — почта на сервере работает.",
});

console.log("Sent:", info.messageId);
