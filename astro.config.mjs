// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
const hasLocalhostCerts =
	fs.existsSync("./localhost-key.pem") && fs.existsSync("./localhost.pem");

export default defineConfig({
	site: "https://fivh-bergen.github.io",
	base: "/kart",
	integrations: [react()],
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
