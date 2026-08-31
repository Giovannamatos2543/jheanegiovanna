import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bell, Gift, Users, Loader2, LogOut, Check, Clock } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  adminOverview,
  adminSetClaimStatus,
  adminMarkNotificationsRead,
} from "@/lib/wedding.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel dos noivos · Jhean & Giovanna" },
      {
        name: "description",
        content:
          "Painel administrativo do casamento: confirmações de presença, presentes e notificações.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel dos noivos · Jhean & Giovanna" },
      {
        property: "og:description",
        content: "Confirmações de presença, presentes e notificações do casamento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando resposta",
  confirmed: "Confirmado",
  declined: "Não comparecerá",
};

const CLAIM_LABEL: Record<string, string> = {
  awaiting_confirmation: "Aguardando confirmação",
  received: "Recebido",
  cancelled: "Cancelado",
};

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleString("pt-BR") : "—";
}

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"rsvp" | "presentes" | "notificacoes">("rsvp");
  const [rsvpFilter, setRsvpFilter] = useState("todos");
  const [claimFilter, setClaimFilter] = useState("todos");

  const { data, isPending, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminOverview(),
  });

  const setStatus = useMutation({
    mutationFn: (v: { claimId: string; status: "awaiting_confirmation" | "received" | "cancelled" }) =>
      adminSetClaimStatus({ data: v }),
    onSuccess: () => {
      toast.success("Status atualizado.");
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: () => toast.error("Não foi possível atualizar."),
  });

  const markRead = useMutation({
    mutationFn: () => adminMarkNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-overview"] }),
  });

  const families = data?.families ?? [];
  const guests = data?.guests ?? [];
  const claims = data?.claims ?? [];
  const notifications = data?.notifications ?? [];

  const rows = useMemo(
    () =>
      families.map((f) => ({
        ...f,
        members: guests.filter((g) => g.family_id === f.id),
      })),
    [families, guests],
  );

  const filteredRows = useMemo(
    () =>
      rows
        .map((r) => ({
          ...r,
          members:
            rsvpFilter === "todos"
              ? r.members
              : r.members.filter((m) => m.rsvp_status === rsvpFilter),
        }))
        .filter((r) => r.members.length > 0),
    [rows, rsvpFilter],
  );

  const filteredClaims = useMemo(
    () => (claimFilter === "todos" ? claims : claims.filter((c) => c.status === claimFilter)),
    [claims, claimFilter],
  );

  const unread = notifications.filter((n) => !n.read_at).length;

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background px-5 py-12 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-fuchsia">Área restrita</p>
            <h1 className="font-serif-display mt-2 text-3xl md:text-4xl">Painel dos noivos</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-[10px] uppercase tracking-[0.25em] text-foreground/60 hover:text-foreground"
            >
              Ver site
            </Link>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 border border-border px-4 py-2 text-[10px] uppercase tracking-[0.25em] hover:border-foreground/60"
            >
              <LogOut size={12} /> Sair
            </button>
          </div>
        </header>

        {error && (
          <p className="mt-8 border border-border bg-offwhite p-6 text-sm text-foreground/70">
            Você está autenticado, mas sem permissão de administrador. Peça para adicionar seu
            usuário como <strong>admin</strong> para visualizar os dados.
          </p>
        )}

        {isPending && (
          <p className="mt-10 flex items-center gap-2 text-sm text-foreground/60">
            <Loader2 size={14} className="animate-spin" /> Carregando…
          </p>
        )}

        {data && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat icon={Users} label="Convidados confirmados" value={guests.filter((g) => g.rsvp_status === "confirmed").length} />
              <Stat icon={Gift} label="Presentes registrados" value={claims.length} />
              <Stat icon={Bell} label="Notificações não lidas" value={unread} />
            </div>

            <nav className="mt-10 flex flex-wrap gap-2">
              {(
                [
                  ["rsvp", "Confirmações"],
                  ["presentes", "Presentes"],
                  ["notificacoes", "Notificações"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`border px-4 py-2 text-[10px] uppercase tracking-[0.25em] transition-colors ${
                    tab === id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/60"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {tab === "rsvp" && (
              <section className="mt-8">
                <FilterBar
                  value={rsvpFilter}
                  onChange={setRsvpFilter}
                  options={[
                    ["todos", "Todos"],
                    ["confirmed", "Confirmados"],
                    ["declined", "Não comparecerão"],
                    ["pending", "Pendentes"],
                  ]}
                />
                <div className="mt-6 space-y-5">
                  {filteredRows.map((f) => (
                    <article key={f.id} className="border border-border bg-card p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h2 className="font-serif-display text-xl">{f.name}</h2>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
                          Código: {f.access_code}
                        </span>
                      </div>
                      <ul className="mt-4 divide-y divide-border text-sm">
                        {f.members.map((m) => (
                          <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                            <span>{m.name}</span>
                            <span className="flex items-center gap-3 text-xs text-foreground/60">
                              <span
                                className={
                                  m.rsvp_status === "confirmed"
                                    ? "text-ink"
                                    : m.rsvp_status === "declined"
                                      ? "text-foreground/50"
                                      : "text-gold"
                                }
                              >
                                {STATUS_LABEL[m.rsvp_status] ?? m.rsvp_status}
                              </span>
                              <span>{fmt(m.responded_at)}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                  {filteredRows.length === 0 && <Empty>Nenhuma família neste filtro.</Empty>}
                </div>
              </section>
            )}

            {tab === "presentes" && (
              <section className="mt-8">
                <FilterBar
                  value={claimFilter}
                  onChange={setClaimFilter}
                  options={[
                    ["todos", "Todos"],
                    ["awaiting_confirmation", "Aguardando confirmação"],
                    ["received", "Recebidos"],
                    ["cancelled", "Cancelados"],
                  ]}
                />
                <p className="mt-4 border border-gold/40 bg-offwhite p-4 text-xs leading-relaxed text-foreground/70">
                  Pagamentos via Pix <strong>não são confirmados automaticamente</strong> — não há
                  integração bancária. Confira o recebimento no seu banco e marque manualmente como
                  “Recebido”.
                </p>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[720px] border border-border text-sm">
                    <thead className="bg-offwhite text-[10px] uppercase tracking-[0.2em] text-foreground/60">
                      <tr>
                        <th className="p-3 text-left">Família / Convidado</th>
                        <th className="p-3 text-left">Presente</th>
                        <th className="p-3 text-left">Valor</th>
                        <th className="p-3 text-left">Data</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClaims.map((c) => (
                        <tr key={c.id} className="border-t border-border">
                          <td className="p-3">
                            {(c.families as { name: string } | null)?.name ?? c.guest_label ?? "Não identificado"}
                          </td>
                          <td className="p-3">{(c.gifts as { name: string } | null)?.name ?? "—"}</td>
                          <td className="p-3">
                            {(c.gifts as { value_label: string | null } | null)?.value_label ??
                              (c.amount_cents ? `R$ ${(c.amount_cents / 100).toFixed(2)}` : "Valor livre")}
                          </td>
                          <td className="p-3 text-xs text-foreground/60">{fmt(c.created_at)}</td>
                          <td className="p-3 text-xs">{CLAIM_LABEL[c.status] ?? c.status}</td>
                          <td className="p-3">
                            {c.status === "received" ? (
                              <button
                                onClick={() =>
                                  setStatus.mutate({ claimId: c.id, status: "awaiting_confirmation" })
                                }
                                className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em]"
                              >
                                <Clock size={11} /> Reabrir
                              </button>
                            ) : (
                              <button
                                onClick={() => setStatus.mutate({ claimId: c.id, status: "received" })}
                                className="inline-flex items-center gap-1.5 border border-ink px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-background"
                              >
                                <Check size={11} /> Marcar recebido
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredClaims.length === 0 && <Empty>Nenhum presente neste filtro.</Empty>}
              </section>
            )}

            {tab === "notificacoes" && (
              <section className="mt-8">
                <div className="flex justify-end">
                  <button
                    onClick={() => markRead.mutate()}
                    className="border border-border px-4 py-2 text-[10px] uppercase tracking-[0.25em] hover:border-foreground/60"
                  >
                    Marcar todas como lidas
                  </button>
                </div>
                <ul className="mt-6 space-y-3">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`border p-4 ${n.read_at ? "border-border bg-card" : "border-fuchsia/40 bg-blush/30"}`}
                    >
                      <p className="font-serif-display text-lg">{n.title}</p>
                      <p className="mt-1 text-sm text-foreground/75">{n.body}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                        {fmt(n.created_at)}
                      </p>
                    </li>
                  ))}
                  {notifications.length === 0 && <Empty>Nenhuma notificação ainda.</Empty>}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <Icon size={16} className="text-fuchsia" />
      <p className="font-serif-display mt-3 text-3xl">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-foreground/55">{label}</p>
    </div>
  );
}

function FilterBar({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
            value === id ? "border-foreground bg-offwhite" : "border-border text-foreground/60"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 text-sm italic text-foreground/55">{children}</p>;
}
