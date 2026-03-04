import { markdownTable } from "markdown-table";
import path from "path";
import * as fs from "fs/promises";
import { designations } from "./designation.ts";

const projectUrl = "https://fivh-bergen.github.io/kart/";

const uniqueTags = [
  ...new Map(
    designations.flatMap((designation) =>
      designation.definitions.flatMap((def) =>
        def.map((tag) => [
          `${tag.key}=${tag.value}`,
          {
            key: tag.key,
            value: tag.value,
            object_types: ["node"] as ("node" | "way" | "area" | "relation")[],
            description: designation.name,
          },
        ]),
      ),
    ),
  ).values(),
];

const taginfo = {
  data_format: 1,
  data_url: `${projectUrl}taginfo.json`,
  project: {
    name: "FIVH Bergen gjenbruksportal",
    description:
      "A map designed to help people find ways to reuse and repair in Bergen, Norway.",
    project_url: projectUrl,
    icon_url: `${projectUrl}512.png`,
    contact_name: "FIVH Bergen",
  },
  tags: uniqueTags,
};

await fs.writeFile(
  path.resolve(path.dirname(""), `./public/taginfo.json`),
  JSON.stringify(taginfo, null, 2) + "\n",
);
