import { createFileRoute } from "@tanstack/react-router";

import { InviteRsvp } from "@/components/InviteRsvp";

export const Route = createFileRoute("/convite/$codigo")({
  head: () => ({
    meta: [
      { title: "Seu convite · Jhean & Giovanna" },
      {
        name: "description",
        content:
          "Convite privado de confirmação de presença do casamento de Jhean e Giovanna, exclusivo para a sua família.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Seu convite · Jhean & Giovanna" },
      {
        property: "og:description",
        content: "Confirme a presença de cada integrante da sua família.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConviteCodigoPage,
});

function ConviteCodigoPage() {
  const { codigo } = Route.useParams();
  return <InviteRsvp initialCode={codigo} />;
}
