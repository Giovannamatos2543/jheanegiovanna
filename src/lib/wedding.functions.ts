import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Todas as leituras de dados de famílias/convidados acontecem APENAS aqui, no
// servidor, depois de validar o código privado do convite. Nenhuma família tem
// acesso ao banco diretamente (RLS bloqueia anon e authenticated sem admin).

const codeSchema = z
  .string()
  .trim()
  .min(4)
  .max(40)
  .transform((v) => v.toUpperCase());

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
      .eq("access_code", data.code)
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
    const { data: family } = await supabaseAdmin
      .from("families")
      .select("id, name")
      .eq("access_code", data.code)
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

    await supabaseAdmin.from("notifications").insert({
      kind: "rsvp",
      title: "Nova confirmação de presença! 💍",
      body: `${family.name} — ${guest.name}: ${
        guest.rsvp_status === "confirmed" ? "Confirmou presença" : "Não poderá comparecer"
      }`,
      payload: {
        family: family.name,
        guest: guest.name,
        status: guest.rsvp_status,
        responded_at: guest.responded_at,
      },
    });

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
        .eq("access_code", data.code)
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

    await supabaseAdmin.from("notifications").insert({
      kind: "gift",
      title: "Novo presente recebido! 🎁",
      body: `${familyName ?? data.guestLabel ?? "Convidado não identificado"} escolheu "${gift.name}" (${
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

    return { claimId: claim.id, status: claim.status };
  });

// ---------- Administração ----------

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./wedding.server");
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [families, guests, claims, notifications] = await Promise.all([
      supabaseAdmin.from("families").select("id, name, surname, access_code").order("name"),
      supabaseAdmin
        .from("guests")
        .select("id, family_id, name, rsvp_status, responded_at, sort_order")
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
        .limit(100),
    ]);

    return {
      families: families.data ?? [],
      guests: guests.data ?? [],
      claims: claims.data ?? [],
      notifications: notifications.data ?? [],
    };
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
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./wedding.server");
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
