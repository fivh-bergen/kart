// ============================================================================
// Designations Data
// ============================================================================

/** An object describing a set of human readable designations based on underlying OSM tags */
export const designations = [
  {
    name: "Kvinneklær",
    definitions: [[{ key: "clothes", value: "women" }]],
  },
  {
    name: "Herreklær",
    definitions: [[{ key: "clothes", value: "men" }]],
  },
  {
    name: "Barneklær",
    definitions: [[{ key: "clothes", value: "children" }]],
  },
  {
    name: "Sykkelreparasjon",
    definitions: [
      [
        { key: "shop", value: "bicycle" },
        { key: "repair", value: "yes" },
      ],
      [{ key: "service:bicycle:repair", value: "yes" }],
    ],
  },
  {
    name: "Skomaker",
    definitions: [[{ key: "craft", value: "shoemaker" }]],
  },
  {
    name: "Bøker",
    definitions: [[{ key: "shop", value: "books" }]],
  },
  {
    name: "Elektronikk",
    definitions: [
      [{ key: "shop", value: "electronics_repair" }],
      [{ key: "craft", value: "electronics_repair" }],
      [{ key: "computer:repair", value: "yes" }],
      [{ key: "mobile_phone:repair", value: "yes" }],
      [{ key: "camera:repair", value: "yes" }],
    ],
  },
  {
    name: "Gullsmed",
    definitions: [
      [{ key: "craft", value: "goldsmith" }],
      [{ key: "craft", value: "jeweller" }],
    ],
  },
  {
    name: "Gitarmaker",
    definitions: [[{ key: "craft", value: "luthier" }]],
  },
  {
    name: "Sykkelutleie",
    definitions: [[{ key: "amenity", value: "bicycle_rental" }]],
  },
] as const;

export type Designation = (typeof designations)[number]["name"];

export type ManagedOsmTag =
  (typeof designations)[number]["definitions"][number][number];

type ManagedOsmDefinition =
  (typeof designations)[number]["definitions"][number];
// ============================================================================
// Designation Functions
// ============================================================================
export function getDesignationFromOsmTag(tag: ManagedOsmTag): Designation {
  for (const designation of designations) {
    for (const definition of designation.definitions) {
      for (const item of definition) {
        if (tag.key === item.key && tag.value === item.value) {
          return designation.name;
        }
      }
    }
  }
  throw new Error(`No designation found for OSM tag ${tag.key}=${tag.value}`);
}

export function getOsmTagFromDesignation(
  designationName: Designation,
): ManagedOsmDefinition {
  const designation = designations.find((d) => d.name === designationName);
  if (!designation) {
    throw new Error(`No designation found with name ${designationName}`);
  }
  // Return the first definition
  return designation.definitions[0];
}
// ============================================================================
// Category Configuration
// ============================================================================

export const categories = ["Gjenbruk", "Utlån", "Reparasjon"] as const;

export type Category = (typeof categories)[number];

/** Describes which designations are available within each category */
export const DESIGNATION_OPTIONS_BY_CATEGORY: Record<Category, Designation[]> =
  {
    Gjenbruk: ["Kvinneklær", "Herreklær", "Barneklær", "Bøker"],
    Reparasjon: [
      "Sykkelreparasjon",
      "Skomaker",
      "Elektronikk",
      "Gullsmed",
      "Gitarmaker",
    ],
    Utlån: ["Sykkelutleie"],
  };

// ============================================================================
// Basic Utilities
// ============================================================================

/**
 * Splits semicolon-separated tag values into individual strings.
 * Trims each value and filters out empty strings.
 */
export function splitTagValues(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

// MANAGED_OSM_TAG_KEYS is computed lazily to avoid circular dependency
let managedOsmTagKeysCache: string[] | null = null;

export function getManagedOsmTagKeys(): string[] {
  if (managedOsmTagKeysCache === null) {
    managedOsmTagKeysCache = Array.from(
      new Set(
        designations.flatMap((designation) =>
          designation.definitions.flatMap((def) => def.map((item) => item.key)),
        ),
      ),
    );
  }
  return managedOsmTagKeysCache;
}

// ============================================================================
// Designation Functions
// ============================================================================

/**
 * Gets the shortest OSM tag definition for a given designation name.
 * Returns an empty array if designation is not found.
 */
export function getDesignationOsmTagDefinition(designationName: string) {
  const designation = designations.find(
    (item) => item.name === designationName,
  );
  if (!designation) {
    return [];
  }

  return [...designation.definitions].sort((a, b) => a.length - b.length)[0];
}

/**
 * Checks if a set of OSM tags matches a definition.
 * A definition is matched if all key-value pairs are present in the tags.
 */
export function matchesDefinition(
  osmTags: Record<string, unknown>,
  definition: readonly { key: string; value: string }[],
): boolean {
  return definition.every(({ key, value }) => {
    const osmValue = osmTags[key];
    if (osmValue === undefined || osmValue === null) {
      return false;
    }

    return splitTagValues(osmValue).some((candidate) => candidate === value);
  });
}

/**
 * Gets all applicable designations for a given GeoJSON feature.
 * Returns designation names that match the feature's OSM tags.
 */
export function getFivhDesignations(feature: GeoJSON.Feature): Designation[] {
  const properties = feature.properties;

  if (!properties) {
    return [];
  }
  const applicableDesignations = designations.reduce<Designation[]>(
    (acc, designation) => {
      const satisfiedDefinition = designation.definitions.find((definition) =>
        definition.every((osmTag) => {
          const value = properties[osmTag.key];
          if (value === undefined) {
            return false;
          }
          const values = splitTagValues(value);
          return values.some((value) => osmTag.value === value);
        }),
      );
      if (satisfiedDefinition) {
        acc.push(designation.name);
      }
      return acc;
    },
    [],
  ) as Designation[];

  return applicableDesignations;
}

/** Legacy alias for backwards compatibility */
export function getFivhTags(feature: GeoJSON.Feature): Designation[] {
  return getFivhDesignations(feature);
}

// ============================================================================
// Category Inference
// ============================================================================

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

/**
 * Infers the category from a list of selected designation names.
 * If all designations belong to one category, returns that category.
 * Otherwise, returns the most common category among the designations.
 * Defaults to Gjenbruk if no designations are selected.
 */
export function inferCategoryFromSelectedDesignations(
  selectedDesignationNames: Designation[],
): Category {
  if (selectedDesignationNames.length === 0) {
    return "Gjenbruk";
  }

  const categoryCounts: Record<Category, number> = {
    Gjenbruk: 0,
    Reparasjon: 0,
    Utlån: 0,
  };

  for (const designationName of selectedDesignationNames) {
    for (const [category, designationNames] of Object.entries(
      DESIGNATION_OPTIONS_BY_CATEGORY,
    )) {
      if (designationNames.includes(designationName)) {
        categoryCounts[category as Category]++;
      }
    }
  }

  let maxCategory: Category = "Gjenbruk";
  let maxCount = 0;

  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxCategory = category as Category;
    }
  }

  return maxCategory;
}

// ============================================================================
// OSM Tag Building and Selection
// ============================================================================

/**
 * Gets the selected designation names from OSM tags for a given category.
 * Returns only designations that have matching OSM tag definitions in the data.
 */
export function getSelectedDesignationNamesFromOsm(
  osmTags: Record<string, unknown>,
  category: Category,
): Designation[] {
  return DESIGNATION_OPTIONS_BY_CATEGORY[category].filter((designationName) => {
    const designationDef = designations.find((d) => d.name === designationName);
    if (!designationDef) {
      return false;
    }

    return designationDef.definitions.some((definition) =>
      matchesDefinition(osmTags, definition),
    );
  });
}

/**
 * Builds managed OSM tags from a category and selected designation names.
 * Combines category-specific OSM tags with selected designation OSM tags.
 * Handles multi-value tags like "clothes" which are semicolon-separated.
 */
export function buildManagedOsmTags(
  category: Category,
  selectedDesignationNames: Designation[],
): Record<string, string> {
  // Define category-specific base tags
  const categoryBaseTags: Record<Category, Record<string, string>> = {
    Gjenbruk: { shop: "second_hand" },
    Reparasjon: { craft: "repair" },
    Utlån: { amenity: "rental" },
  };

  const keyValues = new Map<string, string>();
  const clothesValues = new Set<string>();

  // Add category-specific base tags
  for (const [key, value] of Object.entries(categoryBaseTags[category])) {
    keyValues.set(key, value);
  }

  // Add tags from selected designations
  for (const designationName of selectedDesignationNames) {
    const definition = getOsmTagFromDesignation(designationName);

    for (const osmTag of definition) {
      if (osmTag.key === "clothes") {
        clothesValues.add(osmTag.value);
      } else {
        keyValues.set(osmTag.key, osmTag.value);
      }
    }
  }

  if (clothesValues.size > 0) {
    keyValues.set("clothes", Array.from(clothesValues).join(";"));
  }

  return Object.fromEntries(keyValues.entries());
}

/** Get all available designation names across all categories */
export function getAllDesignationNames(): string[] {
  return Object.values(DESIGNATION_OPTIONS_BY_CATEGORY).flat();
}

// ============================================================================
// Backwards Compatibility Aliases
// ============================================================================

export const CATEGORY_OPTIONS = categories.map((value) => ({
  value,
  label: value,
  osmTags: {
    Gjenbruk: { shop: "second_hand" },
    Reparasjon: { craft: "repair" },
    Utlån: { amenity: "rental" },
  }[value],
}));
export type CategoryOptionValue = Category;
export const KIND_OPTIONS = CATEGORY_OPTIONS;
export type KindOptionValue = Category;
export const DESIGNATION_OPTIONS_BY_KIND = DESIGNATION_OPTIONS_BY_CATEGORY;
export const TAG_OPTIONS_BY_KIND = DESIGNATION_OPTIONS_BY_CATEGORY;
export const getAllTagNames = getAllDesignationNames;
export const getSelectedTagNamesFromOsm = getSelectedDesignationNamesFromOsm;
export const inferKindFromSelectedTags = inferCategoryFromSelectedDesignations;
export const inferKindFromOsmTags = inferCategoryFromOsmTags;
export const getDefinitionForTag = getDesignationOsmTagDefinition;
