interface Tag {
  /** A key in OSM's properties, e.g. 'contact:email' */
  key: string;
  /** The value associated with the key, e.g. 'stephen@example.com' */
  value: string;
}

/** A list of tags that must be present to satisfy this tag definition */
type FivhFeatureTagDefinitionSimplified = Tag[];

/** A tag that describes a feature in a human-readable way. Defined via underlying OpenStreetMap */
interface FivhFeatureTag {
  name: string;
  /** A list of tags definitions that satisfy applying this tag. Satisfying one definition is enough to apply the tag. */
  definitions: FivhFeatureTagDefinitionSimplified[];
}

/** An object describing a set of human readable tags that should be applied to a feature based on the underlying OSM tags */
const tags: FivhFeatureTag[] = [
  {
    name: "Bruktbutikk",
    definitions: [
      [
        { key: "shop", value: "*" },
        { key: "second_hand", value: "yes" },
      ],
      [
        { key: "shop", value: "*" },
        { key: "second_hand", value: "only" },
      ],
      [{ key: "shop", value: "second_hand" }],
    ],
  },
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
];

export function getFivhTags(feature: GeoJSON.Feature): string[] {
  const properties = feature.properties;

  if (!properties) {
    return [];
  }
  const tagsToApply = tags.reduce<string[]>((acc, tag) => {
    const satisfiedDefinition = tag.definitions.find((definition) =>
      definition.every((tag) => {
        const value = properties[tag.key];
        if (value === undefined) {
          return false;
        }
        const values = splitTagValues(value);
        return values.some((value) => {
          return tag.value === "*" || tag.value === value;
        });
      })
    );
    if (satisfiedDefinition) {
      acc.push(tag.name);
    }
    return acc;
  }, []);

  return tagsToApply;
}

/** Splits semicolon-separated tag values into individual strings */
export function splitTagValues(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  return value.split(";");
}
