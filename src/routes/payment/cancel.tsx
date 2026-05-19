import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/payment/cancel")({
  component: PaymentCancelPage,
});

function PaymentCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="glass rounded-3xl p-10 max-w-md text-center shadow-soft">
        <h1 className="text-2xl font-display">Оплата отменена</h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Платёж не был завершён. Вы можете вернуться на сайт и попробовать снова.
        </p>
        <Link
          to="/"
          hash="contact"
          className="mt-8 inline-block rounded-full px-8 py-3 bg-foreground text-background transition hover:opacity-90"
        >
          Записаться снова
        </Link>
      </div>
    </main>
  );
}
