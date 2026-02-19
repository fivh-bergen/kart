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

type PrefetchedAddress = {
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
};

function getPrefetchedAddress(
  properties: Record<string, unknown>,
): PrefetchedAddress | undefined {
  const raw = properties.prefetched_address;
  if (!raw) {
    return undefined;
  }

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as PrefetchedAddress;
    } catch {
      return undefined;
    }
  }

  if (typeof raw === "object") {
    return raw as PrefetchedAddress;
  }

  return undefined;
}

export const $feature = atom<string | null>(null);

export function setSelectedFeatureId(id: string) {
  $feature.set(id);
}

export function getSelectedFeature(id: string): Feature | undefined {
  const feature = features.find((feature) => feature.id === id);
  if (feature) {
    const properties = feature.properties as Record<string, unknown>;
    const prefetchedAddress = getPrefetchedAddress(properties);

    return {
      kind: (properties["fivh:kind"] as string) ?? "",
      name: (properties.name as string) ?? "Navn mangler",
      description: (properties.description as string) ?? "",
      opening_hours: (properties.opening_hours as string) ?? "",
      lat: feature.geometry.coordinates[1],
      long: feature.geometry.coordinates[0],
      id: feature.id,
      website:
        (properties.website as string | undefined) ||
        (properties["contact:website"] as string | undefined),
      facebook: properties["contact:facebook"] as string | undefined,
      instagram: properties["contact:instagram"] as string | undefined,
      address: {
        street:
          (properties["addr:street"] as string | undefined) ??
          prefetchedAddress?.street,
        buildingNumber:
          (properties["addr:housenumber"] as string | undefined) ??
          prefetchedAddress?.housenumber,
        postalCode:
          (properties["addr:postcode"] as string | undefined) ??
          prefetchedAddress?.postcode,
        city:
          (properties["addr:city"] as string | undefined) ??
          prefetchedAddress?.city,
      },
      phone: properties["phone"] as string | undefined,
      openingHoursChecked: properties["check_date:opening_hours"]
        ? new Date(properties["check_date:opening_hours"] as string)
        : undefined,
      tags: splitTagValues((properties["fivh:tags"] as string) ?? ""),
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
