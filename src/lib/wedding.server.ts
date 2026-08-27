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
