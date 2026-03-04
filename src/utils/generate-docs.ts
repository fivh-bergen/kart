import { markdownTable } from "markdown-table";
import path from "path";
import * as fs from "fs/promises";
import { designations } from "./designation.ts";

const projectUrl = "https://fivh-bergen.github.io/kart/";

function createDesignationAction(designation: (typeof designations)[number]) {
  switch (designation.group) {
    case "shop":
      return "Labels a shop as";
    case "repairer":
      return "Labels a repair place as";
    case "rental":
      return "Labels a rental place as";
    case "sells":
      return "Indicates that a second hand shop sells";
    case "repairs":
      return "Indicates that a repair place repairs";
    case "rents":
      return "Indicates that a rental place rents";
    default:
      return "Indicates that a node is a";
  }
}

function createDesignationDescription(
  designation: (typeof designations)[number],
) {
  const action = createDesignationAction(designation);
  return `${action} '${designation.label}'.`;
}

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
            description: createDesignationDescription(designation),
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
