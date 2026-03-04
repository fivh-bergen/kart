import { describe, it, expect } from "vitest";
import { groupDesignationsByConflict } from "../designation";

describe("groupDesignationsByConflict", () => {
  it("groups by designation group and by primary key with correct multiValue flag", () => {
    const groups = groupDesignationsByConflict([
      "Kvinneklær",
      "Herreklær",
      "Bruktbutikk",
    ]);

    const sellsGroup = groups.find((g) => g.key === "group:sells");
    expect(sellsGroup).toBeDefined();
    expect(sellsGroup!.designations).toEqual(
      expect.arrayContaining(["Kvinneklær", "Herreklær"]),
    );
    // `sells` group in group-def.ts is not singleton -> multiValue should be true
    expect(sellsGroup!.multiValue).toBe(true);

    const shopGroup = groups.find((g) => g.key === "group:shop");
    expect(shopGroup).toBeDefined();
    expect(shopGroup!.designations).toEqual(
      expect.arrayContaining(["Bruktbutikk"]),
    );
    // `shop` is not a multi-value key in multi-value list
    expect(shopGroup!.multiValue).toBe(false);
  });

  it("returns groups in the order defined by the group definitions", () => {
    // picks designations from three different groups and also an
    // ungroupped designation to verify that named groups appear first
    const ordered = groupDesignationsByConflict([
      "Kvinneklær", // sells (order 5)
      "Bruktbutikk", // shop (order 1)
      "Sykkelutleie", // renter (order 2)
    ]);

    // the resulting keys should appear in the expected order based on
    // the group definitions (shop=1, renter=2, sells=5)
    expect(ordered.map((g) => g.key)).toEqual([
      "group:shop",
      "group:renter",
      "group:sells",
    ]);
  });
});
