import type { Config } from "./config";

export const config: Config = {
  appName: "Gjenbruksportalen",
  appAreaName: "Norge",
  appAreaId: 3601059668,
  appUrl: "https://fivh-bergen.github.io/kart",
  style:
    "https://api.maptiler.com/maps/8d052b8a-bcfc-4d5f-8d90-f3af6edc8e13/style.json?key=JzEcmTM9DI9IYqHFODOt",
  startingPosition: {
    lng: 5.32867,
    lat: 60.39083, // starting position [lng, lat]
    zoom: 3, // starting zoom
  },
  minZoom: 3,
  maxZoom: 20,
  goatCounterUrl: "https://fivh-bergen.goatcounter.com/count",
  osmApiConfig: {
    clientId: "pBBGOP32kezRjUp5LssmwRQTwMjrqWz5-vSP0uUOs9s",
  },
};
