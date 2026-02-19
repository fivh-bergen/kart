import { expect, describe, it } from "vitest";
import { getDesignationsFromTags } from "../designation";

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

    expect(designations).toEqual(["Sykkelreparasjon"]);
  });

  it("should handle semicolon-separated tag values", () => {
    const actual = getDesignationsFromTags({
      shop: "clothes",
      clothes: "women;men;",
    });

    expect(actual).toEqual(["Kvinneklær", "Herreklær"]);
  });
});
