/** Telegram для ручной оплаты, пока нет Antilopay / SMTP */
export const TELEGRAM_PAYMENT_USERNAME =
  (import.meta.env.VITE_TELEGRAM_PAYMENT_USERNAME as string | undefined)?.replace(/^@/, "") ||
  "jijijijijijijijij1";

export function telegramPaymentUrl(prefillMessage?: string): string {
  const base = `https://t.me/${TELEGRAM_PAYMENT_USERNAME}`;
  if (!prefillMessage?.trim()) return base;
  return `${base}?text=${encodeURIComponent(prefillMessage.trim())}`;
}

export const TELEGRAM_PAYMENT_PREFILL =
  "Здравствуйте! Я оформил(а) запись на урок на сайте alyonart.online. Подскажите, пожалуйста, как удобнее оплатить и согласовать время.";
