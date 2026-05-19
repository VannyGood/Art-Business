import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import heroBg from "@/assets/hero.jpg";
import portrait from "@/assets/portrait.jpg";
import { formatPriceRub, amountRubForPlan } from "@/lib/pricing";

export const Route = createFileRoute("/")({
  component: Index,
});

type Category = "Все" | "Портреты" | "Абстракция" | "Скетчи";

type GalleryItem = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  sortOrder: number;
};

function Index() {
  const [filter, setFilter] = useState<Category>("Все");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setGalleryLoading(true);
        setGalleryError(null);
        const res = await fetch("/api/gallery");
        if (!res.ok) throw new Error(`Не удалось загрузить галерею (${res.status})`);
        const data = (await res.json()) as { items: GalleryItem[] };
        if (!cancelled) setGalleryItems(data.items ?? []);
      } catch (e) {
        if (!cancelled)
          setGalleryError(e instanceof Error ? e.message : "Ошибка загрузки галереи");
      } finally {
        if (!cancelled) setGalleryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return filter === "Все"
      ? galleryItems
      : galleryItems.filter((w) => w.category === filter);
  }, [filter, galleryItems]);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Nav />
      <Hero />
      <About />
      <Gallery
        filter={filter}
        setFilter={setFilter}
        works={filtered}
        loading={galleryLoading}
        error={galleryError}
      />
      <Techniques />
      <Pricing />
      <HowItWorks />
      <Reviews />
      <Contact />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between glass rounded-b-3xl">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-wide">Алёна</span>
          <span className="font-script text-gradient-gold text-xl">art</span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#about" className="hover:text-foreground transition">
            Обо мне
          </a>
          <a href="#gallery" className="hover:text-foreground transition">
            Работы
          </a>
          <a href="#pricing" className="hover:text-foreground transition">
            Уроки
          </a>
          <a href="#contact" className="hover:text-foreground transition">
            Контакты
          </a>
        </nav>
        <a
          href="#contact"
          className="rounded-full px-5 py-2.5 text-sm bg-foreground text-background hover:opacity-90 transition shadow-soft"
        >
          Записаться
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative pt-40 pb-24 px-6">
      <div
        className="absolute inset-0 -z-10 opacity-90"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/30 via-background/40 to-background" />
      <div className="mx-auto max-w-5xl text-center">
        <p className="font-script text-3xl text-gradient-gold reveal">встреча с искусством</p>
        <h1 className="reveal reveal-delay-1 mt-4 font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05]">
          Открой в себе <em className="font-script text-gradient-gold not-italic">художника</em>
          <br />
          вместе с Алёной
        </h1>
        <p className="reveal reveal-delay-2 mt-8 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
          Авторские онлайн-уроки рисования и живописи. Мягко, вдохновляюще и красиво — для тех, кто
          давно мечтал начать.
        </p>
        <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-4 justify-center">
          <a
            href="#contact"
            className="rounded-full px-8 py-4 bg-foreground text-background hover:scale-[1.03] transition shadow-elegant"
          >
            Записаться на урок
          </a>
          <a href="#gallery" className="rounded-full px-8 py-4 glass hover:bg-white/80 transition">
            Смотреть работы
          </a>
        </div>
        <div className="reveal reveal-delay-4 mt-20 flex justify-center">
          <div className="gold-divider w-48" />
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="py-28 px-6">
      <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-blush rounded-[2rem] -rotate-2 opacity-70" />
          <img
            src={portrait}
            alt="Художница Алёна"
            loading="lazy"
            width={1024}
            height={1024}
            className="relative rounded-[2rem] shadow-elegant float-slow"
          />
          <div className="absolute -bottom-6 -right-6 glass rounded-2xl px-5 py-3 shadow-soft">
            <span className="font-script text-2xl text-gradient-gold">с любовью к свету</span>
          </div>
        </div>
        <div>
          <p className="font-script text-2xl text-gradient-gold">обо мне</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Привет, я Алёна</h2>
          <div className="gold-divider w-24 mt-6" />
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>
              Художник и преподаватель. Я учу рисовать{" "}
              <em className="text-foreground not-italic">сердцем</em> — мягко, без спешки, без
              оценок. Чтобы каждый мазок становился твоим личным «выдохом».
            </p>
            <p>
              За 8 лет практики я провела сотни уроков и поняла главное: рисование доступно каждому.
              Нужны лишь немного смелости, чашка чая и желание прикоснуться к красоте.
            </p>
            <p>
              На моих занятиях ты найдёшь свой стиль, почувствуешь цвет и откроешь в себе ту самую
              творческую женщину, которая всегда там жила.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Gallery({
  filter,
  setFilter,
  works,
  loading,
  error,
}: {
  filter: Category;
  setFilter: (c: Category) => void;
  works: GalleryItem[];
  loading: boolean;
  error: string | null;
}) {
  const cats: Category[] = ["Все", "Портреты", "Абстракция", "Скетчи"];
  return (
    <section id="gallery" className="py-28 px-6 canvas-texture">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-script text-2xl text-gradient-gold">галерея</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Мои работы</h2>
          <div className="gold-divider w-24 mt-6 mx-auto" />
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-5 py-2 text-sm transition border ${
                filter === c
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && (
          <p className="mt-14 text-center text-muted-foreground">Загружаю работы…</p>
        )}
        {error && !loading && (
          <p className="mt-14 text-center text-sm text-destructive">{error}</p>
        )}
        {!loading && !error && works.length === 0 && (
          <p className="mt-14 text-center text-muted-foreground max-w-md mx-auto">
            Скоро здесь появятся новые работы. Загляни чуть позже — или загляни в панель администратора,
            чтобы добавить первые фотографии.
          </p>
        )}

        {!loading && works.length > 0 && (
          <div className="mt-14 columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
            {works.map((w, i) => (
              <figure
                key={w.id}
                className="mb-6 break-inside-avoid group relative overflow-hidden rounded-3xl shadow-soft"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <img
                  src={w.imageUrl}
                  alt={w.title}
                  loading="lazy"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                />
                <figcaption className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition">
                  <div>
                    <p className="font-script text-2xl text-cream">{w.title}</p>
                    <p className="text-sm text-cream/80">{w.category}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const techniques = [
  { name: "Акварель", desc: "Прозрачность, лёгкость, поток воды и цвета." },
  { name: "Масло", desc: "Глубина, фактура, бархатные слои живописи." },
  { name: "Графика", desc: "Линия, штрих, выразительность чёрно-белого." },
  { name: "Пастель", desc: "Мягкие касания, нежные переходы и пыльца цвета." },
  { name: "Гуашь", desc: "Яркие плотные мазки, чистые декоративные пятна." },
  { name: "Акрил", desc: "Современная палитра, скорость и насыщенность." },
  { name: "Для детей и родителей", desc: "Совместное творчество — тепло и весело вдвоём." },
];

function Techniques() {
  return (
    <section id="techniques" className="py-28 px-6 bg-gradient-blush">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-script text-2xl text-gradient-gold">направления</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Что будем рисовать</h2>
          <div className="gold-divider w-24 mt-6 mx-auto" />
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            Выбери технику, в которой хочешь раскрыться — или попробуй несколько, чтобы найти свою.
          </p>
        </div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {techniques.map((t) => (
            <article
              key={t.name}
              className="glass rounded-3xl p-8 hover:-translate-y-1 transition shadow-soft"
            >
              <div className="font-script text-3xl text-gradient-gold">✦</div>
              <h3 className="mt-3 text-2xl font-display">{t.name}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Один урок",
      price: formatPriceRub(amountRubForPlan("single")),
      per: "/ 60 минут",
      features: ["Индивидуальный онлайн-урок", "Разбор твоей работы", "Доступ к материалам"],
      featured: false,
    },
    {
      name: "Пакет 5 уроков",
      price: formatPriceRub(amountRubForPlan("pack5")),
      per: "− 20% выгоды",
      features: ["5 уроков в удобное время", "Личная программа", "Чат поддержки между уроками"],
      featured: true,
    },
    {
      name: "Пакет 10 уроков",
      price: formatPriceRub(amountRubForPlan("pack10")),
      per: "− 30% выгоды",
      features: [
        "10 уроков по твоему ритму",
        "Полное погружение в стиль",
        "Бонус: подборка материалов",
      ],
      featured: false,
    },
  ];
  return (
    <section id="pricing" className="py-28 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-script text-2xl text-gradient-gold">уроки</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Цены и пакеты</h2>
          <div className="gold-divider w-24 mt-6 mx-auto" />
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            Выбирай формат, который созвучен тебе — начни с одного урока или погрузись глубже с
            пакетом.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {plans.map((p) => (
            <article
              key={p.name}
              className={`relative rounded-[2rem] p-10 transition hover:-translate-y-1 ${
                p.featured ? "bg-foreground text-background shadow-elegant" : "glass shadow-soft"
              }`}
            >
              {p.featured && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs bg-gradient-gold text-foreground shadow-soft"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  Популярный
                </span>
              )}
              <h3 className="text-2xl font-display">{p.name}</h3>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-display">{p.price}</span>
                <span
                  className={
                    p.featured ? "text-background/70 text-sm" : "text-muted-foreground text-sm"
                  }
                >
                  {p.per}
                </span>
              </div>
              <ul
                className={`mt-8 space-y-3 text-sm ${p.featured ? "text-background/85" : "text-muted-foreground"}`}
              >
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="text-gradient-gold">✦</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`mt-10 inline-flex w-full justify-center rounded-full px-6 py-3 transition ${
                  p.featured
                    ? "bg-background text-foreground hover:opacity-90"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                Записаться
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Выбери урок", d: "Один урок или пакет — то, что тебе сейчас откликается." },
    { n: "02", t: "Забронируй время", d: "Напиши мне — подберём комфортный день и час." },
    {
      n: "03",
      t: "Подключись онлайн",
      d: "Уютная встреча в Zoom, всё необходимое — рядом с тобой.",
    },
    { n: "04", t: "Начни творить", d: "Кисть, цвет, дыхание — и ты уже художница." },
  ];
  return (
    <section className="py-28 px-6 bg-gradient-blush">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-script text-2xl text-gradient-gold">как это работает</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Четыре мягких шага</h2>
          <div className="gold-divider w-24 mt-6 mx-auto" />
        </div>
        <div className="mt-16 grid md:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div
              key={s.n}
              className="glass rounded-3xl p-8 text-center hover:-translate-y-1 transition"
            >
              <div className="font-display text-5xl text-gradient-gold">{s.n}</div>
              <h3 className="mt-4 text-xl">{s.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const items = [
    {
      n: "Мария",
      t: "Алёна — это магия. После первого урока я расплакалась от счастья — рисовать оказалось так просто и так живо.",
    },
    {
      n: "Ольга",
      t: "Я всегда боялась холста. Теперь у меня дома висят три моих картины, и муж не верит, что это я.",
    },
    {
      n: "Анна",
      t: "Это не просто уроки — это терапия цветом. Уютно, женственно, вдохновляюще. Спасибо тебе.",
    },
  ];
  return (
    <section className="py-28 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-script text-2xl text-gradient-gold">отзывы</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Слова моих учениц</h2>
          <div className="gold-divider w-24 mt-6 mx-auto" />
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {items.map((i) => (
            <blockquote
              key={i.n}
              className="glass rounded-3xl p-8 shadow-soft hover:-translate-y-1 transition"
            >
              <p className="text-5xl font-display text-gradient-gold leading-none">“</p>
              <p className="mt-2 text-muted-foreground leading-relaxed">{i.t}</p>
              <footer className="mt-6 font-script text-2xl text-foreground">— {i.n}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [slots, setSlots] = useState<
    { id: string; startAt: string; endAt: string; capacity: number; notes: string | null }[]
  >([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [plan, setPlan] = useState<"single" | "pack5" | "pack10">("single");
  const [slotId, setSlotId] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setSlotsLoading(true);
        setSlotsError(null);
        const res = await fetch("/api/slots");
        if (!res.ok) throw new Error(`Failed to load slots (${res.status})`);
        const data = (await res.json()) as { slots: typeof slots };
        if (cancelled) return;
        setSlots(data.slots);
        setSlotId((prev) => prev || data.slots[0]?.id || "");
      } catch (e) {
        if (cancelled) return;
        setSlotsError(e instanceof Error ? e.message : "Failed to load slots");
      } finally {
        // eslint(no-unsafe-finally): returning from finally can mask errors.
        // Only update state if still mounted.
        if (!cancelled) setSlotsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const slotOptions = useMemo(() => {
    return slots.map((s) => {
      const start = new Date(s.startAt);
      const end = new Date(s.endAt);
      const label = `${start.toLocaleString("ru-RU")} — ${end.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
      return { value: s.id, label };
    });
  }, [slots]);

  const needsSlotPicker = plan === "single";

  useEffect(() => {
    if (plan === "single" && slots.length > 0) {
      setSlotId((prev) => (prev && slots.some((s) => s.id === prev) ? prev : slots[0]!.id));
    } else {
      setSlotId("");
    }
  }, [plan, slots]);

  return (
    <section id="contact" className="py-28 px-6">
      <div className="mx-auto max-w-5xl glass rounded-[2.5rem] p-10 md:p-16 shadow-elegant">
        <div className="text-center">
          <p className="font-script text-2xl text-gradient-gold">давай знакомиться</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Записаться на урок</h2>
          <div className="gold-divider w-24 mt-6 mx-auto" />
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            Выбери дату и оплати — и в день занятия ты получишь напоминание в Telegram.
          </p>
        </div>
        <form
          className="mt-10 grid gap-5"
          onSubmit={async (e) => {
            e.preventDefault();

            if (plan === "single" && !slotId) {
              setSubmitError("Выберите время занятия");
              return;
            }

            setSubmitting(true);
            setSubmitError(null);
            setSuccessBookingId(null);
            try {
              const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  customerName,
                  email,
                  phone,
                  telegramHandle: telegramHandle.trim() ? telegramHandle.trim() : undefined,
                  ...(plan === "single" ? { slotId } : {}),
                  plan,
                }),
              });
              const data = (await res.json()) as
                | { bookingId: string; paymentId: string; checkoutUrl: string | null }
                | { error: string };
              if (!res.ok) {
                throw new Error("error" in data ? data.error : `Failed (${res.status})`);
              }
              setSuccessBookingId((data as { bookingId: string }).bookingId);
              const checkoutUrl =
                "checkoutUrl" in data && typeof data.checkoutUrl === "string"
                  ? data.checkoutUrl
                  : null;
              if (checkoutUrl) {
                window.location.href = checkoutUrl;
                return;
              }
              setCustomerName("");
              setEmail("");
              setPhone("");
              setTelegramHandle("");
            } catch (err) {
              setSubmitError(err instanceof Error ? err.message : "Ошибка отправки");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="grid md:grid-cols-2 gap-5">
            <input
              required
              placeholder="Имя"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="rounded-full px-6 py-4 bg-background/80 border border-border focus:border-foreground/40 outline-none transition"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-full px-6 py-4 bg-background/80 border border-border focus:border-foreground/40 outline-none transition"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <input
              required
              placeholder="Телефон"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-full px-6 py-4 bg-background/80 border border-border focus:border-foreground/40 outline-none transition"
            />
            <input
              placeholder="Telegram (например @username)"
              value={telegramHandle}
              onChange={(e) => setTelegramHandle(e.target.value)}
              className="rounded-full px-6 py-4 bg-background/80 border border-border focus:border-foreground/40 outline-none transition"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as typeof plan)}
              className="rounded-full px-6 py-4 bg-background/80 border border-border focus:border-foreground/40 outline-none transition"
            >
              <option value="single">Один урок · {formatPriceRub(amountRubForPlan("single"))}</option>
              <option value="pack5">Пакет 5 уроков · {formatPriceRub(amountRubForPlan("pack5"))}</option>
              <option value="pack10">Пакет 10 уроков · {formatPriceRub(amountRubForPlan("pack10"))}</option>
            </select>
            {needsSlotPicker ? (
              <select
                required
                value={slotId}
                onChange={(e) => setSlotId(e.target.value)}
                disabled={slotsLoading || slotOptions.length === 0}
                className="rounded-full px-6 py-4 bg-background/80 border border-border focus:border-foreground/40 outline-none transition disabled:opacity-60"
              >
                {slotsLoading ? (
                  <option value="">Загрузка дат...</option>
                ) : slotOptions.length === 0 ? (
                  <option value="">Пока нет свободных дат</option>
                ) : (
                  slotOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))
                )}
              </select>
            ) : (
              <div className="rounded-3xl px-6 py-4 bg-background/80 border border-border text-sm text-muted-foreground leading-relaxed">
                {plan === "pack5"
                  ? "Мы подберём для вас оптимальное время занятия и свяжемся с вами по email или в Telegram."
                  : "После оплаты вы сможете выбрать удобное время для занятий в Telegram."}
              </div>
            )}
          </div>
          <select
            required
            defaultValue=""
            className="rounded-full px-6 py-4 bg-background/80 border border-border focus:border-foreground/40 outline-none transition"
          >
            <option value="" disabled>
              Выбери направление
            </option>
            {techniques.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Комментарий (необязательно)"
            rows={5}
            className="rounded-3xl px-6 py-4 bg-background/80 border border-border focus:border-foreground/40 outline-none transition resize-none"
          />
          {slotsError && <p className="text-sm text-destructive text-center">{slotsError}</p>}
          {submitError && <p className="text-sm text-destructive text-center">{submitError}</p>}
          {successBookingId && (
            <p className="text-sm text-foreground text-center">
              Заявка создана: <span className="font-mono">{successBookingId}</span>. Дальше
              подключим оплату и Telegram.
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || (needsSlotPicker && (slotsLoading || !slotId))}
            className="justify-self-center rounded-full px-10 py-4 bg-foreground text-background hover:scale-[1.03] transition shadow-elegant disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? "Создаю..." : "Перейти к оплате"}
          </button>
        </form>
        <div className="mt-10 flex justify-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition">
            Instagram
          </a>
          <span>·</span>
          <a href="#" className="hover:text-foreground transition">
            Telegram
          </a>
          <span>·</span>
          <a href="#" className="hover:text-foreground transition">
            Pinterest
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 text-center">
      <div className="gold-divider w-32 mx-auto mb-6" />
      <p className="font-script text-3xl text-gradient-gold">Алёна</p>
      <p className="mt-2 text-sm text-muted-foreground">
        © {new Date().getFullYear()} · Создано с любовью к искусству
      </p>
    </footer>
  );
}
