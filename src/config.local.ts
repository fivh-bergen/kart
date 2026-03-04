// Replace this file to configure the app for a different locale
import type { Config } from "./config";

export const config: Config = {
  appName: "Gjenbruksportalen Bergen",
  appAreaName: "Bergen",
  appAreaId: 3600404159,
  appUrl: "https://fivh-bergen.github.io/kart",
  style:
    "https://api.maptiler.com/maps/8d052b8a-bcfc-4d5f-8d90-f3af6edc8e13/style.json?key=JzEcmTM9DI9IYqHFODOt",
  startingPosition: {
    lng: 5.32867,
    lat: 60.39083, // starting position [lng, lat]
    zoom: 14.5, // starting zoom
  },
  minZoom: 10,
  maxZoom: 20,
  goatCounterUrl: "https://fivh-bergen.goatcounter.com/count",
  osmApiConfig: {
    clientId: "pBBGOP32kezRjUp5LssmwRQTwMjrqWz5-vSP0uUOs9s",
  },
};
