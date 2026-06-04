import { describe, it, expect } from "vitest";
import { getOverpassQuery, fetchOverpass } from "../fetch-data.js";
import osmtogeojson from "osmtogeojson";

describe("Overpass API integration test", () => {
  it("should fetch at least one element from Overpass API", async () => {
    const query = await getOverpassQuery();

    const response = await fetchOverpass(query);

    const osmJson = await response.json();

    const geojson = osmtogeojson(osmJson);

    expect(geojson.features.length).toBeGreaterThan(0);
  });
});
