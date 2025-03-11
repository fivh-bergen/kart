import { atom } from "nanostores";
import { features } from "../overpass/features.json";
import { splitTagValues } from "../utils/tags";

export type Feature = {
  kind: string;
  lat: number;
  long: number;
  id: string;
  name: string;
  opening_hours: string;
  description?: string;
  website?: string;
  facebook?: string;
  address: Address;
  openingHoursChecked?: Date;
  phone?: string;
  tags: string[];
};

export interface Address {
  buildingNumber?: string;
  street?: string;
  postalCode?: string;
  city?: string;
}

export const $feature = atom<string | null>(null);

export function setSelectedFeatureId(id: string) {
  $feature.set(id);
}

export function getSelectedFeature(id: string): Feature | undefined {
  const feature = features.find((feature) => feature.id === id);
  if (feature) {
    return {
      kind: feature.properties["fivh:kind"],
      name: feature.properties.name ?? "Navn mangler",
      description: feature.properties?.description ?? "",
      opening_hours: feature.properties.opening_hours ?? "",
      lat: feature.geometry.coordinates[1],
      long: feature.geometry.coordinates[0],
      id: feature.id,
      website: feature.properties.website,
      facebook: feature.properties["contact:facebook"],
      address: {
        street: feature.properties["addr:street"],
        buildingNumber: feature.properties["addr:housenumber"],
        postalCode: feature.properties["addr:postcode"],
        city: feature.properties["addr:city"],
      },
      phone: feature.properties["phone"],
      openingHoursChecked: feature.properties["check_date:opening_hours"]
        ? new Date(feature.properties["check_date:opening_hours"])
        : undefined,
      tags: splitTagValues(feature.properties["fivh:tags"]),
    };
  }
}

export const $showInfoPanel = atom(false);

export function showInfoPanel() {
  $showInfoPanel.set(true);
}

export function hideInfoPanel() {
  $showInfoPanel.set(false);
}

export function toggleAboutPanel() {
  if ($showInfoPanel.get() && Boolean($feature.get())) {
    $feature.set(null);
  } else {
    $showInfoPanel.set(!$showInfoPanel.get());
  }
}
