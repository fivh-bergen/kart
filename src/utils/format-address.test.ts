import { describe, expect, it } from "vitest";
import { formatAddress } from "./format-address";

describe("formatAddress", () => {
  it("returns undefined when all fields are missing", () => {
    expect(formatAddress({})).toBeUndefined();
  });

  it("formats full address", () => {
    expect(
      formatAddress({
        street: "Sverres gate",
        buildingNumber: "5",
        postalCode: "5010",
        city: "Bergen",
      }),
    ).toBe("Sverres gate 5, 5010 Bergen");
  });

  it("formats address without house number", () => {
    expect(
      formatAddress({
        street: "Kong Oscars gate",
        postalCode: "5017",
        city: "Bergen",
      }),
    ).toBe("Kong Oscars gate, 5017 Bergen");
  });

  it("formats location-only address", () => {
    expect(
      formatAddress({
        postalCode: "5017",
        city: "Bergen",
      }),
    ).toBe("5017 Bergen");
  });

  it("formats street-only address", () => {
    expect(
      formatAddress({
        street: "Gyldenprisveien",
      }),
    ).toBe("Gyldenprisveien");
  });

  it("ignores empty and whitespace-only values", () => {
    expect(
      formatAddress({
        street: "  ",
        buildingNumber: "",
        postalCode: "5006",
        city: " Bergen ",
      }),
    ).toBe("5006 Bergen");
  });
});
