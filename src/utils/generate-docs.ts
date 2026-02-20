import { markdownTable } from "markdown-table";
import path from "path";
import * as fs from "fs/promises";
import { designations } from "./designation.ts";

const table = markdownTable([
  ["Our designation", "Corresponding OSM tag(s)"],
  ...designations.map((designation) => [
    designation.label,
    designation.definitions
      .map(
        (def) =>
          "(" + def.map((d) => `${d.key}=${d.value}`).join(" and ") + ")",
      )
      .join(" or "),
  ]),
]);

const text = `# Tags

> This file is generated from source code. Do not edit it directly.


In this project, we want to visualise data from OSM in a user friendly way.
OpenStreetMap data is tagged with key-value pairs, but there are often many different ways to tag the same thing,
 and the tag data itself is not very pleasing to the eye.

An example would be the tag *clothes=women*, which is not very appealing to read and is not localised.
Therefore, we want to show this as "Kvinneklær" instead, which is more user friendly.
We call this a *designation*.
Since there are often many different ways to tag the same thing in OSM,
we need to map multiple different OSM tags to the same designation.
Therefore we have multiple definitions that satisfy a single designation.
A definition can consist of multiple tags, such as *shop=bicycle* **AND** *repair=yes*,
which together indicate that this is a place that repairs bicycles.

This is a list of designations that are used in the map. 
We don't mean to cover every possible tag in OpenStreetMap since there are [a lot of them](https://wiki.openstreetmap.org/wiki/Tags), 
but we try to cover some useful basics. 
  
Some of our tags correspond to multiple different tags in OSM, 
since there are often many different ways to tag things in OSM.
  
`;

const text2 = `
## Adding new designations
Expanding this list is quite straightforward, 
  just add a new designation to the \`designations\` array in [src/utils/designation.ts](../src/utils/designation.ts) and run \`pnpm fetch-nodes\` to update the GeoJSON data and \`pnpm generate\` to update this table.`;
await fs.writeFile(
  path.resolve(path.dirname(""), `./docs/tags.md`),
  text + table + text2,
);
