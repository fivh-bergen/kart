import { describe, it, expect, vi, afterEach } from "vitest";
import { getInstagramUsername } from "./instagram";

describe("getInstagramUsername", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns username for www.instagram.com profile URL", () => {
    expect(getInstagramUsername("https://www.instagram.com/johndoe/")).toBe(
      "johndoe",
    );
  });

  it("returns username for instagram.com profile URL", () => {
    expect(getInstagramUsername("https://instagram.com/janedoe")).toBe(
      "janedoe",
    );
  });

  it("returns first path segment when extra segments exist", () => {
    expect(
      getInstagramUsername("https://www.instagram.com/johndoe/reels/12345/"),
    ).toBe("johndoe");
  });

  it("returns username when query/hash are present", () => {
    expect(
      getInstagramUsername("https://www.instagram.com/johndoe/?hl=en#bio"),
    ).toBe("johndoe");
  });

  it("returns null for instagram root URL with no username", () => {
    expect(getInstagramUsername("https://www.instagram.com/")).toBeNull();
  });

  it("returns null for non-instagram hostname", () => {
    expect(getInstagramUsername("https://example.com/johndoe")).toBeNull();
  });

  it("returns null and logs error for invalid URL", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(getInstagramUsername("not-a-valid-url")).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith("Invalid URL:", "not-a-valid-url");
  });
});
