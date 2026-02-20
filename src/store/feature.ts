import { atom } from "nanostores";
import { features } from "../overpass/features.json";
import type { CategoryName } from "../utils/category";
import { splitTagValues, type Designation } from "../utils/designation";

export type Feature = {
  category: CategoryName;
  lat: number;
  long: number;
  id: string;
  name: string;
  opening_hours: string;
  description?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  address: Address;
  openingHoursChecked?: Date;
  phone?: string;
  email?: string;
  designations: Designation[];
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
      category: feature.properties["fivh:category"] as Category,
      name: feature.properties.name ?? "Navn mangler",
      description: feature.properties?.description ?? "",
      opening_hours: feature.properties.opening_hours ?? "",
      lat: feature.geometry.coordinates[1],
      long: feature.geometry.coordinates[0],
      id: feature.id,
      website:
        feature.properties.website || feature.properties["contact:website"],
      facebook: feature.properties["contact:facebook"],
      instagram: feature.properties["contact:instagram"],
      address: {
        street: feature.properties["addr:street"],
        buildingNumber: feature.properties["addr:housenumber"],
        postalCode: feature.properties["addr:postcode"],
        city: feature.properties["addr:city"],
      },
      phone: feature.properties["phone"],
      email: feature.properties.email || feature.properties["contact:email"],
      openingHoursChecked: feature.properties["check_date:opening_hours"]
        ? new Date(feature.properties["check_date:opening_hours"])
        : undefined,
      designations: splitTagValues(
        feature.properties["fivh:designations"],
      ) as Designation[],
    };
  }
}

export const $showInfoPanel = atom(false);

export function showInfoPanel() {
  $showInfoPanel.set(true);
}

export function hideInfoPanel() {
  $feature.set(null);
  $showInfoPanel.set(false);
}

export function toggleAboutPanel() {
  if ($showInfoPanel.get() && Boolean($feature.get())) {
    $feature.set(null);
  } else {
    $showInfoPanel.set(!$showInfoPanel.get());
  }
}
