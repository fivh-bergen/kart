export const categories = [
  { name: "reuse", label: "Gjenbruk" },
  { name: "rental", label: "Utlån" },
  { name: "repair", label: "Reparasjon" },
] as const;

export type Category = (typeof categories)[number];
