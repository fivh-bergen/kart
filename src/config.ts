import type { LngLatBoundsLike } from "maplibre-gl";
import { configure } from "osm-api";
import type { OsmOAuth2Scopes } from "osm-api/dist/src/auth/types";

interface OsmConfig {
  apiUrl: string;
  clientId: string;
  redirectUrl: string;
  scopes: OsmOAuth2Scopes[];
}

interface Config {
  startingPosition: {
    lat: number;
    lng: number;
    zoom: number;
  };
  maxBounds: LngLatBoundsLike;
  style: string;
  goatCounterUrl?: string;
  osm: OsmConfig;
}

export const config: Config = {
  style:
    "https://api.maptiler.com/maps/8d052b8a-bcfc-4d5f-8d90-f3af6edc8e13/style.json?key=JzEcmTM9DI9IYqHFODOt",
  maxBounds: [
    [4.44, 60.1094],
    [6.3148, 60.5347],
  ],
  startingPosition: {
    lng: 5.32867,
    lat: 60.39083, // starting position [lng, lat]
    zoom: 14.5, // starting zoom
  },
  goatCounterUrl: "https://fivh-bergen.goatcounter.com/count",
  osm: import.meta.env.DEV
    ? {
        apiUrl: "https://master.apis.dev.openstreetmap.org",
        clientId: "bYTbKd_JTmh--DeetcXg2YLoGA0rJ1kHRjPEqFTrSuE",
        redirectUrl: "https://localhost:4321/kart/auth",
        scopes: ["write_api"] as OsmOAuth2Scopes[],
      }
    : {
        apiUrl: "https://api.openstreetmap.org",
        clientId: "pBBGOP32kezRjUp5LssmwRQTwMjrqWz5-vSP0uUOs9s",
        redirectUrl: "https://fivh-bergen.github.io/kart//kart/auth",
        scopes: ["write_api"] as OsmOAuth2Scopes[],
      },
};

export function configureOsmApi() {
  configure({ apiUrl: config.osm.apiUrl });
}
