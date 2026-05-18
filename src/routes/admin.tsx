import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Slot = {
  id: string;
  startAt: string;
  endAt: string;
  capacity: number;
  notes: string | null;
};

type BookingRow = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  telegramHandle: string | null;
  appointmentStartAt: string;
  appointmentEndAt: string;
  status: string;
  createdAt: string;
  paymentStatus: string | null;
  amountRub: number | null;
  paymentId: string | null;
};

type GalleryRow = {
  id: string;
  title: string;
  category: string;
  fileKey: string;
  sortOrder: number;
  createdAt: string;
  imageUrl: string;
};

function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);

  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [notes, setNotes] = useState("");

  const [galleryItems, setGalleryItems] = useState<GalleryRow[]>([]);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryCategory, setGalleryCategory] = useState("Портреты");
  const [gallerySort, setGallerySort] = useState("");
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryMsg, setGalleryMsg] = useState<string | null>(null);
  const [galleryFileInputKey, setGalleryFileInputKey] = useState(0);

  async function refresh() {
    const me = await fetch("/api/admin/me").then((r) => r.json() as Promise<{ authed: boolean }>);
    setAuthed(me.authed);
    if (!me.authed) return;

    const slotsRes = await fetch("/api/admin/slots").then(
      (r) => r.json() as Promise<{ slots: Slot[] }>,
    );
    setSlots(slotsRes.slots ?? []);

    const bookingsRes = await fetch("/api/admin/bookings").then(
      (r) => r.json() as Promise<{ bookings: BookingRow[] }>,
    );
    setBookings(bookingsRes.bookings ?? []);

    const galRes = await fetch("/api/admin/gallery").then(
      (r) => r.json() as Promise<{ items?: GalleryRow[]; error?: string }>,
    );
    if ("items" in galRes && galRes.items) setGalleryItems(galRes.items);
    else setGalleryItems([]);
  }

  useEffect(() => {
    refresh().catch(() => setAuthed(false));
  }, []);

  const slotRows = useMemo(() => {
    return slots.map((s) => ({
      ...s,
      start: new Date(s.startAt).toLocaleString("ru-RU"),
      end: new Date(s.endAt).toLocaleString("ru-RU"),
    }));
  }, [slots]);

  const bookingRows = useMemo(() => {
    return bookings.map((b) => ({
      ...b,
      start: new Date(b.appointmentStartAt).toLocaleString("ru-RU"),
      created: new Date(b.createdAt).toLocaleString("ru-RU"),
    }));
  }, [bookings]);

  if (authed === null) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-3xl p-8 w-full max-w-md">
          <p className="text-muted-foreground text-sm">Загрузка…</p>
        </div>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-3xl p-10 w-full max-w-md shadow-soft">
          <h1 className="text-2xl font-display">Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Вход в панель управления.</p>
          <form
            className="mt-6 grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setLoginError(null);
              try {
                const res = await fetch("/api/admin/login", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ password }),
                });
                const data = (await res.json()) as { ok?: true; error?: string };
                if (!res.ok) throw new Error(data.error ?? "Login failed");
                setPassword("");
                await refresh();
              } catch (err) {
                setLoginError(err instanceof Error ? err.message : "Ошибка входа");
              } finally {
                setBusy(false);
              }
            }}
          >
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-full px-6 py-4 bg-background/80 border border-border focus:border-foreground/40 outline-none transition"
            />
            {loginError && <p className="text-sm text-destructive">{loginError}</p>}
            <button
              disabled={busy || !password}
              className="rounded-full px-6 py-3 bg-foreground text-background transition disabled:opacity-60"
            >
              {busy ? "Вхожу…" : "Войти"}
            </button>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">
              ← На сайт
            </Link>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display">Панель</h1>
            <p className="mt-1 text-sm text-muted-foreground">Слоты, записи, галерея «Работы».</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-full px-5 py-2.5 border border-border hover:border-foreground/40 transition"
              onClick={() => refresh()}
            >
              Обновить
            </button>
            <button
              className="rounded-full px-5 py-2.5 bg-foreground text-background transition"
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                setAuthed(false);
              }}
            >
              Выйти
            </button>
          </div>
        </div>

        <section className="mt-10 glass rounded-3xl p-8 shadow-soft">
          <h2 className="text-xl font-display">Галерея «Мои работы»</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            JPEG, PNG или WebP до 8 МБ. Категории совпадают с фильтрами на сайте.
          </p>

          <form
            className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!galleryFile) {
                setGalleryMsg("Выбери файл изображения");
                return;
              }
              setBusy(true);
              setGalleryMsg(null);
              try {
                const fd = new FormData();
                fd.append("image", galleryFile);
                fd.append("title", galleryTitle.trim());
                fd.append("category", galleryCategory);
                if (gallerySort.trim()) fd.append("sortOrder", gallerySort.trim());
                const res = await fetch("/api/admin/gallery", { method: "POST", body: fd });
                const data = (await res.json()) as { ok?: boolean; error?: string };
                if (!res.ok) throw new Error(data.error ?? "Ошибка загрузки");
                setGalleryTitle("");
                setGallerySort("");
                setGalleryFile(null);
                setGalleryFileInputKey((k) => k + 1);
                await refresh();
                setGalleryMsg("Сохранено");
              } catch (err) {
                setGalleryMsg(err instanceof Error ? err.message : "Ошибка");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="text-muted-foreground">Файл</span>
              <input
                key={galleryFileInputKey}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setGalleryFile(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Название</span>
              <input
                value={galleryTitle}
                onChange={(e) => setGalleryTitle(e.target.value)}
                placeholder="Например, Тишина утра"
                className="rounded-full px-5 py-3 bg-background/80 border border-border outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Категория</span>
              <select
                value={galleryCategory}
                onChange={(e) => setGalleryCategory(e.target.value)}
                className="rounded-full px-5 py-3 bg-background/80 border border-border outline-none"
              >
                <option>Портреты</option>
                <option>Абстракция</option>
                <option>Скетчи</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Порядок (число)</span>
              <input
                value={gallerySort}
                onChange={(e) => setGallerySort(e.target.value)}
                placeholder="0"
                type="number"
                className="rounded-full px-5 py-3 bg-background/80 border border-border outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={busy || !galleryTitle.trim() || !galleryFile}
              className="rounded-full px-6 py-3 bg-foreground text-background transition disabled:opacity-60 md:col-span-2 lg:col-span-4 justify-self-start"
            >
              Добавить работу
            </button>
          </form>
          {galleryMsg && <p className="mt-3 text-sm text-muted-foreground">{galleryMsg}</p>}

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((g) => (
              <div
                key={g.id}
                className="rounded-2xl border border-border/60 overflow-hidden bg-background/40"
              >
                <div className="aspect-[4/3] bg-muted/30">
                  <img src={g.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 text-sm">
                  <p className="font-medium">{g.title}</p>
                  <p className="text-muted-foreground">{g.category}</p>
                  <p className="text-xs text-muted-foreground mt-1">sort: {g.sortOrder}</p>
                  <button
                    type="button"
                    className="mt-3 text-xs text-destructive hover:underline"
                    disabled={busy}
                    onClick={async () => {
                      if (!confirm("Удалить эту работу и файл?")) return;
                      setBusy(true);
                      try {
                        const res = await fetch(`/api/admin/gallery/${g.id}`, { method: "DELETE" });
                        const data = (await res.json()) as { ok?: boolean; error?: string };
                        if (!res.ok) throw new Error(data.error ?? "Ошибка удаления");
                        await refresh();
                      } catch (err) {
                        alert(err instanceof Error ? err.message : "Ошибка");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
            {galleryItems.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full">Пока нет работ в галерее.</p>
            )}
          </div>
        </section>

        <section className="mt-10 glass rounded-3xl p-8 shadow-soft">
          <h2 className="text-xl font-display">Свободные слоты</h2>
          <form
            className="mt-6 grid md:grid-cols-3 gap-4 items-end"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const res = await fetch("/api/admin/slots", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    startAt: startAt ? new Date(startAt).toISOString() : undefined,
                    endAt: endAt ? new Date(endAt).toISOString() : undefined,
                    notes: notes.trim() ? notes.trim() : undefined,
                  }),
                });
                const data = (await res.json()) as { error?: string };
                if (!res.ok) throw new Error(data.error ?? "Failed to create slot");
                setStartAt("");
                setEndAt("");
                setNotes("");
                await refresh();
              } catch (err) {
                alert(err instanceof Error ? err.message : "Ошибка");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Начало</span>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="rounded-full px-5 py-3 bg-background/80 border border-border outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Конец</span>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="rounded-full px-5 py-3 bg-background/80 border border-border outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Заметка</span>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="например Zoom"
                className="rounded-full px-5 py-3 bg-background/80 border border-border outline-none"
              />
            </label>
            <button
              disabled={busy || !startAt || !endAt}
              className="rounded-full px-6 py-3 bg-foreground text-background transition disabled:opacity-60 md:col-span-3"
            >
              Добавить слот
            </button>
          </form>

          <div className="mt-6 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="text-left py-2">Начало</th>
                  <th className="text-left py-2">Конец</th>
                  <th className="text-left py-2">Заметка</th>
                </tr>
              </thead>
              <tbody>
                {slotRows.map((s) => (
                  <tr key={s.id} className="border-t border-border/60">
                    <td className="py-2">{s.start}</td>
                    <td className="py-2">{s.end}</td>
                    <td className="py-2">{s.notes ?? "—"}</td>
                  </tr>
                ))}
                {slotRows.length === 0 && (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={3}>
                      Пока нет слотов
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 glass rounded-3xl p-8 shadow-soft">
          <h2 className="text-xl font-display">Последние записи</h2>
          <div className="mt-6 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="text-left py-2">Дата</th>
                  <th className="text-left py-2">Имя</th>
                  <th className="text-left py-2">Статус</th>
                  <th className="text-left py-2">Оплата</th>
                </tr>
              </thead>
              <tbody>
                {bookingRows.map((b) => (
                  <tr key={b.id} className="border-t border-border/60">
                    <td className="py-2">{b.start}</td>
                    <td className="py-2">
                      <div className="font-medium">{b.customerName}</div>
                      <div className="text-muted-foreground">{b.email}</div>
                    </td>
                    <td className="py-2">{b.status}</td>
                    <td className="py-2">
                      {b.paymentStatus ? `${b.paymentStatus} · ${b.amountRub ?? ""}₽` : "—"}
                    </td>
                  </tr>
                ))}
                {bookingRows.length === 0 && (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={4}>
                      Пока нет записей
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
