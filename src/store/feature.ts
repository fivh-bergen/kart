import { writable, get } from "svelte/store";
import { features } from "../overpass/features.json";
import { splitTagValues } from "../utils/designation";
import type { Category } from "../utils/designation/category-def";
import type { CategoryName } from "../utils/category";

export type Feature = {
  category: Category["name"];
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
  designations: string[];
};

export interface Address {
  buildingNumber?: string;
  street?: string;
  postalCode?: string;
  city?: string;
}

export interface NewFeatureLocation {
  lat: number;
  long: number;
}

export const selectedFeatureId = writable<string | null>(null);
export const isCreatingFeature = writable(false);
export const newFeatureLocation = writable<NewFeatureLocation | null>(null);
export const showInfoPanel = writable(false);

export function setSelectedFeatureId(id: string) {
  selectedFeatureId.set(id);
  isCreatingFeature.set(false);
  newFeatureLocation.set(null);
}

export function startNewFeatureCreation(location: NewFeatureLocation) {
  selectedFeatureId.set(null);
  newFeatureLocation.set(location);
  isCreatingFeature.set(true);
  showInfoPanel.set(true);
}

export function stopNewFeatureCreation() {
  isCreatingFeature.set(false);
  newFeatureLocation.set(null);
}

export function getSelectedFeature(id: string): Feature | undefined {
  const feature = features.find((feature) => feature.id === id);
  if (feature) {
    return {
      category: feature.properties["fivh:category"] as CategoryName,
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
      designations: splitTagValues(feature.properties["fivh:designations"]),
    };
  }
}

export function openInfoPanel() {
  showInfoPanel.set(true);
}

export function hideInfoPanel() {
  selectedFeatureId.set(null);
  stopNewFeatureCreation();
  showInfoPanel.set(false);
}

export function toggleAboutPanel() {
  if (get(isCreatingFeature)) {
    stopNewFeatureCreation();
  }

  if (get(showInfoPanel) && Boolean(get(selectedFeatureId))) {
    selectedFeatureId.set(null);
  } else {
    showInfoPanel.update((v) => !v);
  }
}
