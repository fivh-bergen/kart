import { designations } from "./designation.ts";
import {
  categories as categoryDefs,
  type Category as CategoryDef,
} from "./designation/category-def.ts";

/**
 * Public categories list (objects with { name, label })
 * - name: internal identifier used in code / feature properties
 * - label: human-readable, shown in the UI
 */
export const categories = categoryDefs;

export type Category = CategoryDef;
export type CategoryName = Category["name"];

/** Returns the designations that belong to a given category name */
export function getDesignationsForCategory(
  categoryName: CategoryName,
): string[] {
  return designations
    .filter((d) => d.category === categoryName)
    .map((d) => d.name);
}

/**
 * Infers the internal category name from OSM tags.
 * Returns one of the CategoryName values ('reuse' | 'rental' | 'repair').
 * Defaults to 'reuse' when nothing matches.
 */
export function inferCategoryFromOsmTags(
  osmTags: Record<string, unknown>,
): CategoryName {
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
    return "rental";
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
    return "repair";
  }

  return "reuse";
}
