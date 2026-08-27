import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso dos noivos · Jhean & Giovanna" },
      {
        name: "description",
        content: "Área restrita de administração do casamento de Jhean e Giovanna.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Acesso dos noivos · Jhean & Giovanna" },
      { property: "og:description", content: "Área restrita de administração do casamento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Conta criada! Faça login para continuar.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="surface-romantic flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-foreground/60 hover:text-foreground"
        >
          <ArrowLeft size={12} /> Voltar ao site
        </Link>
        <form onSubmit={submit} className="card-elegant mt-8 p-8 md:p-12">
          <div className="flex items-center justify-center gap-2 text-foreground/70">
            <Lock size={14} className="text-gold" />
            <span className="text-[10px] uppercase tracking-[0.3em]">Área dos noivos</span>
          </div>
          <h1 className="font-serif-display mt-5 text-center text-3xl">
            {mode === "signin" ? "Entrar" : "Criar acesso"}
          </h1>
          <div className="mx-auto my-6 h-px w-16 bg-gold/60" />
          <label className="block text-[10px] uppercase tracking-[0.3em] text-foreground/60">
            E-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-fuchsia"
          />
          <label className="mt-6 block text-[10px] uppercase tracking-[0.3em] text-foreground/60">
            Senha
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-fuchsia"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-2 border border-ink py-4 text-[11px] uppercase tracking-[0.4em] transition-colors hover:bg-ink hover:text-background disabled:opacity-40"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-[10px] uppercase tracking-[0.25em] text-foreground/60 hover:text-foreground"
          >
            {mode === "signin" ? "Criar um acesso" : "Já tenho acesso"}
          </button>
        </form>
      </div>
    </div>
  );
}
