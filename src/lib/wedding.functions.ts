import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Todas as leituras de dados de famílias/convidados acontecem APENAS aqui, no
// servidor, depois de validar o código privado do convite. Nenhuma família tem
// acesso ao banco diretamente (RLS bloqueia anon e authenticated sem admin).

// Código do convite: exatamente 4 dígitos numéricos.
const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{4}$/, "O código do convite deve ter 4 números.");


export const getGifts = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./wedding.server");
  const { data, error } = await getPublicClient()
    .from("gifts")
    .select("id, name, description, value_label, value_cents, category, image_url, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getFamilyByCode = createServerFn({ method: "POST" })
  .inputValidator(z.object({ code: codeSchema }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: family, error } = await supabaseAdmin
      .from("families")
      .select("id, name, surname")
      .ilike("access_code", data.code)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!family) return { found: false as const };

    const { data: guests, error: gErr } = await supabaseAdmin
      .from("guests")
      .select("id, name, is_child, rsvp_status, responded_at")
      .eq("family_id", family.id)
      .order("sort_order", { ascending: true });
    if (gErr) throw new Error(gErr.message);

    return {
      found: true as const,
      family: { name: family.name, surname: family.surname },
      guests: guests ?? [],
    };
  });

export const setGuestRsvp = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      code: codeSchema,
      guestId: z.string().uuid(),
      status: z.enum(["confirmed", "declined"]),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendAdminEmail } = await import("./wedding.server");
    const { data: family } = await supabaseAdmin
      .from("families")
      .select("id, name, surname")
      .ilike("access_code", data.code)
      .maybeSingle();
    if (!family) throw new Error("Código de convite inválido.");

    // O convidado só pode ser atualizado se pertencer à família do código.
    const { data: guest, error } = await supabaseAdmin
      .from("guests")
      .update({ rsvp_status: data.status, responded_at: new Date().toISOString() })
      .eq("id", data.guestId)
      .eq("family_id", family.id)
      .select("id, name, rsvp_status, responded_at")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!guest) throw new Error("Convidado não encontrado nesta família.");

    const answer =
      guest.rsvp_status === "confirmed" ? "Confirmou presença" : "Não poderá comparecer";

    await supabaseAdmin.from("notifications").insert({
      kind: "rsvp",
      title: "Nova confirmação de presença 💍",
      body: `${family.name} — ${guest.name}: ${answer}`,
      payload: {
        family: family.name,
        surname: family.surname,
        guest: guest.name,
        status: guest.rsvp_status,
        responded_at: guest.responded_at,
      },
    });

    await sendAdminEmail("Nova confirmação de presença 💍", [
      `Família: ${family.name}`,
      `Convidado: ${guest.name}`,
      `Resposta: ${answer}`,
      `Data e horário: ${new Date(guest.responded_at ?? Date.now()).toLocaleString("pt-BR")}`,
    ]);

    return { guest };
  });

export const registerGiftChoice = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      giftId: z.string().uuid(),
      code: codeSchema.optional(),
      guestLabel: z.string().trim().max(120).optional(),
      method: z.enum(["pix", "loja"]).default("pix"),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendAdminEmail } = await import("./wedding.server");

    const { data: gift } = await supabaseAdmin
      .from("gifts")
      .select("id, name, value_label, value_cents")
      .eq("id", data.giftId)
      .eq("active", true)
      .maybeSingle();
    if (!gift) throw new Error("Presente não encontrado.");

    let familyId: string | null = null;
    let familyName: string | null = null;
    if (data.code) {
      const { data: family } = await supabaseAdmin
        .from("families")
        .select("id, name")
        .ilike("access_code", data.code)
        .maybeSingle();
      if (family) {
        familyId = family.id;
        familyName = family.name;
      }
    }

    const { data: claim, error } = await supabaseAdmin
      .from("gift_claims")
      .insert({
        gift_id: gift.id,
        family_id: familyId,
        guest_label: data.guestLabel || familyName,
        method: data.method,
        amount_cents: gift.value_cents,
        status: "awaiting_confirmation",
      })
      .select("id, created_at, status")
      .single();
    if (error) throw new Error(error.message);

    const who = familyName ?? data.guestLabel ?? "Convidado não identificado";

    await supabaseAdmin.from("notifications").insert({
      kind: "gift",
      title: "Novo presente! 🎁",
      body: `${who} escolheu "${gift.name}" (${
        gift.value_label ?? "valor livre"
      }) — Pagamento aguardando confirmação`,
      payload: {
        family: familyName,
        guest_label: data.guestLabel,
        gift: gift.name,
        value: gift.value_label,
        method: data.method,
        status: "awaiting_confirmation",
        created_at: claim.created_at,
      },
    });

    await sendAdminEmail("Novo presente! 🎁", [
      `Família / convidado: ${who}`,
      `Presente: ${gift.name}`,
      `Valor: ${gift.value_label ?? "valor livre"}`,
      `Forma: ${data.method === "pix" ? "Pix" : "Loja"}`,
      `Status do pagamento: Aguardando confirmação`,
      `Data e horário: ${new Date(claim.created_at).toLocaleString("pt-BR")}`,
    ]);

    return { claimId: claim.id, status: claim.status };
  });

// ---------- Administração ----------

/**
 * Bootstrap seguro: a PRIMEIRA conta autenticada pode se tornar administradora.
 * Depois que existir um admin, esta função sempre recusa novos pedidos.
 */
export const claimAdminAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: exists, error } = await supabaseAdmin.rpc("admin_exists");
    if (error) throw new Error(error.message);
    if (exists) {
      const { data: mine } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", context.userId)
        .eq("role", "admin")
        .maybeSingle();
      if (mine) return { granted: true as const, alreadyAdmin: true as const };
      throw new Error("Já existe um administrador. Peça acesso ao administrador atual.");
    }
    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (insErr) throw new Error(insErr.message);
    return { granted: true as const, alreadyAdmin: false as const };
  });

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./wedding.server");
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [families, guests, claims, notifications] = await Promise.all([
      supabaseAdmin.from("families").select("id, name, surname, access_code, created_at").order("name"),
      supabaseAdmin
        .from("guests")
        .select("id, family_id, name, is_child, rsvp_status, responded_at, sort_order")
        .order("sort_order"),
      supabaseAdmin
        .from("gift_claims")
        .select(
          "id, gift_id, family_id, guest_label, method, amount_cents, status, created_at, confirmed_at, gifts(name, value_label), families(name)",
        )
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("notifications")
        .select("id, kind, title, body, created_at, read_at")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    return {
      families: families.data ?? [],
      guests: guests.data ?? [],
      claims: claims.data ?? [],
      notifications: notifications.data ?? [],
    };
  });

const memberSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  isChild: z.boolean().default(false),
});

export const adminCreateFamily = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      name: z.string().trim().min(1).max(120),
      surname: z.string().trim().min(1).max(120),
      members: z.array(memberSchema).min(1).max(30),
    }),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, generateInviteCode } = await import("./wedding.server");
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let created: { id: string; access_code: string } | null = null;
    for (let attempt = 0; attempt < 6 && !created; attempt++) {
      const code = generateInviteCode();
      const { data: fam, error } = await supabaseAdmin
        .from("families")
        .insert({ name: data.name, surname: data.surname, access_code: code })
        .select("id, access_code")
        .maybeSingle();
      if (error) {
        if (error.code === "23505") continue; // código repetido: tenta outro
        throw new Error(error.message);
      }
      created = fam;
    }
    if (!created) throw new Error("Não foi possível gerar um código único. Tente novamente.");

    const { error: gErr } = await supabaseAdmin.from("guests").insert(
      data.members.map((m, i) => ({
        family_id: created!.id,
        name: m.name,
        is_child: m.isChild,
        sort_order: i,
        rsvp_status: "pending",
      })),
    );
    if (gErr) throw new Error(gErr.message);

    return { id: created.id, accessCode: created.access_code };
  });

export const adminUpdateFamily = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      name: z.string().trim().min(1).max(120),
      surname: z.string().trim().min(1).max(120),
      members: z.array(memberSchema).min(1).max(30),
    }),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./wedding.server");
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: fErr } = await supabaseAdmin
      .from("families")
      .update({ name: data.name, surname: data.surname })
      .eq("id", data.id);
    if (fErr) throw new Error(fErr.message);

    const { data: existing } = await supabaseAdmin
      .from("guests")
      .select("id")
      .eq("family_id", data.id);
    const keep = new Set(data.members.map((m) => m.id).filter(Boolean) as string[]);
    const remove = (existing ?? []).map((g) => g.id).filter((id) => !keep.has(id));
    if (remove.length) {
      await supabaseAdmin.from("gift_claims").update({ guest_id: null }).in("guest_id", remove);
      const { error } = await supabaseAdmin.from("guests").delete().in("id", remove);
      if (error) throw new Error(error.message);
    }

    for (const [i, m] of data.members.entries()) {
      if (m.id) {
        const { error } = await supabaseAdmin
          .from("guests")
          .update({ name: m.name, is_child: m.isChild, sort_order: i })
          .eq("id", m.id)
          .eq("family_id", data.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabaseAdmin.from("guests").insert({
          family_id: data.id,
          name: m.name,
          is_child: m.isChild,
          sort_order: i,
          rsvp_status: "pending",
        });
        if (error) throw new Error(error.message);
      }
    }

    return { ok: true };
  });

export const adminDeleteFamily = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./wedding.server");
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await supabaseAdmin.from("gift_claims").update({ family_id: null }).eq("family_id", data.id);
    await supabaseAdmin.from("guests").delete().eq("family_id", data.id);
    const { error } = await supabaseAdmin.from("families").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRegenerateCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { assertAdmin, generateInviteCode } = await import("./wedding.server");
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    for (let attempt = 0; attempt < 6; attempt++) {
      const code = generateInviteCode();
      const { data: fam, error } = await supabaseAdmin
        .from("families")
        .update({ access_code: code })
        .eq("id", data.id)
        .select("access_code")
        .maybeSingle();
      if (error) {
        if (error.code === "23505") continue;
        throw new Error(error.message);
      }
      if (fam) return { accessCode: fam.access_code };
    }
    throw new Error("Não foi possível gerar um novo código.");
  });

export const adminSetClaimStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      claimId: z.string().uuid(),
      status: z.enum(["awaiting_confirmation", "received", "cancelled"]),
    }),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./wedding.server");
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("gift_claims")
      .update({
        status: data.status,
        confirmed_at: data.status === "received" ? new Date().toISOString() : null,
      })
      .eq("id", data.claimId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminMarkNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid().optional() }).optional())
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./wedding.server");
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const query = supabaseAdmin.from("notifications").update({ read_at: now });
    const { error } = data?.id
      ? await query.eq("id", data.id)
      : await query.is("read_at", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
