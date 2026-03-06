import { writable, get } from "svelte/store";

const STORAGE_KEY = "fivh:deleted-features";

export const deletedFeatures = writable<string[]>([]);

// read once from localStorage; this module is intentionally tiny so it doesn't
// even bother with storage events or pruning.  The map simply filters IDs
// against the array whenever it renders.
export function initializeDeletedFeatures() {
  if (typeof window === "undefined") {
    return;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      deletedFeatures.set(parsed.filter((v) => typeof v === "string"));
    }
  } catch {
    // ignore malformed storage
  }
}

export function addDeletedFeature(id: string) {
  initializeDeletedFeatures();
  const previous = get(deletedFeatures);
  if (!previous.includes(id)) {
    const next = [...previous, id];
    deletedFeatures.set(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }
}
