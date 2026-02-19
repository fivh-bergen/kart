import { getDesignationsFromTags, type Designation } from "./designation";

export function getFivhDesignations(feature: GeoJSON.Feature): Designation[] {
  const properties = feature.properties;

  if (!properties) {
    return [];
  }

  return getDesignationsFromTags(properties);
}
