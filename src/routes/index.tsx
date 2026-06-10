import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Heart,
  MapPin,
  Music2,
  Gift,
  Calendar,
  Mail,
  Menu,
  X,
  Church,
  Wine,
  ChevronLeft,
  Check,
  Utensils,
  Plane,
  Home as HomeIcon,
  Sparkles,
  Sofa,
  Camera,
  Coins,
  Wallet,
} from "lucide-react";

import heroCouple from "@/assets/hero-couple.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import venueImg from "@/assets/venue.jpg";

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
  { id: "historia", label: "História" },
  { id: "galeria", label: "Galeria" },
  { id: "cerimonia", label: "Cerimônia" },
  { id: "recepcao", label: "Recepção" },
  { id: "local", label: "Local" },
  { id: "presentes", label: "Presentes" },
  { id: "rsvp", label: "RSVP" },
  { id: "playlist", label: "Playlist" },
];

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, target.getTime() - now.getTime());
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
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
          <p className="font-serif-display text-lg md:text-2xl tracking-[0.4em] uppercase">
            06 · 03 · 2027
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
          href="#historia"
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
    <section id={id} className={`relative py-28 md:py-40 px-6 md:px-10 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title) && (
          <motion.div {...fadeUp} className="mb-16 text-center">
            {eyebrow && (
              <p className="text-[11px] uppercase tracking-[0.5em] text-fuchsia mb-6">{eyebrow}</p>
            )}
            {title && (
              <h2 className="font-serif-display text-4xl md:text-6xl text-foreground text-balance">
                {title}
              </h2>
            )}
            <Ornament className="mt-8" />
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}

function Historia() {
  return (
    <Section id="historia" eyebrow="Era uma vez" title="Nossa História">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <motion.div {...fadeUp} className="relative">
          <img
            src={gallery1}
            alt="Jhean e Giovanna juntos"
            width={1024}
            height={1280}
            loading="lazy"
            className="w-full aspect-[4/5] object-cover shadow-[0_30px_80px_-30px_rgba(0,0,0,0.3)]"
          />
          <div className="absolute -inset-3 border border-gold/40 -z-10" />
        </motion.div>
        <motion.div {...fadeUp} className="space-y-6 text-foreground/80 leading-relaxed">
          <p className="font-serif-display italic text-2xl text-foreground">
            "Em um olhar, a vida inteira mudou."
          </p>
          <p>
            Foi numa tarde qualquer que tudo começou — daquelas em que o tempo se esquece de passar. Entre risos despretensiosos e conversas que pareciam não ter fim, descobrimos que o mundo era melhor quando vivido em dupla.
          </p>
          <p>
            Anos depois, com a mesma cumplicidade do primeiro encontro, decidimos transformar o nosso "para sempre" em promessa. E agora, queremos celebrar esse capítulo cercados de quem nos faz bem.
          </p>
          <div className="pt-4">
            <Ornament className="justify-start" />
          </div>
        </motion.div>
      </div>
    </Section>
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
    <Section id="galeria" eyebrow="Momentos" title="Galeria" className="bg-offwhite">
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
}: {
  icon: typeof Calendar;
  eyebrow: string;
  title: string;
  time: string;
  place: string;
  address: string;
  mapsUrl: string;
  note: string;
}) {
  return (
    <motion.div
      {...fadeUp}
      className="border border-border bg-card p-10 md:p-14 text-center shadow-[0_20px_60px_-40px_rgba(0,0,0,0.3)]"
    >
      <Icon className="mx-auto text-fuchsia" size={22} />
      <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-foreground/50">{eyebrow}</p>
      <h3 className="font-serif-display text-3xl mt-3">{title}</h3>
      <p className="font-script text-4xl text-fuchsia mt-4">{time}</p>
      <div className="mx-auto my-6 h-px w-16 bg-gold/60" />
      <p className="uppercase tracking-[0.3em] text-xs text-foreground/70">{place}</p>
      <p className="mt-3 text-sm text-foreground/70 leading-relaxed whitespace-pre-line">{address}</p>
      <p className="mt-5 text-xs italic text-foreground/60">{note}</p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-block mt-8 border border-foreground/80 px-8 py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground hover:text-background transition-colors"
      >
        Como chegar
      </a>
    </motion.div>
  );
}

function Cerimonia() {
  return (
    <Section id="cerimonia" eyebrow="06 · Março · 2027" title="A Cerimônia">
      <div className="max-w-2xl mx-auto">
        <EventCard
          icon={Church}
          eyebrow="Celebração religiosa"
          title="Igreja Santa Cecília"
          time="19h00"
          place="Igreja Santa Cecília"
          address={"Av. Jorge Tibiriçá, 364 — Centro\nCruzeiro · SP · 12701-020"}
          mapsUrl="https://www.google.com/maps/search/?api=1&query=Igreja+Santa+Cec%C3%ADlia+Av.+Jorge+Tibiri%C3%A7%C3%A1+364+Cruzeiro+SP"
          note="Pedimos a gentileza de chegar 30 minutos antes. Traje: passeio completo."
        />
      </div>
    </Section>
  );
}

function Recepcao() {
  return (
    <Section id="recepcao" eyebrow="Logo após a cerimônia" title="A Recepção" className="bg-offwhite">
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

function Local() {
  return (
    <Section id="local" eyebrow="Onde nos encontrar" title="Localização">
      <motion.div {...fadeUp} className="space-y-8">
        <div className="relative overflow-hidden">
          <img
            src={venueImg}
            alt="Saruê — Cruzeiro/SP"
            width={1536}
            height={1024}
            loading="lazy"
            className="w-full aspect-[16/9] object-cover"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="flex items-center gap-3 text-foreground/80">
              <MapPin size={18} className="text-fuchsia" />
              R. Ver. Aurélio Garcês Novaes, 81 — Itagaçaba, Cruzeiro/SP
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed max-w-md">
              Um refúgio cercado de jardins e luz natural, escolhido com carinho para receber as pessoas mais importantes das nossas vidas. A apenas alguns minutos da Igreja Santa Cecília.
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Saru%C3%AA+R.+Ver.+Aur%C3%A9lio+Gar%C3%A7%C3%AAs+Novaes+81+Cruzeiro+SP"
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 border border-foreground/80 px-8 py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground hover:text-background transition-colors"
            >
              Ver no mapa
            </a>
          </div>
          <div className="aspect-[4/3] w-full overflow-hidden border border-border">
            <iframe
              title="Mapa do local"
              src="https://www.google.com/maps?q=Saru%C3%AA+R.+Ver.+Aur%C3%A9lio+Gar%C3%A7%C3%AAs+Novaes+81+Cruzeiro+SP&z=15&output=embed"
              className="h-full w-full grayscale"
              loading="lazy"
            />
          </div>
        </div>
      </motion.div>
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

type GiftItem = {
  name: string;
  desc: string;
  value: string;
  category: string;
  image: string;
  cta?: string;
};

const GIFTS: GiftItem[] = [
  {
    name: "Jogo de panelas",
    desc: "Para os jantares românticos do nosso lar",
    value: "R$ 480",
    category: "cozinha",
    image: "https://images.unsplash.com/photo-1584990347449-a2d4c2c9a3a6?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Faqueiro completo",
    desc: "Para receber os queridos à mesa",
    value: "R$ 320",
    category: "cozinha",
    image: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Cafeteira italiana",
    desc: "Para as manhãs lentas a dois",
    value: "R$ 220",
    category: "cozinha",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Passagens aéreas",
    desc: "Um trecho da nossa lua de mel",
    value: "R$ 1.200",
    category: "lua-de-mel",
    image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Diária romântica",
    desc: "Uma noite especial em hotel boutique",
    value: "R$ 850",
    category: "lua-de-mel",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Jantar à beira-mar",
    desc: "Um brinde ao nosso amor",
    value: "R$ 400",
    category: "lua-de-mel",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Jogo de cama king",
    desc: "Para as noites mais aconchegantes",
    value: "R$ 380",
    category: "casa",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Jogo de toalhas",
    desc: "Conforto para o dia a dia",
    value: "R$ 250",
    category: "casa",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Air fryer",
    desc: "Praticidade para o nosso dia a dia",
    value: "R$ 650",
    category: "eletro",
    image: "https://images.unsplash.com/photo-1574269910231-bc508bcb6dbf?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Liquidificador premium",
    desc: "Para sucos, sopas e mais",
    value: "R$ 480",
    category: "eletro",
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Vasos decorativos",
    desc: "Para dar vida aos cantinhos da casa",
    value: "R$ 180",
    category: "deco",
    image: "https://images.unsplash.com/photo-1602874801006-e26c4c5b5a4a?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Quadros para sala",
    desc: "Memórias na parede",
    value: "R$ 300",
    category: "deco",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Ensaio fotográfico",
    desc: "Para eternizar nossa lua de mel",
    value: "R$ 700",
    category: "experiencias",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Passeio de barco",
    desc: "Um dia inesquecível a dois",
    value: "R$ 600",
    category: "experiencias",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Cota Champagne",
    desc: "Um brinde simbólico ao nosso amor",
    value: "R$ 80",
    category: "cotas",
    image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Cota Pétalas",
    desc: "Para enfeitar o nosso altar",
    value: "R$ 50",
    category: "cotas",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Cota Velas",
    desc: "Luz para o nosso novo lar",
    value: "R$ 30",
    category: "cotas",
    image: "https://images.unsplash.com/photo-1602874801006-e26c4c5b5a4a?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "PIX livre",
    desc: "Contribua com o valor que desejar",
    value: "Valor livre",
    category: "pix",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80&auto=format&fit=crop",
    cta: "Copiar chave PIX",
  },
  {
    name: "Envelope dourado",
    desc: "Presente em dinheiro com elegância",
    value: "R$ 200",
    category: "pix",
    image: "https://images.unsplash.com/photo-1556742400-b5b7c5121f7a?w=900&q=80&auto=format&fit=crop",
  },
];

function Presentes() {
  const [active, setActive] = useState("todos");
  const filtered = useMemo(
    () => (active === "todos" ? GIFTS : GIFTS.filter((g) => g.category === active)),
    [active],
  );
  return (
    <Section id="presentes" eyebrow="Com carinho" title="Lista de Presentes" className="bg-offwhite">
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filtered.map((g, i) => (
          <motion.article
            key={g.name + i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: (i % 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="group bg-card border border-border overflow-hidden flex flex-col hover:border-fuchsia/40 transition-colors shadow-[0_20px_60px_-50px_rgba(0,0,0,0.35)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-offwhite">
              <img
                src={g.image}
                alt={g.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-foreground/70">
                {GIFT_CATEGORIES.find((c) => c.id === g.category)?.label}
              </div>
            </div>
            <div className="p-7 text-center flex-1 flex flex-col">
              <h3 className="font-serif-display text-xl">{g.name}</h3>
              <div className="mx-auto my-4 h-px w-10 bg-gold/60" />
              <p className="text-sm text-foreground/70 leading-relaxed flex-1">{g.desc}</p>
              <p className="mt-5 font-serif-display text-2xl text-foreground">{g.value}</p>
              <button className="mt-6 w-full border border-foreground/80 py-3 text-[10px] uppercase tracking-[0.3em] hover:bg-foreground hover:text-background transition-colors">
                {g.cta ?? "Presentear"}
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}

type Family = { id: string; name: string; members: string[] };

const FAMILIES: Family[] = [
  { id: "silva", name: "Família Silva", members: ["Carlos Silva", "Marta Silva", "Pedro Silva", "Ana Silva"] },
  { id: "oliveira", name: "Família Oliveira", members: ["Roberto Oliveira", "Helena Oliveira", "Lucas Oliveira"] },
  { id: "santos", name: "Família Santos", members: ["José Santos", "Maria Santos", "Beatriz Santos", "Rafael Santos"] },
  { id: "almeida", name: "Família Almeida", members: ["Eduardo Almeida", "Camila Almeida"] },
  { id: "ferreira", name: "Família Ferreira", members: ["Marcelo Ferreira", "Patrícia Ferreira", "Júlia Ferreira"] },
  { id: "costa", name: "Família Costa", members: ["André Costa", "Renata Costa", "Sofia Costa", "Miguel Costa"] },
];

function RSVP() {
  const [step, setStep] = useState<"familia" | "membros" | "sucesso">("familia");
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const family = FAMILIES.find((f) => f.id === familyId) ?? null;

  function reset() {
    setStep("familia");
    setFamilyId(null);
    setSelected([]);
    setMessage("");
  }

  return (
    <Section id="rsvp" eyebrow="Confirme sua presença" title="RSVP">
      <motion.div
        {...fadeUp}
        className="mx-auto max-w-2xl bg-card border border-border p-8 md:p-14 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.3)]"
      >
        {step === "familia" && (
          <div>
            <p className="text-center text-sm text-foreground/70 mb-10 leading-relaxed">
              Para manter este momento íntimo, selecione abaixo a <em className="font-serif-display not-italic">sua família</em> para acessarmos sua lista privada de convidados.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {FAMILIES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFamilyId(f.id);
                    setSelected([]);
                    setStep("membros");
                  }}
                  className="group text-left border border-border bg-background hover:border-fuchsia/60 hover:bg-offwhite transition-all p-5"
                >
                  <p className="font-serif-display text-lg">{f.name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-foreground/50">
                    {f.members.length} convidado{f.members.length > 1 ? "s" : ""}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "membros" && family && (
          <div>
            <button
              onClick={() => setStep("familia")}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-foreground/60 hover:text-foreground transition-colors mb-8"
            >
              <ChevronLeft size={12} /> Trocar família
            </button>
            <h3 className="font-serif-display text-2xl text-center">{family.name}</h3>
            <Ornament className="my-6" />
            <p className="text-center text-sm text-foreground/70 mb-8">
              Selecione quem irá comparecer:
            </p>
            <ul className="space-y-2 mb-8">
              {family.members.map((m) => {
                const on = selected.includes(m);
                return (
                  <li key={m}>
                    <label
                      className={`flex items-center justify-between gap-4 px-5 py-4 border cursor-pointer transition-all ${
                        on ? "border-foreground bg-offwhite" : "border-border hover:border-foreground/40"
                      }`}
                    >
                      <span className="font-serif-display text-lg">{m}</span>
                      <span
                        className={`flex items-center justify-center w-6 h-6 border ${
                          on ? "border-foreground bg-foreground text-background" : "border-border"
                        }`}
                      >
                        {on && <Check size={14} />}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={on}
                        onChange={(e) =>
                          setSelected((s) => (e.target.checked ? [...s, m] : s.filter((x) => x !== m)))
                        }
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-3">
                Recado para os noivos (opcional)
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-border bg-background p-4 outline-none focus:border-fuchsia transition-colors resize-none text-sm"
              />
            </div>
            <button
              disabled={selected.length === 0}
              onClick={() => setStep("sucesso")}
              className="mt-8 w-full border border-foreground py-4 text-[11px] uppercase tracking-[0.4em] hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirmar presença
            </button>
          </div>
        )}

        {step === "sucesso" && family && (
          <div className="text-center py-6">
            <Heart className="mx-auto text-fuchsia" size={28} fill="currentColor" />
            <p className="font-serif-display text-3xl md:text-4xl mt-6">Com todo carinho, obrigado!</p>
            <Ornament className="my-8" />
            <p className="text-foreground/70 leading-relaxed max-w-md mx-auto">
              A presença de <span className="font-serif-display italic">{family.name}</span> foi confirmada com {selected.length} convidado{selected.length > 1 ? "s" : ""}. Mal podemos esperar para celebrar esse dia ao seu lado.
            </p>
            <ul className="mt-6 inline-flex flex-wrap justify-center gap-2">
              {selected.map((m) => (
                <li key={m} className="text-[10px] uppercase tracking-[0.25em] border border-border px-3 py-1.5 bg-offwhite">
                  {m}
                </li>
              ))}
            </ul>
            <button
              onClick={reset}
              className="mt-10 text-[10px] uppercase tracking-[0.3em] text-foreground/60 hover:text-foreground transition-colors"
            >
              Confirmar outra família
            </button>
          </div>
        )}
      </motion.div>
    </Section>
  );
}

function Playlist() {
  const songs = [
    { title: "At Last", artist: "Etta James" },
    { title: "La Vie en Rose", artist: "Édith Piaf" },
    { title: "Can't Help Falling in Love", artist: "Elvis Presley" },
    { title: "All of Me", artist: "John Legend" },
    { title: "Thinking Out Loud", artist: "Ed Sheeran" },
    { title: "Como é Grande o Meu Amor", artist: "Roberto Carlos" },
  ];
  return (
    <Section id="playlist" eyebrow="Trilha do nosso amor" title="Playlist do Casal" className="bg-offwhite">
      <motion.div {...fadeUp} className="mx-auto max-w-2xl">
        <ul className="divide-y divide-border border-y border-border">
          {songs.map((s, i) => (
            <li key={s.title} className="flex items-center gap-6 py-5">
              <span className="font-serif-display text-2xl text-gold w-8 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <p className="font-serif-display text-lg">{s.title}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-foreground/60 mt-1">{s.artist}</p>
              </div>
              <Music2 size={16} className="text-fuchsia" />
            </li>
          ))}
        </ul>
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
          14 · 03 · 2026
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
      <p className="mt-4">© 2026 — Feito com amor</p>
    </footer>
  );
}

function Index() {
  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Historia />
        <Galeria />
        <Cerimonia />
        <Recepcao />
        <Local />
        <Presentes />
        <RSVP />
        <Playlist />
        <Final />
      </main>
      <Footer />
    </div>
  );
}