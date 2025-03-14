import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  return new Response(
    JSON.stringify(
      {
        name: "Gjenbruksportalen",
        start_url: "https://fivh-bergen.github.io/kart",
        description:
          "Gjenbruksportalen er til for å gjøre det enklere for deg å finne bruktbutikker, reparasjonssteder og utleiesteder i Bergen.",
        theme_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/kart/192.png",
            type: "image/png",
            sizes: "192x192",
            purpose: "any maskable",
          },
          {
            src: "/kart/512.png",
            type: "image/png",
            sizes: "512x512",
            purpose: "any maskable",
          },
        ],
        background_color: "#FF7A00",
      },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/manifest+json",
      },
    },
  );
};
