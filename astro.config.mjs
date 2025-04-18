// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://fivh-bergen.github.io",
  base: "/kart",
  integrations: [react()],
  redirects: {
    "/react": "/kart",
  },
});
