import { tags } from "./tags.ts";
import { markdownTable } from "markdown-table";
import path from "path";
import * as fs from "fs/promises";

const table = markdownTable([
  ["Our tag", "Corresponding OSM tag(s)"],
  ...tags.map((tag) => [
    tag.name,
    tag.definitions
      .map((def) => def.map((d) => `${d.key}=${d.value}`).join(" and "))
      .join(" or "),
  ]),
]);

const text = `# Tags

> This file is generated from source code. Do not edit it directly.

  This is a list of tags that are used to provide information about the features in the map. 
  We don't mean to cover every possible tag in OpenStreetMap since there are [a lot of them](https://wiki.openstreetmap.org/wiki/Tags), but we try tro cover some useful basics. 
  
  Some of our tags correspond to multiple different tags in OSM, 
  since there are often many different ways to tag things in OSM.
  
`;

const text2 = `
## Adding new tags
Expanding this list is quite straightforward, 
  just add a new tag to the \`tags\` array in [src/utils/tags.ts](../utils/tags.ts) and run \`pnpm fetch-nodes\` to update the GeoJSON data and \`pnpm generate\` to update this table.`;
await fs.writeFile(
  path.resolve(path.dirname(""), `./docs/tags.md`),
  text + table + text2,
);
