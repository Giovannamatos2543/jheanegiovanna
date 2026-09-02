import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Bell,
  Gift,
  Users,
  Loader2,
  LogOut,
  Check,
  Clock,
  Copy,
  Share2,
  Trash2,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  adminOverview,
  adminSetClaimStatus,
  adminMarkNotificationsRead,
  adminCreateFamily,
  adminUpdateFamily,
  adminDeleteFamily,
  adminRegenerateCode,
  claimAdminAccess,
} from "@/lib/wedding.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel dos noivos · Jhean & Giovanna" },
      {
        name: "description",
        content:
          "Painel administrativo do casamento: famílias, confirmações de presença, presentes e notificações.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel dos noivos · Jhean & Giovanna" },
      {
        property: "og:description",
        content: "Famílias, confirmações de presença, presentes e notificações do casamento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Ainda não respondeu",
  confirmed: "Confirmado",
  declined: "Não poderá comparecer",
};

const CLAIM_LABEL: Record<string, string> = {
  awaiting_confirmation: "Aguardando confirmação",
  received: "Recebido",
  cancelled: "Não recebido",
};

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleString("pt-BR") : "—";
}

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type MemberDraft = { id?: string; name: string; isChild: boolean };

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"familias" | "rsvp" | "presentes" | "notificacoes">("familias");
  const [rsvpFilter, setRsvpFilter] = useState("todos");
  const [claimFilter, setClaimFilter] = useState("todos");
  const [editing, setEditing] = useState<
    | null
    | { id?: string; name: string; surname: string; members: MemberDraft[] }
  >(null);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminOverview(),
    retry: false,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-overview"] });

  const claimAdmin = useMutation({
    mutationFn: () => claimAdminAccess(),
    onSuccess: () => {
      toast.success("Acesso de administrador concedido!");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Não foi possível conceder."),
  });

  const setStatus = useMutation({
    mutationFn: (v: {
      claimId: string;
      status: "awaiting_confirmation" | "received" | "cancelled";
    }) => adminSetClaimStatus({ data: v }),
    onSuccess: () => {
      toast.success("Status atualizado.");
      refresh();
    },
    onError: () => toast.error("Não foi possível atualizar."),
  });

  const markRead = useMutation({
    mutationFn: (id?: string) => adminMarkNotificationsRead({ data: id ? { id } : {} }),
    onSuccess: refresh,
  });

  const saveFamily = useMutation({
    mutationFn: async (v: {
      id?: string;
      name: string;
      surname: string;
      members: MemberDraft[];
    }) => {
      const members = v.members
        .filter((m) => m.name.trim().length > 0)
        .map((m) => ({ ...(m.id ? { id: m.id } : {}), name: m.name.trim(), isChild: m.isChild }));
      if (v.id) {
        await adminUpdateFamily({ data: { id: v.id, name: v.name, surname: v.surname, members } });
        return { ok: true };
      }
      await adminCreateFamily({ data: { name: v.name, surname: v.surname, members } });
      return { ok: true };
    },
    onSuccess: () => {
      toast.success("Família salva! 💕");
      setEditing(null);
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Não foi possível salvar."),
  });

  const removeFamily = useMutation({
    mutationFn: (id: string) => adminDeleteFamily({ data: { id } }),
    onSuccess: () => {
      toast.success("Família excluída.");
      refresh();
    },
    onError: () => toast.error("Não foi possível excluir."),
  });

  const regenerate = useMutation({
    mutationFn: (id: string) => adminRegenerateCode({ data: { id } }),
    onSuccess: () => {
      toast.success("Novo código gerado.");
      refresh();
    },
    onError: () => toast.error("Não foi possível gerar novo código."),
  });

  const families = data?.families ?? [];
  const guests = data?.guests ?? [];
  const claims = data?.claims ?? [];
  const notifications = data?.notifications ?? [];

  const rows = useMemo(
    () =>
      families.map((f) => {
        const members = guests.filter((g) => g.family_id === f.id);
        return {
          ...f,
          members,
          confirmed: members.filter((m) => m.rsvp_status === "confirmed").length,
          declined: members.filter((m) => m.rsvp_status === "declined").length,
          pending: members.filter((m) => m.rsvp_status === "pending").length,
          lastUpdate:
            members
              .map((m) => m.responded_at)
              .filter(Boolean)
              .sort()
              .at(-1) ?? null,
        };
      }),
    [families, guests],
  );

  const totals = useMemo(
    () => ({
      guests: guests.length,
      confirmed: guests.filter((g) => g.rsvp_status === "confirmed").length,
      declined: guests.filter((g) => g.rsvp_status === "declined").length,
      pending: guests.filter((g) => g.rsvp_status === "pending").length,
    }),
    [guests],
  );

  const giftTotals = useMemo(() => {
    const sum = (s: string) =>
      claims.filter((c) => c.status === s).reduce((acc, c) => acc + (c.amount_cents ?? 0), 0);
    return { count: claims.length, received: sum("received"), awaiting: sum("awaiting_confirmation") };
  }, [claims]);

  const filteredRows = useMemo(
    () =>
      rows
        .map((r) => ({
          ...r,
          visible:
            rsvpFilter === "todos"
              ? r.members
              : r.members.filter((m) => m.rsvp_status === rsvpFilter),
        }))
        .filter((r) => rsvpFilter === "todos" || r.visible.length > 0),
    [rows, rsvpFilter],
  );

  const filteredClaims = useMemo(
    () => (claimFilter === "todos" ? claims : claims.filter((c) => c.status === claimFilter)),
    [claims, claimFilter],
  );

  const unread = notifications.filter((n) => !n.read_at).length;

  function inviteLink(code: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/convite/${code}`;
  }

  async function copyLink(code: string) {
    try {
      await navigator.clipboard.writeText(inviteLink(code));
      toast.success("Link do convite copiado! 💕");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  async function shareLink(name: string, code: string) {
    const url = inviteLink(code);
    const text = `Convite do casamento de Jhean & Giovanna — ${name}: ${url}`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "Convite de casamento", text, url });
        return;
      } catch {
        /* usuário cancelou */
      }
    }
    await copyLink(code);
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:px-10 md:py-12">
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
          <div className="mt-8 border border-gold/50 bg-offwhite p-6">
            <p className="text-sm leading-relaxed text-foreground/75">
              Sua conta está autenticada, mas ainda não é <strong>administradora</strong>. Se você é
              o(a) noivo(a) e este é o primeiro acesso, clique abaixo para receber o papel de admin.
            </p>
            <button
              onClick={() => claimAdmin.mutate()}
              disabled={claimAdmin.isPending}
              className="mt-5 inline-flex items-center gap-2 border border-ink px-5 py-3 text-[10px] uppercase tracking-[0.3em] hover:bg-ink hover:text-background disabled:opacity-40"
            >
              {claimAdmin.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <ShieldCheck size={13} />
              )}
              Tornar-me administrador
            </button>
          </div>
        )}

        {isPending && (
          <p className="mt-10 flex items-center gap-2 text-sm text-foreground/60">
            <Loader2 size={14} className="animate-spin" /> Carregando…
          </p>
        )}

        {data && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={Users} label="Total de convidados" value={totals.guests} />
              <Stat icon={Check} label="Confirmados" value={totals.confirmed} />
              <Stat icon={Gift} label="Presentes registrados" value={giftTotals.count} />
              <Stat
                icon={Bell}
                label="Notificações não lidas"
                value={unread}
                highlight={unread > 0}
              />
            </div>

            <nav className="mt-10 flex flex-wrap gap-2">
              {(
                [
                  ["familias", "Famílias"],
                  ["rsvp", "Confirmações"],
                  ["presentes", "Presentes"],
                  ["notificacoes", `Notificações${unread ? ` (${unread})` : ""}`],
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

            {tab === "familias" && (
              <section className="mt-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-foreground/70">
                    {families.length} família{families.length === 1 ? "" : "s"} cadastrada
                    {families.length === 1 ? "" : "s"}
                  </p>
                  <button
                    onClick={() =>
                      setEditing({ name: "", surname: "", members: [{ name: "", isChild: false }] })
                    }
                    className="inline-flex items-center gap-2 border border-ink px-4 py-2.5 text-[10px] uppercase tracking-[0.3em] hover:bg-ink hover:text-background"
                  >
                    <Plus size={13} /> Nova família
                  </button>
                </div>

                {editing && (
                  <FamilyForm
                    value={editing}
                    onChange={setEditing}
                    onCancel={() => setEditing(null)}
                    onSave={() => saveFamily.mutate(editing)}
                    saving={saveFamily.isPending}
                  />
                )}

                <div className="mt-6 space-y-5">
                  {rows.map((f) => (
                    <article key={f.id} className="border border-border bg-card p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="font-serif-display text-xl">{f.name}</h2>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-foreground/55">
                            Sobrenome: {f.surname} · Código: <strong>{f.access_code}</strong>
                          </p>
                          <p className="mt-1 break-all text-xs text-foreground/50">
                            {inviteLink(f.access_code)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <IconBtn onClick={() => copyLink(f.access_code)} icon={Copy}>
                            Copiar link do convite
                          </IconBtn>
                          <IconBtn
                            onClick={() => shareLink(f.name, f.access_code)}
                            icon={Share2}
                          >
                            Compartilhar convite
                          </IconBtn>
                          <IconBtn
                            onClick={() =>
                              setEditing({
                                id: f.id,
                                name: f.name,
                                surname: f.surname,
                                members: f.members.map((m) => ({
                                  id: m.id,
                                  name: m.name,
                                  isChild: m.is_child,
                                })),
                              })
                            }
                            icon={Pencil}
                          >
                            Editar
                          </IconBtn>
                          <IconBtn onClick={() => regenerate.mutate(f.id)} icon={RefreshCw}>
                            Novo código
                          </IconBtn>
                          <IconBtn
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Excluir ${f.name} e todos os seus integrantes? Esta ação não pode ser desfeita.`,
                                )
                              )
                                removeFamily.mutate(f.id);
                            }}
                            icon={Trash2}
                          >
                            Excluir
                          </IconBtn>
                        </div>
                      </div>
                      <ul className="mt-4 divide-y divide-border text-sm">
                        {f.members.map((m) => (
                          <li
                            key={m.id}
                            className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                          >
                            <span>
                              {m.name}
                              {m.is_child && (
                                <span className="ml-2 text-[9px] uppercase tracking-[0.2em] text-foreground/45">
                                  criança
                                </span>
                              )}
                            </span>
                            <span className="flex items-center gap-3 text-xs text-foreground/60">
                              <StatusText status={m.rsvp_status} />
                              <span>{fmt(m.responded_at)}</span>
                            </span>
                          </li>
                        ))}
                        {f.members.length === 0 && (
                          <li className="py-2.5 text-xs italic text-foreground/55">
                            Nenhum integrante cadastrado.
                          </li>
                        )}
                      </ul>
                    </article>
                  ))}
                  {rows.length === 0 && !editing && (
                    <Empty>Nenhuma família cadastrada ainda. Clique em “Nova família”.</Empty>
                  )}
                </div>
              </section>
            )}

            {tab === "rsvp" && (
              <section className="mt-8">
                <div className="grid gap-3 sm:grid-cols-4">
                  <MiniStat label="Total de convidados" value={totals.guests} />
                  <MiniStat label="Confirmados" value={totals.confirmed} />
                  <MiniStat label="Não poderão comparecer" value={totals.declined} />
                  <MiniStat label="Aguardando resposta" value={totals.pending} />
                </div>
                <div className="mt-6">
                  <FilterBar
                    value={rsvpFilter}
                    onChange={setRsvpFilter}
                    options={[
                      ["todos", "Todos"],
                      ["confirmed", "Confirmados"],
                      ["pending", "Não confirmados"],
                      ["declined", "Não poderão comparecer"],
                    ]}
                  />
                </div>
                <div className="mt-6 space-y-5">
                  {filteredRows.map((f) => (
                    <article key={f.id} className="border border-border bg-card p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h2 className="font-serif-display text-xl">{f.name}</h2>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
                          {f.confirmed} confirmados · {f.declined} não irão · {f.pending} pendentes
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-foreground/45">
                        Última atualização: {fmt(f.lastUpdate)}
                      </p>
                      <ul className="mt-4 divide-y divide-border text-sm">
                        {f.visible.map((m) => (
                          <li
                            key={m.id}
                            className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                          >
                            <span>{m.name}</span>
                            <span className="flex items-center gap-3 text-xs text-foreground/60">
                              <StatusText status={m.rsvp_status} />
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
                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniStat label="Total de presentes" value={giftTotals.count} />
                  <MiniStat label="Valor total recebido" value={brl(giftTotals.received)} />
                  <MiniStat label="Aguardando confirmação" value={brl(giftTotals.awaiting)} />
                </div>
                <div className="mt-6">
                  <FilterBar
                    value={claimFilter}
                    onChange={setClaimFilter}
                    options={[
                      ["todos", "Todos"],
                      ["awaiting_confirmation", "Aguardando confirmação"],
                      ["received", "Recebidos"],
                      ["cancelled", "Não recebidos"],
                    ]}
                  />
                </div>
                <p className="mt-4 border border-gold/40 bg-offwhite p-4 text-xs leading-relaxed text-foreground/70">
                  Pagamentos via Pix <strong>não são confirmados automaticamente</strong> — não há
                  integração bancária. Confira o recebimento no seu banco e marque manualmente como
                  “Recebido”.
                </p>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[760px] border border-border text-sm">
                    <thead className="bg-offwhite text-[10px] uppercase tracking-[0.2em] text-foreground/60">
                      <tr>
                        <th className="p-3 text-left">Família / Convidado</th>
                        <th className="p-3 text-left">Presente</th>
                        <th className="p-3 text-left">Valor</th>
                        <th className="p-3 text-left">Data</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClaims.map((c) => (
                        <tr key={c.id} className="border-t border-border">
                          <td className="p-3">
                            {(c.families as { name: string } | null)?.name ??
                              c.guest_label ??
                              "Não identificado"}
                          </td>
                          <td className="p-3">
                            {(c.gifts as { name: string } | null)?.name ?? "—"}
                          </td>
                          <td className="p-3">
                            {(c.gifts as { value_label: string | null } | null)?.value_label ??
                              (c.amount_cents ? brl(c.amount_cents) : "Valor livre")}
                          </td>
                          <td className="p-3 text-xs text-foreground/60">{fmt(c.created_at)}</td>
                          <td className="p-3 text-xs">{CLAIM_LABEL[c.status] ?? c.status}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {c.status !== "received" && (
                                <IconBtn
                                  onClick={() =>
                                    setStatus.mutate({ claimId: c.id, status: "received" })
                                  }
                                  icon={Check}
                                >
                                  Marcar como recebido
                                </IconBtn>
                              )}
                              {c.status !== "cancelled" && (
                                <IconBtn
                                  onClick={() =>
                                    setStatus.mutate({ claimId: c.id, status: "cancelled" })
                                  }
                                  icon={X}
                                >
                                  Não recebido
                                </IconBtn>
                              )}
                              {c.status !== "awaiting_confirmation" && (
                                <IconBtn
                                  onClick={() =>
                                    setStatus.mutate({
                                      claimId: c.id,
                                      status: "awaiting_confirmation",
                                    })
                                  }
                                  icon={Clock}
                                >
                                  Reabrir
                                </IconBtn>
                              )}
                            </div>
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-foreground/70">
                    {unread} não lida{unread === 1 ? "" : "s"} de {notifications.length}
                  </p>
                  <button
                    onClick={() => markRead.mutate(undefined)}
                    className="border border-border px-4 py-2 text-[10px] uppercase tracking-[0.25em] hover:border-foreground/60"
                  >
                    Marcar todas como lidas
                  </button>
                </div>
                <ul className="mt-6 space-y-3">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`border p-4 ${
                        n.read_at ? "border-border bg-card" : "border-fuchsia/40 bg-blush/30"
                      }`}
                    >
                      <p className="font-serif-display text-lg">{n.title}</p>
                      <p className="mt-1 text-sm text-foreground/75">{n.body}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                          {fmt(n.created_at)}
                        </p>
                        {!n.read_at && (
                          <IconBtn onClick={() => markRead.mutate(n.id)} icon={Check}>
                            Marcar como lida
                          </IconBtn>
                        )}
                      </div>
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

function FamilyForm({
  value,
  onChange,
  onCancel,
  onSave,
  saving,
}: {
  value: { id?: string; name: string; surname: string; members: MemberDraft[] };
  onChange: (v: { id?: string; name: string; surname: string; members: MemberDraft[] }) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const valid =
    value.name.trim().length > 0 &&
    value.surname.trim().length > 0 &&
    value.members.some((m) => m.name.trim().length > 0);

  return (
    <div className="mt-6 border border-gold/50 bg-offwhite p-5 md:p-7">
      <h3 className="font-serif-display text-xl">
        {value.id ? "Editar família" : "Cadastrar família"}
      </h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field
          label="Nome da família"
          value={value.name}
          onChange={(v) => onChange({ ...value, name: v })}
          placeholder="Ex.: Família Silva"
        />
        <Field
          label="Sobrenome"
          value={value.surname}
          onChange={(v) => onChange({ ...value, surname: v })}
          placeholder="Ex.: Silva"
        />
      </div>

      <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-foreground/60">Integrantes</p>
      <div className="mt-3 space-y-3">
        {value.members.map((m, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3">
            <input
              value={m.name}
              onChange={(e) => {
                const members = [...value.members];
                members[i] = { ...m, name: e.target.value };
                onChange({ ...value, members });
              }}
              placeholder="Nome do integrante"
              className="min-w-[200px] flex-1 border border-border bg-background px-4 py-3 text-sm outline-none focus:border-fuchsia"
            />
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-foreground/65">
              <input
                type="checkbox"
                checked={m.isChild}
                onChange={(e) => {
                  const members = [...value.members];
                  members[i] = { ...m, isChild: e.target.checked };
                  onChange({ ...value, members });
                }}
              />
              Criança
            </label>
            <button
              onClick={() =>
                onChange({ ...value, members: value.members.filter((_, idx) => idx !== i) })
              }
              className="border border-border p-2.5 text-foreground/60 hover:border-foreground/60"
              aria-label="Remover integrante"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() =>
          onChange({ ...value, members: [...value.members, { name: "", isChild: false }] })
        }
        className="mt-4 inline-flex items-center gap-2 border border-border px-4 py-2 text-[10px] uppercase tracking-[0.25em] hover:border-foreground/60"
      >
        <Plus size={12} /> Adicionar integrante
      </button>

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          onClick={onSave}
          disabled={!valid || saving}
          className="inline-flex items-center gap-2 border border-ink px-6 py-3 text-[10px] uppercase tracking-[0.3em] hover:bg-ink hover:text-background disabled:opacity-40"
        >
          {saving && <Loader2 size={13} className="animate-spin" />} Salvar família
        </button>
        <button
          onClick={onCancel}
          className="border border-border px-6 py-3 text-[10px] uppercase tracking-[0.3em] hover:border-foreground/60"
        >
          Cancelar
        </button>
      </div>
      {!value.id && (
        <p className="mt-4 text-xs italic text-foreground/60">
          O código exclusivo e o link do convite são gerados automaticamente ao salvar. Todos os
          integrantes começam como “Ainda não respondeu”.
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-fuchsia"
      />
    </label>
  );
}

function StatusText({ status }: { status: string }) {
  return (
    <span
      className={
        status === "confirmed"
          ? "text-ink"
          : status === "declined"
            ? "text-foreground/50"
            : "text-gold"
      }
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function IconBtn({
  onClick,
  icon: Icon,
  children,
}: {
  onClick: () => void;
  icon: typeof Copy;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-foreground/75 transition-colors hover:border-foreground/60 hover:text-foreground"
    >
      <Icon size={11} /> {children}
    </button>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border p-5 ${highlight ? "border-fuchsia/50 bg-blush/30" : "border-border bg-card"}`}
    >
      <Icon size={16} className="text-fuchsia" />
      <p className="font-serif-display mt-3 text-3xl">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-foreground/55">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="font-serif-display text-2xl">{value}</p>
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
