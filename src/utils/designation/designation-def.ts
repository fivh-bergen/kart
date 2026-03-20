import type { Category } from "./category-def";
import type { DesignationGroup } from "./group-def";

type OsmDefinition = { key: string; value: string };

type Designation = {
  name: string;
  label: string;
  editable?: boolean;
  category: Category["name"];
  group?: DesignationGroup["name"];
  definitions: OsmDefinition[][];
};

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
export const designations: Designation[] = [
  {
    name: "Bruktbutikk",
    label: "Bruktbutikk",
    group: "shop",
    category: "reuse",
    definitions: [
      [{ key: "shop", value: "second_hand" }],
      [{ key: "shop", value: "charity" }],
    ],
  },
  {
    name: "antiques",
    label: "Antikvariat",
    group: "shop",
    category: "reuse",
    definitions: [[{ key: "shop", value: "antiques" }]],
  },
  {
    name: "Bruktklær",
    label: "Bruktklær/vintage",
    group: "shop",
    category: "reuse",
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
    category: "reuse",
    definitions: [[{ key: "clothes", value: "women" }]],
  },
  {
    name: "Herreklær",
    group: "sells",
    label: "Herreklær",
    category: "reuse",
    definitions: [[{ key: "clothes", value: "men" }]],
  },
  {
    name: "Barneklær",
    group: "sells",
    label: "Barneklær",
    category: "reuse",
    definitions: [[{ key: "clothes", value: "children" }]],
  },
  {
    name: "sells-toys",
    group: "sells",
    label: "Leketøy",
    category: "reuse",
    definitions: [[{ key: "sells", value: "toys" }]],
  },
  {
    name: "sells-clothes",
    group: "sells",
    label: "Klær",
    category: "reuse",
    definitions: [[{ key: "sells", value: "clothes" }]],
  },
  {
    name: "sells-ski",
    group: "sells",
    label: "Ski",
    category: "reuse",
    definitions: [[{ key: "sells", value: "ski" }]],
  },
  {
    name: "sells-snowboard",
    group: "sells",
    label: "Snowboard",
    category: "reuse",
    definitions: [[{ key: "sells", value: "snowboard" }]],
  },
  {
    name: "sells-appliances",
    group: "sells",
    label: "Hvitevarer",
    category: "reuse",
    definitions: [[{ key: "sells", value: "appliances" }]],
  },
  {
    name: "sells-electronics",
    group: "sells",
    label: "Elektronikk",
    category: "reuse",
    definitions: [[{ key: "sells", value: "electronics" }]],
  },
  {
    name: "sells-furniture",
    group: "sells",
    label: "Møbler",
    category: "reuse",
    definitions: [[{ key: "sells", value: "furniture" }]],
  },
  {
    name: "sells-stationery",
    group: "sells",
    label: "Kontorrekvisita",
    category: "reuse",
    definitions: [[{ key: "sells", value: "stationery" }]],
  },
  {
    name: "sells-antiques",
    group: "sells",
    label: "Antikviteter",
    category: "reuse",
    definitions: [[{ key: "sells", value: "antiques" }]],
  },
  {
    name: "sells-art",
    group: "sells",
    label: "Kunst",
    category: "reuse",
    definitions: [[{ key: "sells", value: "art" }]],
  },
  {
    name: "sells-tools",
    group: "sells",
    label: "Verktøy",
    category: "reuse",
    definitions: [[{ key: "sells", value: "tools" }]],
  },
  {
    name: "sells-building-materials",
    group: "sells",
    label: "Byggematerialer",
    category: "reuse",
    definitions: [[{ key: "sells", value: "building_materials" }]],
  },
  {
    name: "sells-jewellery",
    group: "sells",
    label: "Smykker",
    category: "reuse",
    definitions: [[{ key: "sells", value: "jewellery" }]],
  },
  {
    name: "sells-bicycles",
    group: "sells",
    label: "Sykler",
    category: "reuse",
    definitions: [[{ key: "sells", value: "bicycle" }]],
  },
  {
    name: "sells-computers",
    group: "sells",
    label: "Datamaskiner",
    category: "reuse",
    definitions: [[{ key: "sells", value: "computer" }]],
  },
  {
    name: "sells-exercise-equipment",
    group: "sells",
    label: "Treningsutstyr",
    category: "reuse",
    definitions: [[{ key: "sells", value: "exercise_equipment" }]],
  },
  {
    name: "sells-shoes",
    group: "sells",
    label: "Sko",
    category: "reuse",
    definitions: [[{ key: "sells", value: "shoes" }]],
  },
  {
    name: "sells-coffee",
    group: "sells",
    label: "Kaffe",
    category: "reuse",
    definitions: [[{ key: "sells", value: "coffee" }]],
  },
  {
    name: "sells-board-games",
    group: "sells",
    label: "Brettspill",
    category: "reuse",
    definitions: [[{ key: "sells", value: "board_games" }]],
  },
  {
    name: "sells-cd",
    group: "sells",
    label: "CD-er",
    category: "reuse",
    definitions: [[{ key: "sells", value: "cd" }]],
  },
  {
    name: "sells-dvd",
    group: "sells",
    label: "DVD-er",
    category: "reuse",
    definitions: [[{ key: "sells", value: "dvd" }]],
  },
  {
    name: "bicycle-shop-with-repair",
    label: "Sykkelbutikk med verksted",
    group: "repairer",
    category: "repair",
    definitions: [
      [
        { key: "shop", value: "bicycle" },
        { key: "repair", value: "yes" },
      ],
    ],
  },
  {
    name: "repair-shop",
    label: "Reparasjonssted",
    group: "repairer",
    category: "repair",
    definitions: [[{ key: "shop", value: "repair" }]],
  },
  {
    name: "repairs-bicycles",
    label: "Sykler",
    group: "repairs",
    category: "repair",
    definitions: [
      [
        { key: "shop", value: "bicycle" },
        { key: "repair", value: "yes" },
      ],
      [{ key: "service:bicycle:repair", value: "yes" }],
    ],
  },
  {
    name: "repairs-clothes",
    label: "Klær",
    group: "repairs",
    category: "repair",
    definitions: [[{ key: "clothes:repair", value: "yes" }]],
  },
  {
    name: "repairs-mobile-phones",
    label: "Mobiltelefoner",
    group: "repairs",
    category: "repair",
    definitions: [[{ key: "mobile_phone:repair", value: "yes" }]],
  },
  {
    name: "repairs-shoes",
    label: "Sko",
    group: "repairs",
    category: "repair",
    definitions: [[{ key: "shoes:repair", value: "yes" }]],
  },
  {
    name: "craft-shoemaker",
    label: "Skomaker",
    group: "repairer",
    category: "repair",
    definitions: [[{ key: "craft", value: "shoemaker" }]],
  },
  {
    name: "craft-tailor",
    label: "Skredder",
    group: "repairer",
    category: "repair",
    definitions: [[{ key: "craft", value: "tailor" }]],
  },
  {
    name: "sells-books",
    label: "Bøker",
    group: "sells",
    category: "reuse",
    definitions: [[{ key: "sells", value: "books" }]],
  },
  {
    name: "Elektronikkreparasjon",
    label: "Elektronikkreparasjon",
    group: "repairer",
    category: "repair",
    definitions: [
      [{ key: "shop", value: "electronics_repair" }],
      [{ key: "craft", value: "electronics_repair" }],
      [{ key: "computer:repair", value: "yes" }],
      [{ key: "camera:repair", value: "yes" }],
    ],
  },
  {
    name: "craft-goldsmith",
    label: "Gullsmed",
    group: "repairer",
    category: "repair",
    definitions: [
      [{ key: "craft", value: "goldsmith" }],
      [{ key: "craft", value: "jeweller" }],
    ],
  },
  {
    name: "craft-luthier",
    label: "Gitarmaker",
    group: "repairer",
    category: "repair",
    definitions: [[{ key: "craft", value: "luthier" }]],
  },
  {
    name: "craft-watchmaker",
    label: "Urmaker",
    group: "repairer",
    category: "repair",
    definitions: [[{ key: "craft", value: "watchmaker" }]],
  },
  {
    name: "Sykkelutleie",
    label: "Sykkelutleie",
    group: "renter",
    category: "rental",
    definitions: [[{ key: "amenity", value: "bicycle_rental" }]],
  },
  {
    name: "shop-rental",
    label: "Utleiested",
    group: "renter",
    category: "rental",
    definitions: [[{ key: "shop", value: "rental" }]],
  },
  {
    name: "book-box",
    label: "Bokskap",
    group: "renter",
    category: "rental",
    definitions: [[{ key: "amenity", value: "public_bookcase" }]],
  },
  {
    name: "rents-bicycles",
    label: "Sykler",
    group: "rents",
    category: "rental",
    definitions: [[{ key: "rental", value: "bicycle" }]],
  },
  {
    name: "rents-e-bikes",
    label: "E-Sykler",
    group: "rents",
    category: "rental",
    definitions: [[{ key: "rental", value: "ebike" }]],
  },
  {
    name: "rents-cargo-bikes",
    label: "Lastesykler",
    group: "rents",
    category: "rental",
    definitions: [[{ key: "rental", value: "cargo_bike" }]],
  },
  {
    name: "rents-skis",
    label: "Ski",
    group: "rents",
    category: "rental",
    definitions: [[{ key: "rental", value: "ski" }]],
  },
  {
    name: "rents-ice-skates",
    label: "Skøyter",
    group: "rents",
    category: "rental",
    definitions: [[{ key: "rental", value: "ice_skates" }]],
  },
  {
    name: "rents-tents",
    label: "Telt",
    group: "rents",
    category: "rental",
    definitions: [[{ key: "rental", value: "tent" }]],
  },
  {
    name: "rents-costumes",
    label: "Kostymer",
    group: "rents",
    category: "rental",
    definitions: [[{ key: "rental", value: "costume" }]],
  },
  {
    name: "rents-clothes",
    label: "Klær",
    group: "rents",
    category: "rental",
    definitions: [[{ key: "rental", value: "clothes" }]],
  },
  {
    name: "rents-shoes",
    label: "Sko",
    group: "rents",
    category: "rental",
    definitions: [[{ key: "rental", value: "shoes" }]],
  },
] as const;
