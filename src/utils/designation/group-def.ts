export type DesignationGroup = {
  name: string;
  /** Human readable label for the designation group */
  label: string;
  /** If true, only one designation from this group should be assigned to a feature. */
  singleton: boolean;
  /** Order for sorting the designation groups */
  order: number;
};

export const designationGroups: DesignationGroup[] = [
  { name: "shop", label: "Butikktype", singleton: true, order: 1 },
  { name: "renter", label: "Type Utleiested", singleton: true, order: 2 },
  {
    name: "repairer",
    label: "Type reparasjonssted",
    singleton: true,
    order: 3,
  },
  { name: "rents", label: "Leier/låner ut", singleton: false, order: 4 },
  { name: "sells", label: "Selger", singleton: false, order: 5 },
  { name: "repairs", label: "Reparerer", singleton: false, order: 6 },
] as const;
