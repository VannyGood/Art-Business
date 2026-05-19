import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/payment/success")({
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="glass rounded-3xl p-10 max-w-md text-center shadow-soft">
        <h1 className="text-2xl font-display">Оплата прошла успешно</h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Спасибо! Мы подтвердим запись и при необходимости напишем вам на email или в Telegram.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-full px-8 py-3 bg-foreground text-background transition hover:opacity-90"
        >
          На главную
        </Link>
      </div>
    </main>
  );
}
