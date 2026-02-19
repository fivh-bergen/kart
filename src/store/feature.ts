import { atom } from "nanostores";
import { features } from "../overpass/features.json";
import {
  splitTagValues,
  type Category,
  type Designation,
  getFivhDesignations,
} from "../utils/osm-tag-helpers";
import type { OsmNode } from "osm-api";

export type Feature = {
  category: Category;
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
  tags: Designation[];
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
      openingHoursChecked: feature.properties["check_date:opening_hours"]
        ? new Date(feature.properties["check_date:opening_hours"])
        : undefined,
      tags: getFivhDesignations(feature as GeoJSON.Feature),
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

export function convertToOsmNode(feature: Feature): OsmNode {
  return {
    type: "node",
    lat: feature.lat,
    lon: feature.long,
    id: Number(feature.id) || -1,
    tags: {
      name: feature.name,
      ...(feature.description && { description: feature.description }),
      ...(feature.opening_hours && { opening_hours: feature.opening_hours }),
      ...(feature.website && { website: feature.website }),
      ...(feature.facebook && { "contact:facebook": feature.facebook }),
      ...(feature.instagram && { "contact:instagram": feature.instagram }),
      ...(feature.phone && { phone: feature.phone }),
      ...(feature.address.street && { "addr:street": feature.address.street }),
      ...(feature.address.buildingNumber && {
        "addr:housenumber": feature.address.buildingNumber,
      }),
      ...(feature.address.postalCode && {
        "addr:postcode": feature.address.postalCode,
      }),
      ...(feature.address.city && { "addr:city": feature.address.city }),
      ...(feature.openingHoursChecked && {
        "check_date:opening_hours": feature.openingHoursChecked
          .toISOString()
          .split("T")[0],
      }),
    },
    changeset: -1,
    timestamp: "",
    uid: -1,
    user: "",
    version: 0,
  };
}
