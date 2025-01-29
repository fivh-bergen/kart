import { atom } from "nanostores";
import data from "../data/features.json";
import type { FeatureJSON } from "../data/types";

type Feature = {
  lat: number;
  long: number;
  id: number;
  name: string;
  opening_hours: string;
  description?: string;
  website?: string;
  facebook?: string;
  address: Address;
};

export interface Address {
  buildingNumber?: string;
  street?: string;
  postalCode?: string;
  city?: string;
}

export const $feature = atom<Feature | null>(null);

export function setFeature(feature: FeatureJSON) {
  $feature.set({
    name: feature.tags.name ?? "Navn mangler",
    description: feature.tags.description ?? "",
    opening_hours: feature.tags.opening_hours ?? "",
    lat: feature.lat,
    long: feature.lon,
    id: feature.id,
    website: feature.tags.website,
    facebook: feature.tags["contact:facebook"],
    address: {
      street: feature.tags["addr:street"],
      buildingNumber: feature.tags["addr:housenumber"],
      postalCode: feature.tags["addr:postcode"],
      city: feature.tags["addr:city"],
    },
  });
}

export const $showInfoPanel = atom(false);

export function showInfoPanel() {
  $showInfoPanel.set(true);
}

export function hideInfoPanel() {
  $showInfoPanel.set(false);
}
