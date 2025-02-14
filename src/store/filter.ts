import { atom } from "nanostores";

export const $activeCategories = atom<("rental" | "repair" | "second-hand")[]>([
  "rental",
  "rental",
  "second-hand",
]);

/** Toggles a single category, adding or removing it from the list of currently active categories */
export function toggleCategory(kind: "rental" | "repair" | "second-hand") {
  if ($activeCategories.get().includes(kind)) {
    const newValue = $activeCategories
      .get()
      .filter((category) => category !== kind);
    $activeCategories.set(newValue);
  } else {
    $activeCategories.set([...$activeCategories.get(), kind]);
  }
}
