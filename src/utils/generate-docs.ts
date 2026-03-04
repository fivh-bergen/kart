import path from "path";
import * as fs from "fs/promises";
import { designations } from "./designation.ts";
import { format } from "date-fns";
import { config } from "../config.local.ts";

const projectUrl = config.appUrl;

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
  requiredTags: { key: string; value: string }[] = [],
) {
  const action = createDesignationAction(designation);
  if (requiredTags.length === 0) {
    return `${action} '${designation.label}'.`;
  }

  const requiredTagList = requiredTags.map((tag) => `${tag.key}=${tag.value}`);

  const formattedRequiredTagList =
    requiredTagList.length === 1
      ? requiredTagList[0]
      : requiredTagList.length === 2
        ? `${requiredTagList[0]} and ${requiredTagList[1]}`
        : `${requiredTagList.slice(0, -1).join(", ")}, and ${requiredTagList.at(-1)}`;

  return `${action} '${designation.label}' (when combined with ${formattedRequiredTagList}).`;
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
            description: createDesignationDescription(
              designation,
              def.filter(
                (requiredTag) =>
                  requiredTag.key !== tag.key ||
                  requiredTag.value !== tag.value,
              ),
            ),
          },
        ]),
      ),
    ),
  ).values(),
];

const taginfo = {
  data_format: 1,
  data_url: `${projectUrl}/taginfo.json`,
  data_updated: format(new Date(), "yyyyMMdd'T'HHmmss'Z'"),
  project: {
    name: "Gjenbruksportalen",
    description:
      "A map designed to help people find ways to reuse and repair in Bergen, Norway.",
    project_url: "https://github.com/fivh-bergen/kart",
    doc_url: `${projectUrl}/tags`,
    icon_url: `${projectUrl}/192.png`,
    contact_name: "FIVH Bergen",
    contact_email: "bergen@framtiden.no",
  },
  tags: uniqueTags,
};

await fs.writeFile(
  path.resolve(path.dirname(""), `./public/taginfo.json`),
  JSON.stringify(taginfo, null, 2) + "\n",
);
