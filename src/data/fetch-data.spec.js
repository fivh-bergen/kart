import { suite, test } from "node:test";
import { getFetchUrl } from "./fetch-data.js";

suite('Overpass API integration test', () => {
    test('should fetch at least one element from Overpass API', async (t) => {
        const url = await getFetchUrl();

        const response = await fetch(url);

        const json = await response.json()

        t.assert.equal(json.elements.length > 0, true);
    });
});