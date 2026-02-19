/**
 * We categorise features into three main categories;
 * Gjenbruk: second hand shops, give boxes, and similar
 * Reparasjon: repair shops, repair cafés, and similar
 * Utlån: rental services for bikes, sports gear and similar
 */

import { designations, type Designation } from "./designation";

export const categories = ["Gjenbruk", "Utlån", "Reparasjon"] as const;

export type Category = (typeof categories)[number];

/** Returns the designations that belong to a given category */
export function getDesignationsForCategory(
  category: Category,
): Designation[] {
  return designations
    .filter((d) => d.category === category)
    .map((d) => d.name);
}

/**
 * Infers the category (Gjenbruk, Reparasjon, or Utlån) from OSM tags.
 * Defaults to Gjenbruk if no match is found.
 */
export function inferCategoryFromOsmTags(
  osmTags: Record<string, unknown>,
): Category {
  if (
    osmTags["amenity"] === "bicycle_rental" ||
    osmTags["amenity"] === "boat_rental" ||
    osmTags["amenity"] === "boat_sharing" ||
    osmTags["amenity"] === "motorcycle_rental" ||
    osmTags["amenity"] === "scooter_rental" ||
    osmTags["amenity"] === "kick-scooter_rental" ||
    osmTags["service:bicycle:rental"] === "yes" ||
    osmTags["amenity"] === "ski_rental" ||
    osmTags["shop"] === "rental" ||
    osmTags["shop"] === "tool_hire" ||
    osmTags["amenity"] === "tool_library" ||
    osmTags["amenity"] === "toy_library"
  ) {
    return "Utlån";
  }

  if (
    osmTags["repair"] === "yes" ||
    osmTags["repair"] === "only" ||
    osmTags["service:bicycle:repair"] === "yes" ||
    osmTags["repair"] === "assisted_self_service" ||
    osmTags["computer:repair"] === "yes" ||
    osmTags["mobile_phone:repair"] === "yes" ||
    osmTags["camera:repair"] === "yes" ||
    osmTags["bicycle:repair"] === "yes" ||
    osmTags["brand"] === "Repair Café" ||
    osmTags["craft"] === "shoemaker" ||
    osmTags["craft"] === "goldsmith" ||
    osmTags["craft"] === "jeweller" ||
    osmTags["craft"] === "luthier"
  ) {
    return "Reparasjon";
  }

  return "Gjenbruk";
}
