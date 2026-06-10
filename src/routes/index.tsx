import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Heart, MapPin, Music2, Gift, Calendar, Mail, Menu, X } from "lucide-react";

import heroCouple from "@/assets/hero-couple.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import venueImg from "@/assets/venue.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jhean & Giovanna · 14.03.2026" },
      { name: "description", content: "Site oficial do casamento de Jhean e Giovanna. Nossa história, lista de presentes, RSVP e mais." },
    ],
  }),
  component: Index,
});

const WEDDING_DATE = new Date("2026-03-14T17:00:00-03:00");

const NAV = [
  { id: "historia", label: "História" },
  { id: "galeria", label: "Galeria" },
  { id: "cerimonia", label: "Cerimônia" },
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
            14 · 03 · 2026
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

function Cerimonia() {
  return (
    <Section id="cerimonia" eyebrow="Save the date" title="Cerimônia & Recepção">
      <div className="grid md:grid-cols-2 gap-10">
        {[
          {
            icon: Calendar,
            title: "Cerimônia",
            time: "17h00",
            place: "Capela Santa Clara",
            note: "Traje passeio completo. Recepção logo após a cerimônia.",
          },
          {
            icon: Heart,
            title: "Recepção",
            time: "19h00",
            place: "Villa Bianca",
            note: "Jantar, brindes e muito amor. Confirme presença até 14.02.2026.",
          },
        ].map((c) => (
          <motion.div
            key={c.title}
            {...fadeUp}
            className="border border-border bg-card p-10 md:p-14 text-center shadow-[0_20px_60px_-40px_rgba(0,0,0,0.3)]"
          >
            <c.icon className="mx-auto text-fuchsia" size={22} />
            <h3 className="font-serif-display text-3xl mt-6">{c.title}</h3>
            <p className="font-script text-4xl text-fuchsia mt-4">{c.time}</p>
            <p className="mt-4 uppercase tracking-[0.3em] text-xs text-foreground/70">{c.place}</p>
            <div className="mx-auto my-6 h-px w-16 bg-gold/60" />
            <p className="text-sm text-foreground/70 leading-relaxed">{c.note}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function Local() {
  return (
    <Section id="local" eyebrow="Onde nos encontrar" title="O Local">
      <motion.div {...fadeUp} className="space-y-8">
        <div className="relative overflow-hidden">
          <img
            src={venueImg}
            alt="Villa Bianca"
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
              Rua das Acácias, 1500 — Jardim das Flores, SP
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed max-w-md">
              Um refúgio cercado de jardins e luz natural, escolhido com carinho para receber as pessoas mais importantes das nossas vidas.
            </p>
            <a
              href="https://maps.google.com/?q=Villa+Bianca"
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
              src="https://www.google.com/maps?q=-23.5505,-46.6333&z=14&output=embed"
              className="h-full w-full grayscale"
              loading="lazy"
            />
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

function Presentes() {
  const gifts = [
    { name: "Lua de Mel", desc: "Contribua com nossa viagem dos sonhos", value: "Valor livre" },
    { name: "Nosso Lar", desc: "Itens para começarmos a nossa casa", value: "A partir de R$ 150" },
    { name: "Cota Especial", desc: "Um mimo para o grande dia", value: "R$ 300" },
  ];
  return (
    <Section id="presentes" eyebrow="Com carinho" title="Lista de Presentes" className="bg-offwhite">
      <div className="grid md:grid-cols-3 gap-6">
        {gifts.map((g, i) => (
          <motion.div
            key={g.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            className="group bg-card p-10 text-center border border-border hover:border-fuchsia/50 transition-colors"
          >
            <Gift size={20} className="mx-auto text-gold group-hover:text-fuchsia transition-colors" />
            <h3 className="font-serif-display text-2xl mt-6">{g.name}</h3>
            <div className="mx-auto my-5 h-px w-12 bg-gold/60" />
            <p className="text-sm text-foreground/70 leading-relaxed">{g.desc}</p>
            <p className="mt-5 text-xs uppercase tracking-[0.25em] text-foreground/60">{g.value}</p>
            <button className="mt-8 w-full border border-foreground/80 py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-foreground hover:text-background transition-colors">
              Presentear
            </button>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function RSVP() {
  const [sent, setSent] = useState(false);
  return (
    <Section id="rsvp" eyebrow="Confirme sua presença" title="RSVP">
      <motion.form
        {...fadeUp}
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
        className="mx-auto max-w-2xl space-y-8 bg-card border border-border p-10 md:p-14 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.3)]"
      >
        {sent ? (
          <div className="text-center py-10">
            <Heart className="mx-auto text-fuchsia" size={28} fill="currentColor" />
            <p className="font-serif-display text-3xl mt-6">Obrigado!</p>
            <p className="mt-4 text-foreground/70">Sua presença foi confirmada com carinho.</p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-3">
                Seu nome completo
              </label>
              <input
                required
                type="text"
                className="w-full border-b border-border bg-transparent py-3 outline-none focus:border-fuchsia transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-3">
                E-mail
              </label>
              <input
                required
                type="email"
                className="w-full border-b border-border bg-transparent py-3 outline-none focus:border-fuchsia transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-3">
                Acompanhantes
              </label>
              <select className="w-full border-b border-border bg-transparent py-3 outline-none focus:border-fuchsia transition-colors">
                <option>Apenas eu</option>
                <option>+ 1 acompanhante</option>
                <option>+ 2 acompanhantes</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-3">
                Recado para os noivos
              </label>
              <textarea
                rows={3}
                className="w-full border-b border-border bg-transparent py-3 outline-none focus:border-fuchsia transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full border border-foreground py-4 text-[11px] uppercase tracking-[0.4em] hover:bg-foreground hover:text-background transition-colors"
            >
              Confirmar presença
            </button>
          </>
        )}
      </motion.form>
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
        <Mail size={12} /> noivos@jheanegiovanna.com
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