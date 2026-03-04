import { inferCategoryFromOsmTags } from "./category.ts";
import { getDesignationsFromTags } from "./designation.ts";

export function getDesignations(feature: GeoJSON.Feature): string[] {
  const properties = feature.properties;

  if (!properties) {
    return [];
  }

  return getDesignationsFromTags(properties);
}

export function inferCategory(feature: GeoJSON.Feature): string {
  return inferCategoryFromOsmTags(feature.properties ?? {});
}
