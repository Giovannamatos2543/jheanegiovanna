import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Heart,
  Gift,
  Calendar,
  Mail,
  Menu,
  X,
  Church,
  Wine,
  Utensils,
  Plane,
  Home as HomeIcon,
  Sparkles,
  Sofa,
  Camera,
  Coins,
  Wallet,
  Gem,
  Clock,
  Copy,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { getGifts, registerGiftChoice } from "@/lib/wedding.functions";
import heroCouple from "@/assets/hero-couple.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import ceremonyImg from "@/assets/ceremony-church.jpg";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jhean & Giovanna · 06.03.2027" },
      { name: "description", content: "Site oficial do casamento de Jhean e Giovanna. Nossa história, lista de presentes, RSVP e mais." },
    ],
  }),
  component: Index,
});

const WEDDING_DATE = new Date("2027-03-06T19:00:00-03:00");

const NAV = [
  { id: "galeria", label: "Galeria" },
  { id: "cerimonia", label: "Cerimônia" },
  { id: "recepcao", label: "Recepção" },
  { id: "dresscode", label: "Dress Code" },
  { id: "presentes", label: "Presentes" },
  { id: "rsvp", label: "RSVP" },
];


function useCountdown(target: Date) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const current = now ?? target;
  const diff = Math.max(0, target.getTime() - current.getTime());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/85 backdrop-blur-md border-b border-border/60" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <a href="#top" className={`font-script text-2xl md:text-3xl transition-colors ${scrolled ? "text-foreground" : "text-white drop-shadow"}`}>
          J <span className="text-fuchsia">&amp;</span> G
        </a>
        <ul className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.25em]">
          {NAV.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                className={`transition-colors hover:text-fuchsia ${scrolled ? "text-foreground/80" : "text-white/90"}`}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          aria-label="Abrir menu"
          onClick={() => setOpen((v) => !v)}
          className={`md:hidden ${scrolled ? "text-foreground" : "text-white"}`}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border/60">
          <ul className="flex flex-col px-6 py-4 gap-3 text-sm uppercase tracking-[0.2em]">
            {NAV.map((n) => (
              <li key={n.id}>
                <a onClick={() => setOpen(false)} href={`#${n.id}`} className="block py-2 text-foreground/80">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <span className="h-px w-16 bg-gold/70" />
      <Heart size={12} className="text-fuchsia" fill="currentColor" />
      <span className="h-px w-16 bg-gold/70" />
    </div>
  );
}

function Hero() {
  const c = useCountdown(WEDDING_DATE);
  return (
    <section id="top" className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroCouple}
          alt="Jhean e Giovanna"
          width={1080}
          height={1920}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_50%,transparent_20%,rgba(0,0,0,0.55)_100%)]" />

      </div>

      {/* Monogram backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="font-serif-display text-white/10 text-[40vw] md:text-[28vw] leading-none select-none">
          J&amp;G
        </span>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center text-white">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-[11px] uppercase tracking-[0.5em] text-white/80"
        >
          Nós vamos nos casar
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="font-script mt-6 text-6xl md:text-[8rem] leading-[0.9] text-balance"
        >
          Jhean <span className="text-gold">&amp;</span> Giovanna
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <Ornament />
          <p className="font-serif-display text-2xl md:text-4xl tracking-[0.35em] uppercase text-gold-gradient">
            06 · 03 · 2027
          </p>
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white/80">
            Cruzeiro · SP · Celebração às 18:30
          </p>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="mt-12 grid grid-cols-4 gap-4 md:gap-10"
        >
          {[
            { v: c.d, l: "Dias" },
            { v: c.h, l: "Horas" },
            { v: c.m, l: "Min" },
            { v: c.s, l: "Seg" },
          ].map((it) => (
            <div key={it.l} className="flex flex-col items-center">
              <span className="font-serif-display text-3xl md:text-5xl tabular-nums">
                {String(it.v).padStart(2, "0")}
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/70">{it.l}</span>
            </div>
          ))}
        </motion.div>

        <motion.a
          href="#galeria"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-10 text-[10px] uppercase tracking-[0.4em] text-white/80 hover:text-white"
        >
          Role para descobrir ↓
        </motion.a>
      </div>
    </section>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative py-24 md:py-32 px-6 md:px-10 ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-3xl gold-rule"
      />
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title) && (
          <motion.div {...fadeUp} className="mb-14 text-center">
            {eyebrow && (
              <p className="text-[11px] uppercase tracking-[0.5em] text-fuchsia mb-5 font-normal">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-serif-display text-5xl md:text-7xl text-ink text-balance leading-[1.05]">
                {title}
              </h2>
            )}
            <Ornament className="mt-7" />
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}


function Galeria() {
  const photos = [
    { src: gallery2, span: "md:col-span-2 md:row-span-2 aspect-square", alt: "Mãos com aliança" },
    { src: gallery3, span: "aspect-[3/4]", alt: "Casal ao pôr do sol" },
    { src: gallery4, span: "aspect-[3/4]", alt: "Olhar do casal" },
    { src: gallery1, span: "md:col-span-2 aspect-[16/9]", alt: "Casal sorrindo" },
  ];
  return (
    <Section id="galeria" eyebrow="Momentos" title="Galeria" className="surface-warm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[220px]">
        {photos.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className={`relative overflow-hidden h-full ${p.span}`}
          >
            <img
              src={p.src}
              alt={p.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1400ms] hover:scale-105"
            />
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function EventCard({
  icon: Icon,
  eyebrow,
  title,
  time,
  place,
  address,
  mapsUrl,
  note,
  alert,
}: {
  icon: typeof Calendar;
  eyebrow: string;
  title: string;
  time: string;
  place: string;
  address: string;
  mapsUrl: string;
  note: string;
  alert?: string;
}) {
  return (
    <motion.div {...fadeUp} className="card-elegant relative p-10 md:p-14 text-center">
      <span aria-hidden className="absolute left-6 top-6 h-6 w-6 border-l border-t border-gold/60" />
      <span aria-hidden className="absolute right-6 top-6 h-6 w-6 border-r border-t border-gold/60" />
      <span aria-hidden className="absolute left-6 bottom-6 h-6 w-6 border-l border-b border-gold/60" />
      <span aria-hidden className="absolute right-6 bottom-6 h-6 w-6 border-r border-b border-gold/60" />

      <Icon className="mx-auto text-fuchsia" size={24} />
      <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-foreground/60">{eyebrow}</p>
      <h3 className="font-serif-display text-4xl md:text-5xl mt-3 text-ink">{title}</h3>

      <div className="mt-7 inline-flex flex-col items-center gap-2 border-y border-gold/50 px-10 py-5">
        <span className="text-[10px] uppercase tracking-[0.4em] text-foreground/60">Horário</span>
        <span className="font-serif-display text-5xl md:text-6xl leading-none text-fuchsia tabular-nums">
          {time}
        </span>
      </div>

      {alert && (
        <div className="mt-7 flex items-start gap-3 border border-fuchsia/35 bg-blush/40 px-6 py-5 text-left">
          <Clock size={16} className="mt-0.5 shrink-0 text-fuchsia" />
          <p className="font-serif-display text-lg md:text-xl leading-snug text-ink">{alert}</p>
        </div>
      )}

      <div className="mx-auto my-7 h-px w-24 gold-rule" />
      <p className="uppercase tracking-[0.3em] text-xs text-foreground/80">{place}</p>
      <p className="mt-3 text-sm text-foreground/75 leading-relaxed whitespace-pre-line">{address}</p>
      <p className="mt-5 text-xs italic text-foreground/70">{note}</p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-block mt-8 border border-ink px-8 py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-ink hover:text-background transition-colors"
      >
        Como chegar
      </a>
    </motion.div>
  );
}

function Cerimonia() {
  return (
    <Section id="cerimonia" eyebrow="06 · Março · 2027" title="A Cerimônia" className="surface-romantic">
      <motion.div
        {...fadeUp}
        className="relative overflow-hidden mb-12 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.4)] rounded-sm max-w-5xl mx-auto bg-black/5 ring-1 ring-gold/40"
      >
        <img
          src={ceremonyImg}
          alt="Igreja Santa Cecília — Cruzeiro/SP"
          loading="lazy"
          className="w-full h-auto object-contain object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 pointer-events-none" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/20 pointer-events-none" />
      </motion.div>
      <div className="max-w-2xl mx-auto">
        <EventCard
          icon={Church}
          eyebrow="Celebração religiosa"
          title="Igreja Santa Cecília"
          time="18:30"
          alert="Pedimos, por favor, que não se atrasem. A celebração terá início pontualmente às 18:30."
          place="Igreja Santa Cecília"
          address={"Av. Jorge Tibiriçá, 364 — Centro\nCruzeiro · SP · 12701-020"}
          mapsUrl="https://www.google.com/maps/search/?api=1&query=Igreja+Santa+Cec%C3%ADlia+Av.+Jorge+Tibiri%C3%A7%C3%A1+364+Cruzeiro+SP"
          note="Traje: passeio completo."
        />
      </div>
    </Section>
  );
}


function Recepcao() {
  return (
    <Section id="recepcao" eyebrow="Logo após a cerimônia" title="A Recepção" className="surface-warm">
      <div className="max-w-2xl mx-auto">
        <EventCard
          icon={Wine}
          eyebrow="Jantar & celebração"
          title="Saruê"
          time="21h00"
          place="Saruê Eventos"
          address={"R. Ver. Aurélio Garcês Novaes, 81 — Itagaçaba\nCruzeiro · SP · 12730-130"}
          mapsUrl="https://www.google.com/maps/search/?api=1&query=Saru%C3%AA+R.+Ver.+Aur%C3%A9lio+Gar%C3%A7%C3%AAs+Novaes+81+Cruzeiro+SP"
          note="Jantar, brindes, dança e muito amor. Confirme sua presença até 06.02.2027."
        />
      </div>
    </Section>
  );
}


type GiftCategory = {
  id: string;
  label: string;
  icon: typeof Gift;
};

const GIFT_CATEGORIES: GiftCategory[] = [
  { id: "todos", label: "Todos", icon: Sparkles },
  { id: "cozinha", label: "Cozinha", icon: Utensils },
  { id: "lua-de-mel", label: "Lua de mel", icon: Plane },
  { id: "casa", label: "Casa nova", icon: HomeIcon },
  { id: "eletro", label: "Eletrodomésticos", icon: Sparkles },
  { id: "deco", label: "Decoração", icon: Sofa },
  { id: "experiencias", label: "Experiências", icon: Camera },
  { id: "cotas", label: "Cotas simbólicas", icon: Coins },
  { id: "pix", label: "PIX & Dinheiro", icon: Wallet },
];



function DressCode() {
  return (
    <Section id="dresscode" eyebrow="Traje" title="Dress Code" className="surface-romantic">
      <motion.div
        {...fadeUp}
        className="card-elegant mx-auto max-w-2xl p-12 md:p-16 text-center"
      >

        <Gem className="mx-auto text-fuchsia" size={28} />
        <p className="mt-5 text-[10px] uppercase tracking-[0.4em] text-foreground/50">
          Elegância e conforto
        </p>
        <h3 className="font-serif-display text-3xl md:text-4xl mt-4">Traje Social</h3>
        <div className="mx-auto my-6 h-px w-16 bg-gold/60" />
        <p className="text-foreground/80 leading-relaxed text-lg">
          Para tornar este dia ainda mais especial, pedimos gentilmente que nossos convidados utilizem traje social.
        </p>
        <p className="mt-6 text-sm italic text-foreground/60">
          Queremos que todos estejam confortáveis e elegantes para celebrar esse momento inesquecível conosco.
        </p>
        <div className="mt-8 flex justify-center">
          <Ornament />
        </div>
      </motion.div>
    </Section>
  );
}

const PIX_KEY = "468.378.788-16";
const PIX_OWNER = "Jhean Victor Cipriano Silva";

function PixArea() {
  const [revealed, setRevealed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      toast.success("Chave Pix copiada! 💕");
    } catch {
      setRevealed(true);
      toast.error("Não foi possível copiar. A chave foi exibida abaixo.");
    }
  }

  return (
    <motion.div {...fadeUp} className="card-elegant mx-auto mb-14 max-w-3xl p-8 md:p-12 text-center">
      <Wallet className="mx-auto text-fuchsia" size={24} />
      <h3 className="font-serif-display mt-5 text-2xl md:text-3xl">Presentear com Pix</h3>
      <div className="mx-auto my-5 h-px w-16 bg-gold/60" />
      <p className="mx-auto max-w-lg text-sm leading-relaxed text-foreground/75">
        Se preferir, você pode nos presentear com um Pix — com qualquer valor, do coração. A chave
        está protegida: clique no botão abaixo para copiá-la com segurança.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={copy}
          className="inline-flex items-center gap-3 border border-ink px-8 py-4 text-[11px] uppercase tracking-[0.35em] transition-colors hover:bg-ink hover:text-background"
        >
          <Copy size={13} /> Copiar chave Pix
        </button>
        <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/55">
          Titular: {PIX_OWNER}
        </p>
        {revealed ? (
          <p className="font-serif-display text-lg">CPF: {PIX_KEY}</p>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 hover:text-foreground"
          >
            Ver chave (CPF)
          </button>
        )}
      </div>
      <p className="mt-6 text-xs italic text-foreground/55">
        Após o envio, escolha o presente correspondente abaixo para que possamos agradecer com
        carinho.
      </p>
    </motion.div>
  );
}

function Presentes() {
  const [active, setActive] = useState("todos");
  const [chosen, setChosen] = useState<{ id: string; name: string } | null>(null);
  const [label, setLabel] = useState("");
  const [code, setCode] = useState("");

  const { data: gifts = [], isPending } = useQuery({
    queryKey: ["gifts"],
    queryFn: () => getGifts(),
  });

  const register = useMutation({
    mutationFn: () =>
      registerGiftChoice({
        data: {
          giftId: chosen!.id,
          method: "pix",
          ...(label.trim() ? { guestLabel: label.trim() } : {}),
          ...(code.trim().length >= 4 ? { code: code.trim() } : {}),
        },
      }),
    onSuccess: () => {
      toast.success("Presente registrado! Obrigado de coração 💕");
      setChosen(null);
      setLabel("");
      setCode("");
    },
    onError: () => toast.error("Não foi possível registrar o presente agora."),
  });

  const filtered = useMemo(
    () => (active === "todos" ? gifts : gifts.filter((g) => g.category === active)),
    [active, gifts],
  );

  return (
    <Section id="presentes" eyebrow="Com carinho" title="Lista de Presentes" className="surface-warm">
      <PixArea />

      <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-2 md:gap-3 mb-14">
        {GIFT_CATEGORIES.map((c) => {
          const Icon = c.icon;
          const on = active === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`group inline-flex items-center gap-2 border px-4 md:px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] transition-all ${
                on
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground/70 hover:border-foreground/60"
              }`}
            >
              <Icon size={12} className={on ? "text-gold" : "text-fuchsia"} />
              {c.label}
            </button>
          );
        })}
      </motion.div>

      {isPending && (
        <p className="flex items-center justify-center gap-2 text-sm text-foreground/60">
          <Loader2 size={14} className="animate-spin" /> Carregando presentes…
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filtered.map((g, i) => (
          <motion.article
            key={g.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: (i % 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="group bg-card border border-border overflow-hidden flex flex-col hover:border-fuchsia/40 transition-colors shadow-[0_20px_60px_-50px_rgba(0,0,0,0.35)]"
          >
            {g.image_url ? (
              <div className="relative aspect-[4/3] overflow-hidden bg-offwhite">
                <img
                  src={g.image_url}
                  alt={g.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-foreground/70">
                  {GIFT_CATEGORIES.find((c) => c.id === g.category)?.label ?? g.category}
                </div>
              </div>
            ) : (
              <div className="relative flex aspect-[4/3] items-center justify-center bg-offwhite">
                <Gift size={26} className="text-gold" />
                <div className="absolute top-3 left-3 bg-background/90 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-foreground/70">
                  {GIFT_CATEGORIES.find((c) => c.id === g.category)?.label ?? g.category}
                </div>
              </div>
            )}
            <div className="p-7 text-center flex-1 flex flex-col">
              <h3 className="font-serif-display text-xl">{g.name}</h3>
              <div className="mx-auto my-4 h-px w-10 bg-gold/60" />
              {g.description && (
                <p className="text-sm text-foreground/70 leading-relaxed flex-1">{g.description}</p>
              )}
              {g.value_label && (
                <p className="mt-5 font-serif-display text-2xl text-foreground">{g.value_label}</p>
              )}
              <button
                onClick={() => setChosen({ id: g.id, name: g.name })}
                className="mt-6 w-full border border-foreground/80 py-3 text-[10px] uppercase tracking-[0.3em] hover:bg-foreground hover:text-background transition-colors"
              >
                Presentear
              </button>
            </div>
          </motion.article>
        ))}
      </div>

      {chosen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-5 py-10 backdrop-blur-sm">
          <div className="card-elegant w-full max-w-md bg-background p-7 md:p-10">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-serif-display text-2xl">{chosen.name}</h3>
              <button onClick={() => setChosen(null)} aria-label="Fechar">
                <X size={18} className="text-foreground/60" />
              </button>
            </div>
            <div className="my-5 h-px w-14 bg-gold/60" />
            <p className="text-sm leading-relaxed text-foreground/75">
              Faça o Pix usando a chave copiada e registre abaixo para sabermos de quem veio esse
              carinho. O recebimento é confirmado manualmente pelos noivos.
            </p>
            <label className="mt-6 block text-[10px] uppercase tracking-[0.3em] text-foreground/60">
              Seu nome
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={120}
              className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-fuchsia"
            />
            <label className="mt-5 block text-[10px] uppercase tracking-[0.3em] text-foreground/60">
              Código do convite (opcional)
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm tracking-[0.15em] outline-none focus:border-fuchsia"
            />
            <button
              onClick={() => register.mutate()}
              disabled={register.isPending || (!label.trim() && code.trim().length < 4)}
              className="mt-8 flex w-full items-center justify-center gap-2 border border-ink py-4 text-[11px] uppercase tracking-[0.35em] transition-colors hover:bg-ink hover:text-background disabled:opacity-40"
            >
              {register.isPending && <Loader2 size={14} className="animate-spin" />} Registrar
              presente
            </button>
            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-foreground/50">
              Status inicial: pagamento aguardando confirmação
            </p>
          </div>
        </div>
      )}
    </Section>
  );
}


function RSVP() {
  return (
    <Section id="rsvp" eyebrow="Confirme sua presença" title="RSVP" className="surface-romantic">
      <motion.div {...fadeUp} className="card-elegant mx-auto max-w-2xl p-8 md:p-14 text-center">
        <div className="flex items-center justify-center gap-2 text-foreground/70">
          <Lock size={14} className="text-gold" />
          <span className="text-[10px] uppercase tracking-[0.3em]">Convite privado</span>
        </div>
        <h3 className="font-serif-display mt-6 text-3xl md:text-4xl">
          Cada família tem seu acesso
        </h3>
        <Ornament className="my-7" />
        <p className="mx-auto max-w-md text-foreground/80 leading-relaxed">
          A confirmação de presença é individual e privada. Use o{" "}
          <em className="font-serif-display not-italic">código do seu convite</em> para acessar
          apenas os integrantes da sua família e confirmar (ou recusar) a presença de cada um.
        </p>
        <Link
          to="/convite"
          search={{ codigo: undefined }}

          className="mt-10 inline-flex items-center justify-center gap-3 border border-ink px-10 py-4 text-[11px] uppercase tracking-[0.4em] transition-colors hover:bg-ink hover:text-background"
        >
          <Heart size={13} className="text-fuchsia" fill="currentColor" /> Acessar meu convite
        </Link>
        <p className="mt-6 text-xs italic text-foreground/60">
          Não encontrou seu código? Fale com os noivos.
        </p>
      </motion.div>
    </Section>
  );
}





function Final() {
  return (
    <section className="relative overflow-hidden bg-foreground text-background py-32 md:py-48 px-6 text-center">
      <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-script text-white/5 text-[35vw] leading-none">J&amp;G</span>
      </div>
      <motion.div {...fadeUp} className="relative max-w-2xl mx-auto">
        <Heart className="mx-auto text-fuchsia" size={20} fill="currentColor" />
        <p className="font-serif-display italic text-2xl md:text-3xl mt-8 text-balance leading-relaxed">
          "Que o amor seja a casa, a ponte e o caminho. Hoje, amanhã, e por todos os dias que virão."
        </p>
        <p className="font-script text-5xl md:text-6xl mt-12 text-gold">Jhean &amp; Giovanna</p>
        <p className="mt-6 text-[10px] uppercase tracking-[0.5em] text-background/60">
          06 · 03 · 2027
        </p>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-foreground text-background/60 border-t border-white/10 py-10 px-6 text-center text-[10px] uppercase tracking-[0.3em]">
      <a href="mailto:noivos@jheanegiovanna.com" className="inline-flex items-center gap-2 hover:text-background">
        <Mail size={12} />
        <span>noivos@jheanegiovanna.com</span>
      </a>
      <p className="mt-4">© 2027 — Feito com amor</p>
    </footer>
  );
}

function Index() {
  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Galeria />
        <Cerimonia />
        <Recepcao />
        <DressCode />
        <Presentes />
        <RSVP />
        <Final />

      </main>
      <Footer />
    </div>
  );
}