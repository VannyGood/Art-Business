import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { formatPriceRub } from "@/lib/pricing";
import {
  TELEGRAM_PAYMENT_PREFILL,
  TELEGRAM_PAYMENT_USERNAME,
  telegramPaymentUrl,
} from "@/lib/telegram-payment";

export const Route = createFileRoute("/payment/$paymentId")({
  component: PaymentTelegramPage,
});

const PLAN_LABELS: Record<string, string> = {
  single: "Один урок",
  pack5: "Пакет 5 уроков",
  pack10: "Пакет 10 уроков",
};

type PaymentInfo = {
  status: string;
  amountRub: number;
  customerName: string;
  appointmentStartAt: string;
  plan: string | null;
};

function PaymentTelegramPage() {
  const { paymentId } = Route.useParams();
  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const telegramUrl = telegramPaymentUrl(TELEGRAM_PAYMENT_PREFILL);

  const load = useCallback(async () => {
    const res = await fetch(`/api/payments/${paymentId}/status`);
    const data = (await res.json()) as PaymentInfo | { error?: string };
    if (!res.ok) {
      throw new Error("error" in data ? data.error : `Ошибка ${res.status}`);
    }
    setInfo(data as PaymentInfo);
  }, [paymentId]);

  useEffect(() => {
    load().catch((e) => setLoadError(e instanceof Error ? e.message : "Ошибка загрузки"));
  }, [load]);

  const planLabel = info?.plan ? (PLAN_LABELS[info.plan] ?? info.plan) : null;
  const lessonWhen = info
    ? new Date(info.appointmentStartAt).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })
    : "";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-background">
      <div className="glass rounded-3xl p-8 md:p-10 max-w-lg w-full shadow-soft">
        <p className="font-script text-2xl text-gradient-gold text-center">запись</p>
        <h1 className="mt-2 text-3xl font-display text-center">Свяжитесь в Telegram</h1>

        {loadError && <p className="mt-6 text-sm text-red-600 text-center">{loadError}</p>}

        {!info && !loadError && (
          <p className="mt-8 text-center text-muted-foreground">Загрузка…</p>
        )}

        {info && (
          <>
            <div className="mt-8 space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Имя: </span>
                {info.customerName}
              </p>
              <p>
                <span className="text-muted-foreground">Сумма: </span>
                <strong className="text-lg">{formatPriceRub(info.amountRub)}</strong>
              </p>
              {planLabel && (
                <p>
                  <span className="text-muted-foreground">Тариф: </span>
                  {planLabel}
                </p>
              )}
              {info.plan === "single" && (
                <p>
                  <span className="text-muted-foreground">Занятие: </span>
                  {lessonWhen}
                </p>
              )}
            </div>

            <p className="mt-8 text-sm text-muted-foreground leading-relaxed">
              Онлайн-оплата на сайте скоро появится. Сейчас запись подтверждается через Telegram:
              напишите Алёне — согласуем оплату и детали занятия.
            </p>

            <p className="mt-4 text-sm leading-relaxed">
              Нажмите кнопку ниже, откройте чат{" "}
              <strong>@{TELEGRAM_PAYMENT_USERNAME}</strong> и отправьте сообщение (текст уже
              подставлен — можно отредактировать).
            </p>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 flex w-full items-center justify-center rounded-full py-4 px-8 text-base font-medium bg-[#229ED9] text-white transition hover:opacity-90"
            >
              Написать в Telegram
            </a>

            <p className="mt-4 text-center text-xs text-muted-foreground break-all">
              {telegramUrl}
            </p>

            {info.status === "paid" && (
              <p className="mt-4 text-center text-sm text-emerald-700">
                Оплата отмечена. Спасибо!
              </p>
            )}

            <p className="mt-6 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← На главную
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
