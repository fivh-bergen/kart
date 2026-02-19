import { expect, describe, it } from "vitest";
import { getFivhTags } from "../osm-tag-helpers";

describe("getFivhTags", () => {
  it("should read tags from feature correctly", () => {
    const feature: GeoJSON.Feature = {
      type: "Feature",
      id: "node/289529117",
      properties: {
        email: "post@trekbergen.no",
        name: "Trek Bergen",
        opening_hours: "Mo-Th 10:00-19:00; Fr 10:00-18:00; Sa 10:00-16:00",
        phone: "+47 55 27 14 50",
        "service:bicycle:repair": "yes",
        "service:bicycle:retail": "yes",
        shop: "bicycle",
        website: "https://trekbergen.no/",
        id: "node/289529117",
      },
      geometry: {
        type: "Point",
        coordinates: [5.336896, 60.3507129],
      },
    };
    const tags = getFivhTags(feature);

    expect(tags).toEqual(["Sykkelreparasjon"]);
  });

  it("should read tags from feature correctly", () => {
    const actual = getFivhTags({
      type: "Feature",
      id: "node/123",
      geometry: {
        type: "Point",
        coordinates: [0, 0],
      },
      properties: {
        shop: "clothes",
        clothes: "women;men;",
      },
    });

    expect(actual).toEqual(["Kvinneklær", "Herreklær"]);
  });
});
