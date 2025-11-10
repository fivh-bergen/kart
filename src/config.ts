import type { LngLatBoundsLike } from "maplibre-gl";

interface Config {
  startingPosition: {
    lat: number;
    lng: number;
    zoom: number;
  };
  maxBounds: LngLatBoundsLike;
  style: string;
  goatCounterUrl?: string;
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
};
