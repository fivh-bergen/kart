/**
 * In this project, we want to visualise data from OSM in a user friendly way.
 * OpenStreetMap data is tagged with key-value pairs, but there are often many different ways to tag the same thing,
 * and the tag data itself is not very pleasing to the eye.
 * An example would be the tag `clothes=women`, which is not very appealing to read and is not localised.
 * Therefore, we want to show this as "Kvinneklær" instead, which is more user friendly.
 * We call this a "designation".
 * Since there are often many different ways to tag the same thing in OSM,
 * we need to map multiple different OSM tags to the same designation.
 * Therefore we have an array of definitions.
 * The first definition in the array should be the most common/conventional one.
 * Definitions can consist of multiple tags, such as `shop=bicycle` + `repair=yes`,
 * which together indicate that this is a place that repairs bicycles.
 *
 * Each designation also specifies which category it belongs to.
 */
import type { Category } from "./category.ts";

export const designations = [
  {
    name: "Bruktbutikk",
    label: "Bruktbutikk",
    editable: false,
    category: "Gjenbruk" as Category,
    definitions: [
      [{ key: "shop", value: "second_hand" }],
      [{ key: "shop", value: "charity" }],
    ],
  },
  {
    name: "Bruktklær",
    label: "Bruktklær/vintage",
    editable: false,
    category: "Gjenbruk" as Category,
    definitions: [
      [
        { key: "shop", value: "clothes" },
        { key: "second_hand", value: "only" },
      ],
      [
        { key: "shop", value: "clothes" },
        { key: "second_hand", value: "yes" },
      ],
    ],
  },
  {
    name: "Kvinneklær",
    group: "sells",
    label: "Kvinneklær",
    category: "Gjenbruk" as Category,
    definitions: [[{ key: "clothes", value: "women" }]],
  },
  {
    name: "Herreklær",
    group: "sells",
    label: "Herreklær",
    category: "Gjenbruk" as Category,
    definitions: [[{ key: "clothes", value: "men" }]],
  },
  {
    name: "Barneklær",
    group: "sells",
    label: "Barneklær",
    category: "Gjenbruk" as Category,
    definitions: [[{ key: "clothes", value: "children" }]],
  },
  {
    name: "sells-toys",
    group: "sells",
    label: "Leketøy",
    category: "Gjenbruk" as Category,
    definitions: [[{ key: "sells", value: "toys" }]],
  },
  {
    name: "repairs-bicycles",
    label: "Sykler",
    group: "repairs",
    category: "Reparasjon" as Category,
    definitions: [
      [
        { key: "shop", value: "bicycle" },
        { key: "repair", value: "yes" },
      ],
      [{ key: "service:bicycle:repair", value: "yes" }],
    ],
  },
  {
    name: "repairs-mobile-phones",
    label: "Mobiltelefoner",
    group: "repairs",
    category: "Reparasjon" as Category,
    definitions: [[{ key: "mobile_phone:repair", value: "yes" }]],
  },
  {
    name: "repairs-shoes",
    label: "Sko",
    group: "repairs",
    category: "Reparasjon" as Category,
    definitions: [[{ key: "craft", value: "shoemaker" }]],
  },
  {
    name: "sells-books",
    label: "Bøker",
    group: "sells",
    category: "Gjenbruk" as Category,
    definitions: [[{ key: "sells", value: "books" }]],
  },
  {
    name: "Elektronikkreparasjon",
    label: "Elektronikkreparasjon",
    editable: false,
    category: "Reparasjon" as Category,
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
    label: "Gullsmed",
    category: "Reparasjon" as Category,
    definitions: [
      [{ key: "craft", value: "goldsmith" }],
      [{ key: "craft", value: "jeweller" }],
    ],
  },
  {
    name: "Gitarmaker",
    label: "Gitarmaker",
    category: "Reparasjon" as Category,
    definitions: [[{ key: "craft", value: "luthier" }]],
  },
  {
    name: "Sykkelutleie",
    label: "Sykkelutleie",
    category: "Utlån" as Category,
    definitions: [[{ key: "amenity", value: "bicycle_rental" }]],
  },
] as const;

export type Designation = (typeof designations)[number]["name"];
type DesignationWithGroup = Extract<
  (typeof designations)[number],
  { group: string }
>;
type GroupName = DesignationWithGroup["group"];

const groupLabels: Record<GroupName, string> = {
  sells: "Selger",
  repairs: "Reparerer",
};

export type ManagedOsmTag =
  (typeof designations)[number]["definitions"][number][number];

type ManagedOsmDefinition =
  (typeof designations)[number]["definitions"][number];

function getDesignationByName(designationName: Designation) {
  const designation = designations.find((d) => d.name === designationName);
  if (!designation) {
    throw new Error(`No designation found with name ${designationName}`);
  }

  return designation;
}

export function getDesignationLabel(designationName: Designation): string {
  return getDesignationByName(designationName).label;
}

export function splitTagValues(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getPrimaryDefinitionFromDesignation(
  designationName: Designation,
): ManagedOsmDefinition {
  const designation = getDesignationByName(designationName);

  // Return the first definition, which is assumed to be the most common/conventional one
  return designation.definitions[0];
}

export function getOsmTagsFromDesignations(
  designations: Designation[],
): Record<string, string> {
  const tags: Record<string, string> = {};

  for (const designationName of designations) {
    const definition = getPrimaryDefinitionFromDesignation(designationName);
    for (const { key, value } of definition) {
      if (multiValueKeys.has(key)) {
        const currentValues = splitTagValues(tags[key]);
        if (!currentValues.includes(value)) {
          tags[key] = [...currentValues, value].join(";");
        }
      } else if (tags[key]) {
        tags[key] += `;${value}`;
      } else {
        tags[key] = value;
      }
    }
  }

  return tags;
}

type KeyValuePair = { key: string; value: string };

function satisfiesDefinition(
  tags: KeyValuePair[],
  definition: ManagedOsmDefinition,
): boolean {
  return definition.every((defTag) =>
    tags.some((tag) => tag.key === defTag.key && tag.value === defTag.value),
  );
}

export function getDesignationsFromTags(tags: Record<string, any>) {
  const splitKeyValues: KeyValuePair[] = [];

  for (const [key, value] of Object.entries(tags)) {
    const values = splitTagValues(value);
    for (const val of values) {
      splitKeyValues.push({ key, value: val });
    }
  }

  return designations
    .filter(({ definitions }) =>
      definitions.some((definition) =>
        satisfiesDefinition(splitKeyValues, definition),
      ),
    )
    .map((designation) => designation.name);
}

/**
 * Finds the definition variant that actually matches the existing tags
 * for a given designation. This is important so we remove the right tags
 * when un-selecting a designation — not the primary definition tags which
 * may differ from what the node actually has.
 */
function findMatchingDefinition(
  designationName: Designation,
  existingTags: Record<string, unknown>,
): ManagedOsmDefinition | null {
  const designation = designations.find((d) => d.name === designationName);
  if (!designation) return null;

  const kvPairs: KeyValuePair[] = [];
  for (const [key, value] of Object.entries(existingTags)) {
    for (const val of splitTagValues(value)) {
      kvPairs.push({ key, value: val });
    }
  }

  return (
    designation.definitions.find((def) => satisfiesDefinition(kvPairs, def)) ??
    null
  );
}

/**
 * Applies only the designation changes (additions and removals) to the
 * existing tags, leaving untouched designations' tags as-is.
 *
 * This prevents the primary-definition lookup from overwriting tags that
 * already satisfy a designation via an alternative definition
 * (e.g. `second_hand=yes` being replaced by `second_hand=only`).
 */
export function applyDesignationChanges(
  existingTags: Record<string, string>,
  added: Designation[],
  removed: Designation[],
): Record<string, string> {
  const tags = { ...existingTags };

  // Remove tags for removed designations
  for (const name of removed) {
    const matchingDef = findMatchingDefinition(name, existingTags);
    if (!matchingDef) continue;

    for (const { key, value } of matchingDef) {
      if (multiValueKeys.has(key)) {
        // For multi-value keys (e.g. clothes=women;children),
        // remove only the specific value from the semicolon list
        const values = splitTagValues(tags[key]);
        const filtered = values.filter((v) => v !== value);
        if (filtered.length > 0) {
          tags[key] = filtered.join(";");
        } else {
          delete tags[key];
        }
      } else {
        delete tags[key];
      }
    }
  }

  // Add tags for added designations (uses primary definition)
  for (const name of added) {
    const definition = getPrimaryDefinitionFromDesignation(name);
    for (const { key, value } of definition) {
      if (multiValueKeys.has(key)) {
        const values = splitTagValues(tags[key]);
        if (!values.includes(value)) {
          tags[key] = [...values, value].join(";");
        }
      } else {
        tags[key] = value;
      }
    }
  }

  return tags;
}

/**
 * OSM keys that allow multiple semicolon-separated values.
 * Designations using these keys can be freely combined (checkboxes).
 * All other keys are treated as exclusive — only one value allowed per key (radio buttons).
 */
export const multiValueKeys = new Set(["clothes", "sells"]);

/** Human-readable labels for OSM key groups shown in the UI */
export const osmKeyLabels: Record<string, string> = {
  shop: "Butikktype",
  craft: "Håndverk",
  amenity: "Tjeneste",
  clothes: "Klær",
  sells: "Selger",
};

/**
 * Gets the primary OSM key that a designation's first definition sets.
 */
export function getPrimaryKey(designationName: Designation): string {
  const definition = getPrimaryDefinitionFromDesignation(designationName);
  return definition[0].key;
}

export function getDesignationGroup(
  designationName: Designation,
): GroupName | undefined {
  const designation = getDesignationByName(designationName);
  return "group" in designation ? designation.group : undefined;
}

/** Whether a designation may be edited by users in the edit form.
 *  Defaults to true when the `editable` flag is omitted.
 */
export function isDesignationEditable(designationName: Designation): boolean {
  const designation = getDesignationByName(designationName);
  return "editable" in designation ? designation.editable : true;
}

export interface DesignationGroup {
  key: string;
  label: string;
  multiValue: boolean;
  designations: Designation[];
}

/**
 * Groups designations by their primary OSM key for UI rendering.
 *
 * Keys in `multiValueKeys` (e.g. `clothes`) allow multiple values and
 * should be rendered as checkboxes. All other keys are exclusive — only
 * one designation per key can be selected — and should be rendered as
 * radio buttons (with a "Ingen" / none option).
 */
export function groupDesignationsByConflict(
  designationNames: Designation[],
): DesignationGroup[] {
  const groupMap = new Map<string, Designation[]>();
  const groupMetadata = new Map<
    string,
    { label: string; multiValue: boolean }
  >();

  for (const name of designationNames) {
    const groupName = getDesignationGroup(name);

    const key = groupName ? `group:${groupName}` : getPrimaryKey(name);
    const group = groupMap.get(key) ?? [];
    group.push(name);
    groupMap.set(key, group);

    if (groupName) {
      groupMetadata.set(key, {
        label: groupLabels[groupName] ?? groupName,
        multiValue: true,
      });
      continue;
    }

    const primaryKey = getPrimaryKey(name);
    groupMetadata.set(key, {
      label: osmKeyLabels[primaryKey] ?? primaryKey,
      multiValue: multiValueKeys.has(primaryKey),
    });
  }

  return Array.from(groupMap.entries()).map(([key, dsgs]) => {
    const metadata = groupMetadata.get(key);

    return {
      key,
      label: metadata?.label ?? key,
      multiValue: metadata?.multiValue ?? false,
      designations: dsgs,
    };
  });
}
