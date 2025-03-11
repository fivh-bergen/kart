import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  return new Response(
    JSON.stringify(
      {
        name: "Gjenbruksportalen",
        start_url: "/kart",
        display: "standalone",
        background_color: "#FF7A00",
        theme_color: "#ffffff",
        description:
          "Gjenbruksportalen er til for å gjøre det enklere for deg å finne bruktbutikker, reparasjonssteder og utleiesteder i Bergen.",
        icons: [
          {
            src: "/kart/favicon.ico",
            sizes: "32x32",
            type: "image/x-icon",
          },
        ],
      },
      null,
      2
    ),
    {
      headers: {
        "Content-Type": "application/manifest+json",
      },
    }
  );
};
