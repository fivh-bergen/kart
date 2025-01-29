import { atom } from "nanostores";

type Feature = {
  lat: number;
  long: number;
  id: number;
  name: string;
  opening_hours: string;
  description?: string;
  website?: string;
  facebook?: string;
};

export const $feature = atom<Feature | null>(null);

export function setFeature(feature: Feature) {
  $feature.set(feature);
}

export const $showInfoPanel = atom(false);

export function showInfoPanel() {
  $showInfoPanel.set(true);
}

export function hideInfoPanel() {
  $showInfoPanel.set(false);
}
