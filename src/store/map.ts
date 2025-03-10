import { atom } from "nanostores";

export const $map = atom<maplibregl.Map | null>(null);

export function setMap(map: maplibregl.Map) {
  $map.set(map);
}
