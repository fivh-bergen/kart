import { describe, it, expect } from "vitest";
import { groupDesignations } from "../designation";

// we only need a few names to exercise ordering logic, so the
// assertions remain easy to read and maintain.
describe("groupDesignations", () => {
  it("sorts the resulting groups by the order field from the definition", () => {
    // choose a handful of designations from different groups
    const input = [
      "Kvinneklær", // sells (order 5)
      "Bruktbutikk", // shop (order 1)
      "Sykkelutleie", // renter (order 2)
    ];

    const groups = groupDesignations(input);
    const labels = groups.map((g) => g.groupLabel);

    // shop should come first, then renter, then sells
    expect(labels).toEqual(["Butikktype", "Type Utleiested", "Selger"]);
  });

  it("sorts designations inside a group alphabetically by label", () => {
    const input = ["Herreklær", "Kvinneklær"]; // both belong to `sells`
    const groups = groupDesignations(input);

    expect(groups.length).toBe(1);
    expect(groups[0].designations.map((d) => d.label)).toEqual([
      "Herreklær",
      "Kvinneklær",
    ]);
  });
});
