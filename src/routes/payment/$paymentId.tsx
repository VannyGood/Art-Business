import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { formatPriceRub } from "@/lib/pricing";

export const Route = createFileRoute("/payment/$paymentId")({
  component: PaymentCheckoutPage,
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

function PaymentCheckoutPage() {
  const { paymentId } = Route.useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/payments/${paymentId}/status`);
    const data = (await res.json()) as PaymentInfo | { error?: string };
    if (!res.ok) {
      throw new Error("error" in data ? data.error : `Ошибка ${res.status}`);
    }
    setInfo(data as PaymentInfo);
    if ((data as PaymentInfo).status === "paid") {
      navigate({ to: "/payment/success" });
    }
  }, [paymentId, navigate]);

  useEffect(() => {
    load().catch((e) => setLoadError(e instanceof Error ? e.message : "Ошибка загрузки"));
  }, [load]);

  async function handlePay() {
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch(`/api/payments/${paymentId}/mock-pay`, { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `Ошибка ${res.status}`);
      }
      navigate({ to: "/payment/success" });
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Не удалось оплатить");
      setPaying(false);
    }
  }

  const planLabel = info?.plan ? (PLAN_LABELS[info.plan] ?? info.plan) : null;
  const lessonWhen = info
    ? new Date(info.appointmentStartAt).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })
    : "";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-background">
      <div className="glass rounded-3xl p-8 md:p-10 max-w-lg w-full shadow-soft">
        <p className="font-script text-2xl text-gradient-gold text-center">оплата</p>
        <h1 className="mt-2 text-3xl font-display text-center">Завершите запись</h1>

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
              <p className="text-muted-foreground pt-2">
                Сейчас оплата тестовая (карта/SBP подключим позже). После нажатия кнопки придёт
                письмо на email.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePay}
              disabled={paying || info.status === "paid"}
              className="mt-8 w-full rounded-full py-4 px-8 text-base font-medium bg-foreground text-background transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paying ? "Обрабатываю…" : "Оплатить (тест)"}
            </button>

            {payError && <p className="mt-4 text-sm text-red-600 text-center">{payError}</p>}

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
