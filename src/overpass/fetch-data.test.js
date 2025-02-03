import { suite, test } from "node:test";
import { getFetchUrl } from "./fetch-data.js";

suite("getFetchUrl function", () => {
  test("should URL read overpassQL query correctly", async (t) => {
    const actual = await getFetchUrl();
    t.assert.snapshot(actual);
  });
});
