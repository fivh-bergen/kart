import { designations } from "./designation/designation-def.ts";
import {
  designationGroups as designationGroupDefs,
  designationGroups,
  type DesignationGroup,
} from "./designation/group-def.ts";
export { designations };
import { osmKeysThatAllowMultipleValues as multiValueKeys } from "./designation/multi-value-keys.ts";

type ManagedOsmDefinition =
  (typeof designations)[number]["definitions"][number];

function getDesignationByName(designationName: string) {
  const designation = designations.find((d) => d.name === designationName);
  if (!designation) {
    throw new Error(`No designation found with name ${designationName}`);
  }

  return designation;
}

export function getDesignationLabel(designationName: string): string {
  return getDesignationByName(designationName).label;
}

export function splitTagValues(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getPrimaryDefinitionFromDesignation(
  designationName: string,
): ManagedOsmDefinition {
  const designation = getDesignationByName(designationName);

  // Return the first definition, which is assumed to be the most common/conventional one
  return designation.definitions[0];
}

export function getOsmTagsFromDesignations(
  designationNames: string[],
): Record<string, string> {
  const tags: Record<string, string> = {};

  for (const designationName of designationNames) {
    const definition = getPrimaryDefinitionFromDesignation(designationName);
    for (const { key, value } of definition) {
      if (multiValueKeys.has(key)) {
        const currentValues = splitTagValues(tags[key]);
        if (!currentValues.includes(value)) {
          tags[key] = [...currentValues, value].join(";");
        }
      } else if (tags[key]) {
        tags[key] += `;${value}`;
      } else {
        tags[key] = value;
      }
    }
  }

  return tags;
}

type KeyValuePair = { key: string; value: string };

function satisfiesDefinition(
  tags: KeyValuePair[],
  definition: ManagedOsmDefinition,
): boolean {
  return definition.every((defTag) =>
    tags.some((tag) => tag.key === defTag.key && tag.value === defTag.value),
  );
}

export function getDesignationsFromTags(tags: Record<string, any>) {
  const splitKeyValues: KeyValuePair[] = [];

  for (const [key, value] of Object.entries(tags)) {
    const values = splitTagValues(value);
    for (const val of values) {
      splitKeyValues.push({ key, value: val });
    }
  }

  return designations
    .filter(({ definitions }) =>
      definitions.some((definition) =>
        satisfiesDefinition(splitKeyValues, definition),
      ),
    )
    .map((designation) => designation.name);
}

/**
 * Finds the definition variant that actually matches the existing tags
 * for a given designation. This is important so we remove the right tags
 * when un-selecting a designation — not the primary definition tags which
 * may differ from what the node actually has.
 */
function findMatchingDefinition(
  designationName: string,
  existingTags: Record<string, unknown>,
): ManagedOsmDefinition | null {
  const designation = designations.find((d) => d.name === designationName);
  if (!designation) return null;

  const kvPairs: KeyValuePair[] = [];
  for (const [key, value] of Object.entries(existingTags)) {
    for (const val of splitTagValues(value)) {
      kvPairs.push({ key, value: val });
    }
  }

  return (
    designation.definitions.find((def) => satisfiesDefinition(kvPairs, def)) ??
    null
  );
}

/**
 * Applies only the designation changes (additions and removals) to the
 * existing tags, leaving untouched designations' tags as-is.
 *
 * This prevents the primary-definition lookup from overwriting tags that
 * already satisfy a designation via an alternative definition
 * (e.g. `second_hand=yes` being replaced by `second_hand=only`).
 */
export function applyDesignationChanges(
  existingTags: Record<string, string>,
  addedDesignationNames: string[],
  removedDesignationNames: string[],
): Record<string, string> {
  const tags = { ...existingTags };

  // Remove tags for removed designations
  for (const name of removedDesignationNames) {
    const matchingDef = findMatchingDefinition(name, existingTags);
    if (!matchingDef) continue;

    for (const { key, value } of matchingDef) {
      if (multiValueKeys.has(key)) {
        // For multi-value keys (e.g. clothes=women;children),
        // remove only the specific value from the semicolon list
        const values = splitTagValues(tags[key]);
        const filtered = values.filter((v) => v !== value);
        if (filtered.length > 0) {
          tags[key] = filtered.join(";");
        } else {
          delete tags[key];
        }
      } else {
        delete tags[key];
      }
    }
  }

  // Add tags for added designations (uses primary definition)
  for (const name of addedDesignationNames) {
    const definition = getPrimaryDefinitionFromDesignation(name);
    for (const { key, value } of definition) {
      if (multiValueKeys.has(key)) {
        const values = splitTagValues(tags[key]);
        if (!values.includes(value)) {
          tags[key] = [...values, value].join(";");
        }
      } else {
        tags[key] = value;
      }
    }
  }

  return tags;
}

/** Human-readable labels for OSM key groups shown in the UI */
export const osmKeyLabels: Record<string, string> = {
  shop: "Butikk",
  craft: "Håndverk",
  amenity: "Tjeneste",
  clothes: "Klær",
  sells: "Selger",
};

/**
 * Gets the primary OSM key that a designation's first definition sets.
 */
export function getPrimaryKey(designationName: string): string {
  const definition = getPrimaryDefinitionFromDesignation(designationName);
  return definition[0].key;
}

export function getDesignationGroup(
  designationName: string,
): DesignationGroup | undefined {
  const designation = getDesignationByName(designationName);
  if (!("group" in designation)) {
    return undefined;
  }
  return designationGroups.find((g) => g.name === designation.group);
}

/** Whether a designation may be edited by users in the edit form.
 *  Defaults to true when the `editable` flag is omitted.
 */
export function isDesignationEditable(designationName: string): boolean {
  const designation = getDesignationByName(designationName);
  return "editable" in designation ? Boolean(designation.editable) : true;
}

/**
 * Groups designations by their primary OSM key for UI rendering.
 *
 * Keys in `multiValueKeys` (e.g. `clothes`) allow multiple values and
 * should be rendered as checkboxes. All other keys are exclusive — only
 * one designation per key can be selected — and should be rendered as
 * radio buttons (with a "Ingen" / none option).
 */
export type DesignationUiGroup = {
  key: string;
  label: string;
  multiValue: boolean;
  designations: string[];
};

export function groupDesignationsByConflict(
  designationNames: string[],
): DesignationUiGroup[] {
  const groupMap = new Map<string, string[]>();
  const groupMetadata = new Map<
    string,
    { label: string; multiValue: boolean }
  >();

  for (const name of designationNames) {
    const assignedGroup = getDesignationGroup(name);

    const key = assignedGroup
      ? `group:${assignedGroup.name}`
      : getPrimaryKey(name);
    const group = groupMap.get(key) ?? [];
    group.push(name);
    groupMap.set(key, group);

    if (assignedGroup) {
      const groupDef = designationGroupDefs.find(
        (g) => g.name === assignedGroup.name,
      );
      groupMetadata.set(key, {
        label: groupDef?.label ?? assignedGroup.label,
        // respect `singleton` from the group definitions: singleton => radio (single), otherwise checkbox (multi)
        multiValue: groupDef ? !groupDef.singleton : true,
      });
      continue;
    }

    const primaryKey = getPrimaryKey(name);
    groupMetadata.set(key, {
      label: osmKeyLabels[primaryKey] ?? primaryKey,
      multiValue: multiValueKeys.has(primaryKey),
    });
  }

  return Array.from(groupMap.entries()).map(([key, dsgs]) => {
    const metadata = groupMetadata.get(key);

    return {
      key,
      label: metadata?.label ?? key,
      multiValue: metadata?.multiValue ?? false,
      designations: dsgs,
    };
  });
}
