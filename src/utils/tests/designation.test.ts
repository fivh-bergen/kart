import { describe, it, expect } from "vitest";
import { isDesignationEditable } from "../designation";

describe("isDesignationEditable", () => {
  it("returns false for designations explicitly marked non-editable", () => {
    expect(isDesignationEditable("Bruktbutikk")).toBe(false);
    expect(isDesignationEditable("Bruktklær")).toBe(false);
  });

  it("returns true for designations where editable is omitted", () => {
    expect(isDesignationEditable("Kvinneklær")).toBe(true);
    expect(isDesignationEditable("Herreklær")).toBe(true);
  });
});
