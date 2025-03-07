import { describe, it, expect } from "vitest";
import { getFetchUrl } from "../fetch-data.js";

describe("getFetchUrl function", () => {
  it("should URL read overpassQL query correctly", async () => {
    const actual = await getFetchUrl();
    expect(actual).toMatchSnapshot();
  });
});
