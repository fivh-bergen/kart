import { expect, describe, it } from "vitest";
import { getDesignationsFromTags, getOsmTagsFromDesignations, applyDesignationChanges } from "../designation";

describe("getDesignationsFromTags", () => {
  it("should read designations from feature tags correctly", () => {
    const tags = {
      email: "post@trekbergen.no",
      name: "Trek Bergen",
      opening_hours: "Mo-Th 10:00-19:00; Fr 10:00-18:00; Sa 10:00-16:00",
      phone: "+47 55 27 14 50",
      "service:bicycle:repair": "yes",
      "service:bicycle:retail": "yes",
      shop: "bicycle",
      website: "https://trekbergen.no/",
    };
    const designations = getDesignationsFromTags(tags);

    expect(designations).toEqual(["repairs-bicycles"]);
  });

  it("should handle semicolon-separated tag values", () => {
    const actual = getDesignationsFromTags({
      shop: "clothes",
      clothes: "women;men;",
    });

    expect(actual).toEqual(["Kvinneklær", "Herreklær"]);
  });

  it("treats `rental` as a multi-value key (parse & serialize)", () => {
    // parsing semicolon-separated `rental` values
    const parsed = getDesignationsFromTags({ rental: "bicycle;ebike" });
    expect(parsed).toEqual(["rents-bicycles", "rents-e-bikes"]);

    // serialising multiple `rents-*` designations to OSM tags
    const tags = getOsmTagsFromDesignations(["rents-bicycles", "rents-e-bikes"]);
    expect(tags.rental).toBe("bicycle;ebike");

    // applyDesignationChanges should also add both values for `rental`
    const applied = applyDesignationChanges({}, ["rents-bicycles", "rents-e-bikes"], []);
    expect(applied.rental).toBe("bicycle;ebike");
  });
});
