import { writable } from "svelte/store";
import type maplibregl from "maplibre-gl";

export const map = writable<maplibregl.Map | null>(null);

export function setMap(nextMap: maplibregl.Map | null) {
  map.set(nextMap);
}
