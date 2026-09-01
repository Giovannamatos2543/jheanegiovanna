import { createClient } from "@supabase/supabase-js";
import process from "node:process";

import type { Database } from "@/integrations/supabase/types";

/** Cliente público (chave publicável) para leituras abertas, como a lista de presentes. */
export function getPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input as string, { ...init, headers: h });
      },
    },
  });
}

type AdminContext = {
  supabase: {
    rpc: (
      fn: "has_role",
      args: { _user_id: string; _role: "admin" | "user" },
    ) => Promise<{ data: boolean | null; error: { message: string } | null }>;
  };
  userId: string;
};

/** Garante que o usuário autenticado é administrador antes de qualquer leitura privilegiada. */
export async function assertAdmin(context: AdminContext) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso restrito ao administrador.");
}

/** Alfabeto sem caracteres ambíguos (0/O, 1/I) para códigos de convite. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode(length = 8) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return out;
}

/**
 * Notificação por e-mail para o administrador.
 * Só envia quando as duas configurações externas existirem:
 *  - RESEND_API_KEY (conector Resend / chave da conta)
 *  - ADMIN_NOTIFICATION_EMAIL (e-mail que recebe os avisos)
 *  - opcional: NOTIFICATION_FROM_EMAIL (remetente de um domínio verificado)
 * Sem elas, a função não falha e apenas registra que o envio foi ignorado —
 * as notificações internas do painel continuam funcionando.
 */
export async function sendAdminEmail(subject: string, lines: string[]) {
  const apiKey = process.env["RESEND_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const to = process.env["ADMIN_NOTIFICATION_EMAIL"];
  const from = process.env["NOTIFICATION_FROM_EMAIL"] ?? "Casamento <onboarding@resend.dev>";

  if (!apiKey || !to || !lovableKey) {
    console.info(
      "[email] Envio ignorado: configure RESEND_API_KEY (conector Resend) e ADMIN_NOTIFICATION_EMAIL.",
    );
    return { sent: false as const, reason: "missing_configuration" };
  }

  const html = `<div style="font-family:Georgia,serif;color:#2b1b22">
    <h2 style="font-weight:400">${subject}</h2>
    <ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul>
    <p style="font-size:12px;color:#8a7680">Jhean &amp; Giovanna · 06.03.2027</p>
  </div>`;

  try {
    const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": apiKey,
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Falha no envio [${res.status}]: ${body}`);
      return { sent: false as const, reason: `provider_error_${res.status}` };
    }
    return { sent: true as const };
  } catch (err) {
    console.error("[email] Erro inesperado no envio", err);
    return { sent: false as const, reason: "unexpected_error" };
  }
}

/**
 * Gancho preparado para WhatsApp. Ainda não há provedor configurado —
 * quando houver (ex.: WhatsApp Cloud API), basta implementar o envio aqui.
 * Nenhum dado de convidado é enviado a serviços de terceiros hoje.
 */
export async function sendAdminWhatsApp(_message: string) {
  const token = process.env["WHATSAPP_API_TOKEN"];
  if (!token) return { sent: false as const, reason: "not_configured" };
  return { sent: false as const, reason: "provider_not_implemented" };
}
