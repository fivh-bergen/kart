// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import fs from "fs";

// https://astro.build/config
const hasLocalhostCerts =
  fs.existsSync("./localhost-key.pem") && fs.existsSync("./localhost.pem");

export default defineConfig({
  site: "https://fivh-bergen.github.io",
  base: "/kart",
  integrations: [svelte()],
  redirects: {
    "/react": "/kart",
  },
  vite: hasLocalhostCerts
    ? {
        server: {
          https: {
            key: "./localhost-key.pem",
            cert: "./localhost.pem",
          },
        },
      }
    : {},
});
