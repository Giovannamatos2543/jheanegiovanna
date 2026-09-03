import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { InviteRsvp } from "@/components/InviteRsvp";

export const Route = createFileRoute("/convite/")({
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
  return (
    <InviteRsvp
      initialCode={codigo}
      onCodeSubmit={(code) => navigate({ search: { codigo: code } })}
    />
  );
}
