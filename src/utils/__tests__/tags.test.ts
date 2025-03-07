import { expect, test } from "vitest";
import { getFivhTags } from "../tags";

test("should read tags from feature correctly", () => {
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
