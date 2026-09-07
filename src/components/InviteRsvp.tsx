import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Heart, Check, X, Loader2, Lock, ArrowLeft, Gift } from "lucide-react";
import { toast } from "sonner";

import { getFamilyByCode, setGuestRsvp } from "@/lib/wedding.functions";

export type InviteGuest = {
  id: string;
  name: string;
  is_child: boolean;
  rsvp_status: string;
  responded_at: string | null;
};

export function InviteRsvp({
  initialCode,
  onCodeSubmit,
}: {
  initialCode?: string | undefined;
  onCodeSubmit?: (code: string) => void;
}) {
  const [input, setInput] = useState(initialCode ?? "");
  const [code, setCode] = useState<string | null>(null);
  const [family, setFamily] = useState<{ name: string; surname: string } | null>(null);
  const [guests, setGuests] = useState<InviteGuest[]>([]);

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
      setGuests(res.guests as InviteGuest[]);
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
    if (initialCode && !family && !load.isPending) load.mutate(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = input.replace(/\D/g, "").slice(0, 4);
    if (c.length !== 4) {
      toast.error("Digite os 4 números do seu convite.");
      return;
    }
    onCodeSubmit?.(c);
    load.mutate(c);
  }


  const confirmed = guests.filter((g) => g.rsvp_status === "confirmed").length;
  const declined = guests.filter((g) => g.rsvp_status === "declined").length;
  const pending = guests.filter((g) => g.rsvp_status === "pending").length;
  const allAnswered = guests.length > 0 && pending === 0;

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
          <h1 className="font-serif-display mt-4 text-4xl text-ink md:text-6xl">
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
              placeholder="CÓDIGO DO CONVITE"
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
            <h2 className="font-serif-display text-center text-2xl text-ink md:text-3xl">
              Olá, Família {family.surname}! 💕
            </h2>
            <p className="mt-4 text-center text-sm leading-relaxed text-foreground/75">
              É uma alegria ter vocês conosco! Por favor, confirme a presença de cada integrante
              abaixo.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2 text-[10px] uppercase tracking-[0.25em]">
              <span className="border border-gold/50 bg-offwhite px-3 py-1.5">
                {confirmed} confirmado{confirmed === 1 ? "" : "s"}
              </span>
              <span className="border border-border px-3 py-1.5 text-foreground/60">
                {declined} não {declined === 1 ? "irá" : "irão"}
              </span>
              <span className="border border-border px-3 py-1.5 text-foreground/60">
                {pending} pendente{pending === 1 ? "" : "s"}
              </span>
            </div>

            <ul className="mt-8 space-y-4">
              {guests.map((g) => (
                <li key={g.id} className="border border-border bg-background p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-serif-display text-lg text-ink">
                      {g.name}
                      {g.is_child && (
                        <span className="ml-2 text-[9px] uppercase tracking-[0.25em] text-foreground/50">
                          criança
                        </span>
                      )}
                    </p>
                    <span
                      className={`border px-2.5 py-1 text-[9px] uppercase tracking-[0.25em] ${
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
                          : "Ainda não respondeu"}
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

            {allAnswered && (
              <div className="mt-10 border border-gold/50 bg-offwhite p-6 text-center">
                <p className="text-[10px] uppercase tracking-[0.35em] text-fuchsia">
                  Confirmações da Família {family.surname}
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  {guests.map((g) => (
                    <li key={g.id} className="text-foreground/80">
                      {g.rsvp_status === "confirmed" ? "✓" : "✕"} {g.name} —{" "}
                      {g.rsvp_status === "confirmed" ? "Confirmado" : "Não poderá comparecer"}
                    </li>
                  ))}
                </ul>
                <p className="font-serif-display mt-6 text-lg text-ink">
                  Obrigado por confirmar! Estamos muito felizes em celebrar esse momento com vocês.
                  💍
                </p>
              </div>
            )}

            <p className="mt-8 text-center text-xs italic text-foreground/60">
              Você pode alterar as respostas a qualquer momento até o dia do casamento.
            </p>

            <Link
              to="/"
              hash="presentes"
              className="mt-8 flex w-full items-center justify-center gap-2 border border-ink py-4 text-[10px] uppercase tracking-[0.35em] transition-colors hover:bg-ink hover:text-background"
            >
              <Gift size={13} /> Ver lista de presentes
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
