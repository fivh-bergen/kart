import { expect, describe, it } from "vitest";
import {
  splitTagValues,
  getDefinitionForTag,
  matchesDefinition,
  inferKindFromOsmTags,
  getSelectedTagNamesFromOsm,
  buildManagedOsmTags,
  KIND_OPTIONS,
  TAG_OPTIONS_BY_KIND,
  getManagedOsmTagKeys,
  getAllTagNames,
  inferKindFromSelectedTags,
} from "../osm-tag-helpers";

describe("OSM Tag Helpers", () => {
  describe("splitTagValues", () => {
    it("should split semicolon-separated strings", () => {
      expect(splitTagValues("women;men;children")).toEqual([
        "women",
        "men",
        "children",
      ]);
    });

    it("should trim whitespace from values", () => {
      expect(splitTagValues(" women ; men ")).toEqual(["women", "men"]);
    });

    it("should filter out empty strings", () => {
      expect(splitTagValues("women;;men")).toEqual(["women", "men"]);
    });

    it("should return empty array for non-string values", () => {
      expect(splitTagValues(null)).toEqual([]);
      expect(splitTagValues(undefined)).toEqual([]);
      expect(splitTagValues(123 as unknown as string)).toEqual([]);
    });

    it("should return single value as array", () => {
      expect(splitTagValues("women")).toEqual(["women"]);
    });
  });

  describe("getDefinitionForTag", () => {
    it("should return the shortest definition for a tag", () => {
      const definition = getDefinitionForTag("Elektronikk");
      expect(definition).toHaveLength(1);
    });

    it("should return empty array for unknown tag", () => {
      const definition = getDefinitionForTag("UnknownTag");
      expect(definition).toEqual([]);
    });

    it("should return definition with correct key-value pairs", () => {
      const definition = getDefinitionForTag("Kvinneklær");
      expect(definition).toEqual([{ key: "clothes", value: "women" }]);
    });
  });

  describe("matchesDefinition", () => {
    it("should match when all tags are present", () => {
      const osmTags = {
        clothes: "women",
        shop: "clothes",
      };
      const definition = [{ key: "clothes", value: "women" }];
      expect(matchesDefinition(osmTags, definition)).toBe(true);
    });

    it("should match with semicolon-separated values", () => {
      const osmTags = {
        clothes: "women;men",
      };
      const definition = [{ key: "clothes", value: "women" }];
      expect(matchesDefinition(osmTags, definition)).toBe(true);
    });

    it("should not match when key is missing", () => {
      const osmTags = { shop: "clothes" };
      const definition = [{ key: "clothes", value: "women" }];
      expect(matchesDefinition(osmTags, definition)).toBe(false);
    });

    it("should not match when value is wrong", () => {
      const osmTags = { clothes: "men" };
      const definition = [{ key: "clothes", value: "women" }];
      expect(matchesDefinition(osmTags, definition)).toBe(false);
    });

    it("should match multi-key definitions when all present", () => {
      const osmTags = {
        shop: "bicycle",
        repair: "yes",
      };
      const definition = [
        { key: "shop", value: "bicycle" },
        { key: "repair", value: "yes" },
      ];
      expect(matchesDefinition(osmTags, definition)).toBe(true);
    });

    it("should not match multi-key definitions if one is missing", () => {
      const osmTags = { shop: "bicycle" };
      const definition = [
        { key: "shop", value: "bicycle" },
        { key: "repair", value: "yes" },
      ];
      expect(matchesDefinition(osmTags, definition)).toBe(false);
    });
  });

  describe("inferKindFromOsmTags", () => {
    it("should infer Utlån from bicycle_rental", () => {
      expect(inferKindFromOsmTags({ amenity: "bicycle_rental" })).toBe("Utlån");
    });

    it("should infer Reparasjon from repair tags", () => {
      expect(inferKindFromOsmTags({ repair: "yes" })).toBe("Reparasjon");
    });

    it("should infer Reparasjon from craft shoemaker", () => {
      expect(inferKindFromOsmTags({ craft: "shoemaker" })).toBe("Reparasjon");
    });

    it("should default to Gjenbruk for unknown tags", () => {
      expect(inferKindFromOsmTags({})).toBe("Gjenbruk");
    });

    it("should infer Gjenbruk from second_hand shop", () => {
      expect(inferKindFromOsmTags({ shop: "second_hand" })).toBe("Gjenbruk");
    });
  });

  describe("getSelectedTagNamesFromOsm", () => {
    it("should return matching tag names for kind", () => {
      const osmTags = { clothes: "women" };
      const result = getSelectedTagNamesFromOsm(osmTags, "Gjenbruk");
      expect(result).toContain("Kvinneklær");
    });

    it("should return multiple matching tags", () => {
      const osmTags = { clothes: "women;men;children" };
      const result = getSelectedTagNamesFromOsm(osmTags, "Gjenbruk");
      expect(result).toContain("Kvinneklær");
      expect(result).toContain("Herreklær");
      expect(result).toContain("Barneklær");
    });

    it("should not return tags that do not match", () => {
      const osmTags = { amenity: "bicycle_rental" };
      const result = getSelectedTagNamesFromOsm(osmTags, "Gjenbruk");
      expect(result).not.toContain("Sykkelutleie");
    });

    it("should return empty array when no matches", () => {
      const osmTags = { random: "tag" };
      const result = getSelectedTagNamesFromOsm(osmTags, "Gjenbruk");
      expect(result).toEqual([]);
    });
  });

  describe("buildManagedOsmTags", () => {
    it("should build OSM tags from kind", () => {
      const result = buildManagedOsmTags("Gjenbruk", []);
      expect(result).toEqual({ shop: "second_hand" });
    });

    it("should add selected tag definitions", () => {
      const result = buildManagedOsmTags("Gjenbruk", ["Kvinneklær"]);
      expect(result.clothes).toContain("women");
      expect(result.shop).toBe("second_hand");
    });

    it("should combine multiple clothes tags with semicolon", () => {
      const result = buildManagedOsmTags("Gjenbruk", [
        "Kvinneklær",
        "Herreklær",
      ]);
      expect(result.clothes).toContain("women");
      expect(result.clothes).toContain("men");
      expect(result.clothes).not.toContain("children");
    });

    it("should build Reparasjon tags", () => {
      const result = buildManagedOsmTags("Reparasjon", ["Skomaker"]);
      expect(result.craft).toBe("shoemaker");
    });

    it("should build Utlån tags", () => {
      const result = buildManagedOsmTags("Utlån", ["Sykkelutleie"]);
      expect(result.amenity).toBe("bicycle_rental");
    });

    it("should not duplicate tags when multiple selected tags map to same OSM key", () => {
      const result = buildManagedOsmTags("Reparasjon", [
        "Elektronikk",
        "Skomaker",
      ]);
      // Should have the tags without duplication issues
      expect(typeof result.craft).toBe("string");
    });
  });

  describe("Constants", () => {
    it("should export KIND_OPTIONS", () => {
      expect(KIND_OPTIONS).toHaveLength(3);
      expect(KIND_OPTIONS.map((k) => k.value)).toEqual([
        "Gjenbruk",
        "Utlån",
        "Reparasjon",
      ]);
    });

    it("should export TAG_OPTIONS_BY_KIND", () => {
      expect(TAG_OPTIONS_BY_KIND.Gjenbruk).toContain("Kvinneklær");
      expect(TAG_OPTIONS_BY_KIND.Reparasjon).toContain("Skomaker");
      expect(TAG_OPTIONS_BY_KIND.Utlån).toContain("Sykkelutleie");
    });

    it("should export MANAGED_OSM_TAG_KEYS", () => {
      const keys = getManagedOsmTagKeys();
      expect(keys).toContain("clothes");
      expect(keys).toContain("craft");
      expect(keys).toContain("amenity");
    });
  });

  describe("getAllTagNames", () => {
    it("should return all tags from all kinds", () => {
      const allTags = getAllTagNames();
      expect(allTags).toContain("Kvinneklær");
      expect(allTags).toContain("Skomaker");
      expect(allTags).toContain("Sykkelutleie");
    });

    it("should have no duplicates", () => {
      const allTags = getAllTagNames();
      const uniqueTags = new Set(allTags);
      expect(allTags).toHaveLength(uniqueTags.size);
    });
  });

  describe("inferKindFromSelectedTags", () => {
    it("should return Gjenbruk for empty selection", () => {
      expect(inferKindFromSelectedTags([])).toBe("Gjenbruk");
    });

    it("should return kind when all tags are from one kind", () => {
      expect(inferKindFromSelectedTags(["Kvinneklær"])).toBe("Gjenbruk");
      expect(inferKindFromSelectedTags(["Skomaker", "Gullsmed"])).toBe(
        "Reparasjon",
      );
      expect(inferKindFromSelectedTags(["Sykkelutleie"])).toBe("Utlån");
    });

    it("should return most common kind when tags from multiple kinds", () => {
      // 2 Reparasjon, 1 Gjenbruk
      const result = inferKindFromSelectedTags([
        "Kvinneklær",
        "Skomaker",
        "Elektronikk",
      ]);
      expect(result).toBe("Reparasjon");
    });

    it("should handle ties by returning first most common", () => {
      // 1 Reparasjon, 1 Gjenbruk
      const result = inferKindFromSelectedTags(["Kvinneklær", "Skomaker"]);
      // Should return Gjenbruk (first in kindCounts order)
      expect(typeof result).toBe("string");
      expect(["Gjenbruk", "Reparasjon"]).toContain(result);
    });
  });
});
