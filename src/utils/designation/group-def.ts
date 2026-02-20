export type DesignationGroup = {
  name: string;
  /** Human readable label for the designation group */
  label: string;
  /** If true, only one designation from this group should be assigned to a feature. */
  singleton: boolean;
};

export const designationGroups: DesignationGroup[] = [
  { name: "sells", label: "Selger", singleton: false },
  { name: "repairs", label: "Reparerer", singleton: false },
  { name: "rents", label: "Leier/låner ut", singleton: false },
  { name: "renter", label: "Utleiested", singleton: true },
  { name: "repairer", label: "Reparasjonssted", singleton: true },
  { name: "shop", label: "Butikk", singleton: true },
] as const;
