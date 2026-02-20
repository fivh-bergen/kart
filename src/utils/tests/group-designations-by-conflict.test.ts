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

    const shopGroup = groups.find((g) => g.key === "shop");
    expect(shopGroup).toBeDefined();
    expect(shopGroup!.designations).toEqual(
      expect.arrayContaining(["Bruktbutikk"]),
    );
    // `shop` is not a multi-value key in multi-value list
    expect(shopGroup!.multiValue).toBe(false);
  });
});
