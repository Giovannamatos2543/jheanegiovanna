import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Heart, Check, X, Loader2, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { getFamilyByCode, setGuestRsvp } from "@/lib/wedding.functions";

type Guest = {
  id: string;
  name: string;
  is_child: boolean;
  rsvp_status: string;
  responded_at: string | null;
};

export const Route = createFileRoute("/convite")({
  validateSearch: (search: Record<string, unknown>) => ({
    codigo: typeof search["codigo"] === "string" ? (search["codigo"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Confirmação de presença · Jhean & Giovanna" },
      {
        name: "description",
        content:
          "Área privada de confirmação de presença do casamento de Jhean e Giovanna. Acesse com o código do seu convite.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Confirmação de presença · Jhean & Giovanna" },
      {
        property: "og:description",
        content: "Acesse com o código do seu convite para confirmar a presença da sua família.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConvitePage,
});

function ConvitePage() {
  const { codigo } = Route.useSearch();
  const navigate = useNavigate({ from: "/convite" });
  const [input, setInput] = useState(codigo ?? "");
  const [code, setCode] = useState<string | null>(null);
  const [family, setFamily] = useState<{ name: string; surname: string } | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);

  const load = useMutation({
    mutationFn: (c: string) => getFamilyByCode({ data: { code: c } }),
    onSuccess: (res, c) => {
      if (!res.found) {
        toast.error("Código não encontrado. Confira o código do seu convite.");
        setFamily(null);
        setCode(null);
        return;
      }
      setCode(c.trim().toUpperCase());
      setFamily(res.family);
      setGuests(res.guests as Guest[]);
    },
    onError: () => toast.error("Não foi possível validar o código agora."),
  });

  const respond = useMutation({
    mutationFn: (vars: { guestId: string; status: "confirmed" | "declined" }) =>
      setGuestRsvp({ data: { code: code!, guestId: vars.guestId, status: vars.status } }),
    onSuccess: ({ guest }) => {
      setGuests((gs) =>
        gs.map((g) =>
          g.id === guest.id
            ? { ...g, rsvp_status: guest.rsvp_status, responded_at: guest.responded_at }
            : g,
        ),
      );
      toast.success(
        guest.rsvp_status === "confirmed"
          ? `Presença de ${guest.name} confirmada! 💕`
          : `Registramos que ${guest.name} não poderá comparecer.`,
      );
    },
    onError: () => toast.error("Não foi possível registrar a resposta."),
  });

  useEffect(() => {
    if (codigo && !family && !load.isPending) load.mutate(codigo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim().length < 4) return;
    navigate({ search: { codigo: input.trim().toUpperCase() } });
    load.mutate(input);
  }

  const confirmed = guests.filter((g) => g.rsvp_status === "confirmed").length;
  const pending = guests.filter((g) => g.rsvp_status === "pending").length;

  return (
    <div className="surface-romantic min-h-screen px-5 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-foreground/60 transition-colors hover:text-foreground"
        >
          <ArrowLeft size={12} /> Voltar ao site
        </Link>

        <div className="mt-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.5em] text-fuchsia">Convite privado</p>
          <h1 className="font-serif-display mt-4 text-4xl md:text-6xl text-ink">
            Confirmação de presença
          </h1>
          <div className="mx-auto mt-6 flex items-center justify-center gap-4">
            <span className="h-px w-14 bg-gold/70" />
            <Heart size={12} className="text-fuchsia" fill="currentColor" />
            <span className="h-px w-14 bg-gold/70" />
          </div>
        </div>

        {!family && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            onSubmit={submit}
            className="card-elegant mt-12 p-8 md:p-12"
          >
            <div className="flex items-center justify-center gap-2 text-foreground/70">
              <Lock size={14} className="text-gold" />
              <span className="text-[10px] uppercase tracking-[0.3em]">Acesso exclusivo</span>
            </div>
            <p className="mt-6 text-center text-sm leading-relaxed text-foreground/75">
              Digite o código que você recebeu no seu convite. Cada família possui um código
              exclusivo e visualiza apenas os seus próprios integrantes.
            </p>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="EX: FAMILIA-0000"
              className="font-serif-display mt-8 w-full border border-border bg-background px-5 py-4 text-center text-xl tracking-[0.2em] outline-none transition-colors focus:border-fuchsia"
            />
            <button
              type="submit"
              disabled={load.isPending}
              className="mt-6 flex w-full items-center justify-center gap-2 border border-ink py-4 text-[11px] uppercase tracking-[0.4em] transition-colors hover:bg-ink hover:text-background disabled:opacity-40"
            >
              {load.isPending && <Loader2 size={14} className="animate-spin" />} Acessar meu convite
            </button>
          </motion.form>
        )}

        {family && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="card-elegant mt-12 p-7 md:p-12"
          >
            <h2 className="font-serif-display text-center text-2xl md:text-3xl text-ink">
              Olá, Família {family.surname}! 💍
            </h2>
            <p className="mt-4 text-center text-sm leading-relaxed text-foreground/75">
              É uma alegria ter vocês conosco. Por favor, confirme a presença de cada integrante
              abaixo.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2 text-[10px] uppercase tracking-[0.25em]">
              <span className="border border-gold/50 bg-offwhite px-3 py-1.5">
                {confirmed} confirmado{confirmed === 1 ? "" : "s"}
              </span>
              <span className="border border-border px-3 py-1.5 text-foreground/60">
                {pending} pendente{pending === 1 ? "" : "s"}
              </span>
            </div>

            <ul className="mt-8 space-y-4">
              {guests.map((g) => (
                <li key={g.id} className="border border-border bg-background p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-serif-display text-lg text-ink">{g.name}</p>
                    <span
                      className={`text-[9px] uppercase tracking-[0.25em] px-2.5 py-1 border ${
                        g.rsvp_status === "confirmed"
                          ? "border-fuchsia/50 bg-blush/50 text-ink"
                          : g.rsvp_status === "declined"
                            ? "border-border text-foreground/50"
                            : "border-gold/50 text-foreground/60"
                      }`}
                    >
                      {g.rsvp_status === "confirmed"
                        ? "Presença confirmada"
                        : g.rsvp_status === "declined"
                          ? "Não poderá comparecer"
                          : "Aguardando resposta"}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      onClick={() => respond.mutate({ guestId: g.id, status: "confirmed" })}
                      disabled={respond.isPending}
                      className={`inline-flex items-center justify-center gap-2 border py-3 text-[10px] uppercase tracking-[0.25em] transition-colors disabled:opacity-40 ${
                        g.rsvp_status === "confirmed"
                          ? "border-ink bg-ink text-background"
                          : "border-ink/70 hover:bg-ink hover:text-background"
                      }`}
                    >
                      <Check size={13} /> Confirmo minha presença
                    </button>
                    <button
                      onClick={() => respond.mutate({ guestId: g.id, status: "declined" })}
                      disabled={respond.isPending}
                      className={`inline-flex items-center justify-center gap-2 border py-3 text-[10px] uppercase tracking-[0.25em] transition-colors disabled:opacity-40 ${
                        g.rsvp_status === "declined"
                          ? "border-foreground/60 bg-muted text-foreground"
                          : "border-border hover:border-foreground/60"
                      }`}
                    >
                      <X size={13} /> Não poderei comparecer
                    </button>
                  </div>
                  {g.responded_at && (
                    <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                      Respondido em {new Date(g.responded_at).toLocaleString("pt-BR")}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-8 text-center text-xs italic text-foreground/60">
              Você pode alterar as respostas a qualquer momento até o dia do casamento.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
