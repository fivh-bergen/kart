import { designations, getDesignationsFromTags } from "./designation.ts";
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
  const matchedDesignationNames = getDesignationsFromTags(osmTags);
  const matchedCategories = new Set(
    matchedDesignationNames
      .map((designationName) =>
        designations.find(
          (designation) => designation.name === designationName,
        ),
      )
      .filter((designation): designation is (typeof designations)[number] =>
        Boolean(designation),
      )
      .map((designation) => designation.category),
  );

  if (matchedCategories.has("rental")) {
    return "rental";
  }

  if (matchedCategories.has("repair")) {
    return "repair";
  }

  return "reuse";
}
