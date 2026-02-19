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
 */
export const designations = [
  {
    name: "Kvinneklær",
    label: "Kvinneklær",
    definitions: [[{ key: "clothes", value: "women" }]],
  },
  {
    name: "Herreklær",
    label: "Herreklær",
    definitions: [[{ key: "clothes", value: "men" }]],
  },
  {
    name: "Barneklær",
    label: "Barneklær",
    definitions: [[{ key: "clothes", value: "children" }]],
  },
  {
    name: "Sykkelreparasjon",
    label: "Sykkelreparasjon",
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
    label: "Skomaker",
    definitions: [[{ key: "craft", value: "shoemaker" }]],
  },
  {
    name: "Bøker",
    label: "Bøker",
    definitions: [[{ key: "shop", value: "books" }]],
  },
  {
    name: "Elektronikk",
    label: "Elektronikk",
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
    definitions: [
      [{ key: "craft", value: "goldsmith" }],
      [{ key: "craft", value: "jeweller" }],
    ],
  },
  {
    name: "Gitarmaker",
    label: "Gitarmaker",
    definitions: [[{ key: "craft", value: "luthier" }]],
  },
  {
    name: "Sykkelutleie",
    label: "Sykkelutleie",
    definitions: [[{ key: "amenity", value: "bicycle_rental" }]],
  },
] as const;

export type Designation = (typeof designations)[number]["name"];

export type ManagedOsmTag =
  (typeof designations)[number]["definitions"][number][number];

type ManagedOsmDefinition =
  (typeof designations)[number]["definitions"][number];

export function splitTagValues(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getDefinitionFromDesignation(
  designationName: Designation,
): ManagedOsmDefinition {
  const designation = designations.find((d) => d.name === designationName);
  if (!designation) {
    throw new Error(`No designation found with name ${designationName}`);
  }
  // Return the first definition, which is assumed to be the most common/conventional one
  return designation.definitions[0];
}

export function getOsmTagsFromDesignations(
  designations: Designation[],
): Record<string, string> {
  const tags: Record<string, string> = {};

  for (const designationName of designations) {
    const definition = getDefinitionFromDesignation(designationName);
    for (const { key, value } of definition) {
      if (tags[key]) {
        // If the key already exists, append the new value with a semicolon
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
