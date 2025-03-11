// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://fivh-bergen.github.io",
  base: "/kart",
  integrations: [
    react(),
    AstroPWA({
      devOptions: {
        enabled: true,
        /* other options */
      },
      manifest: {
        name: "Gjenbruksportalen",
        start_url: "/kart",
        description:
          "Gjenbruksportalen er til for å gjøre det enklere for deg å finne bruktbutikker, reparasjonssteder og utleiesteder i Bergen.",
        theme_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/kart/android-chrome-192x192.png",
            type: "image/png",
            sizes: "192x192",
            purpose: "any maskable",
          },
          {
            src: "/kart/android-chrome-512x512.png",
            type: "image/png",
            sizes: "512x512",
            purpose: "any maskable",
          },
        ],
        background_color: "#FF7A00",
      },
    }),
  ],
  redirects: {
    "/react": "/kart",
  },
});
