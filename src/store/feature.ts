import { atom } from "nanostores";
import { features } from "../overpass/features.json";
import { splitTagValues } from "../utils/tags";
import { reverseGeocode } from "../utils/reverseGeocode";

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
  instagram?: string;
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
      website:
        feature.properties.website || feature.properties["contact:website"],
      facebook: feature.properties["contact:facebook"],
      instagram: feature.properties["contact:instagram"],
      address: {
        street: feature.properties["addr:street"] ?? (feature.properties["prefetched_address"] ? JSON.parse(feature.properties["prefetched_address"])?.street : undefined),
        buildingNumber: feature.properties["addr:housenumber"] ?? (feature.properties["prefetched_address"] ? JSON.parse(feature.properties["prefetched_address"])?.housenumber : undefined),
        postalCode: feature.properties["addr:postcode"] ?? (feature.properties["prefetched_address"] ? JSON.parse(feature.properties["prefetched_address"])?.postcode : undefined),
        city: feature.properties["addr:city"] ?? (feature.properties["prefetched_address"] ? JSON.parse(feature.properties["prefetched_address"])?.city : undefined),
      },
      phone: feature.properties["phone"],
      openingHoursChecked: feature.properties["check_date:opening_hours"]
        ? new Date(feature.properties["check_date:opening_hours"])
        : undefined,
      tags: splitTagValues(feature.properties["fivh:tags"]),
    };
  }
}

// Try to enrich a Feature with address data if addr:* is missing.
// This function can be called when opening the info panel.
export async function enrichAddressIfMissing(f: Feature): Promise<Feature> {
  if (f.address && (f.address.street || f.address.buildingNumber)) return f;
  try {
    const addr = await reverseGeocode(f.lat, f.long);
    if (addr) {
      f.address = {
        street: addr.street ?? f.address.street,
        buildingNumber: addr.housenumber ?? f.address.buildingNumber,
        postalCode: addr.postcode ?? f.address.postalCode,
        city: addr.city ?? f.address.city,
      };
    }
  } catch (e) {
    console.warn("enrichAddressIfMissing", e);
  }
  return f;
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
