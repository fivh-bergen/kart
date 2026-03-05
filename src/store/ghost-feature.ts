import { writable, get } from "svelte/store";
import { features as bundledFeatures } from "../overpass/features.json";
import type { CategoryName } from "../utils/category";

const STORAGE_KEY = "fivh:ghost-features";
const MAX_GHOST_AGE_MS = 2 * 60 * 60 * 1000;
const COORDINATE_MATCH_THRESHOLD = 0.0003;

export type GhostFeature = {
  id: string;
  name: string;
  category: CategoryName;
  lat: number;
  long: number;
  createdAt: string;
};

type RealFeature = {
  properties?: {
    name?: unknown;
  };
  geometry?: {
    type?: unknown;
    coordinates?: unknown;
  };
};

export const ghostFeatures = writable<GhostFeature[]>([]);

let isInitialized = false;
let isStorageListenerAttached = false;

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase("nb-NO");
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isGhostFeature(value: unknown): value is GhostFeature {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GhostFeature>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.category === "string" &&
    isNumber(candidate.lat) &&
    isNumber(candidate.long) &&
    typeof candidate.createdAt === "string"
  );
}

function readStoredGhostFeatures(): GhostFeature[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isGhostFeature);
  } catch {
    return [];
  }
}

function writeStoredGhostFeatures(ghostFeatures: GhostFeature[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ghostFeatures));
}

function extractComparableRealFeatures(realFeatures: RealFeature[]) {
  return realFeatures
    .map((feature) => {
      const rawCoordinates = feature.geometry?.coordinates;
      const name = feature.properties?.name;

      if (!Array.isArray(rawCoordinates) || rawCoordinates.length < 2) {
        return null;
      }

      const [long, lat] = rawCoordinates;
      if (
        !isNumber(long) ||
        !isNumber(lat) ||
        typeof name !== "string" ||
        !name.trim()
      ) {
        return null;
      }

      return {
        normalizedName: normalizeName(name),
        lat,
        long,
      };
    })
    .filter(
      (entry): entry is { normalizedName: string; lat: number; long: number } =>
        Boolean(entry),
    );
}

function sanitizeGhostFeatures(
  ghostFeatures: GhostFeature[],
  realFeatures: RealFeature[],
) {
  const comparableRealFeatures = extractComparableRealFeatures(realFeatures);
  const now = Date.now();

  return ghostFeatures.filter((ghostFeature) => {
    const createdAt = Date.parse(ghostFeature.createdAt);
    if (!Number.isFinite(createdAt)) {
      return false;
    }

    if (now - createdAt > MAX_GHOST_AGE_MS) {
      return false;
    }

    const normalizedGhostName = normalizeName(ghostFeature.name);

    const hasMatchingFeature = comparableRealFeatures.some((feature) => {
      if (feature.normalizedName !== normalizedGhostName) {
        return false;
      }

      return (
        Math.abs(feature.lat - ghostFeature.lat) <=
          COORDINATE_MATCH_THRESHOLD &&
        Math.abs(feature.long - ghostFeature.long) <= COORDINATE_MATCH_THRESHOLD
      );
    });

    return !hasMatchingFeature;
  });
}

function setAndPersistGhostFeatures(newGhostFeatures: GhostFeature[]) {
  ghostFeatures.set(newGhostFeatures);
  writeStoredGhostFeatures(newGhostFeatures);
}

function getBundledRealFeatures(): RealFeature[] {
  return bundledFeatures as unknown as RealFeature[];
}

export function initializeGhostFeatures() {
  if (typeof window === "undefined") {
    return;
  }

  if (!isInitialized) {
    const sanitizedGhosts = sanitizeGhostFeatures(
      readStoredGhostFeatures(),
      getBundledRealFeatures(),
    );
    setAndPersistGhostFeatures(sanitizedGhosts);
    isInitialized = true;
  }

  if (!isStorageListenerAttached) {
    window.addEventListener("storage", (event) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      const sanitizedGhosts = sanitizeGhostFeatures(
        readStoredGhostFeatures(),
        getBundledRealFeatures(),
      );
      ghostFeatures.set(sanitizedGhosts);
    });

    isStorageListenerAttached = true;
  }
}

export function addGhostFeature(
  ghostFeature: Omit<GhostFeature, "id" | "createdAt">,
) {
  initializeGhostFeatures();

  const nextGhostFeatures = sanitizeGhostFeatures(
    [
      {
        ...ghostFeature,
        id: `ghost-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
      },
      ...get(ghostFeatures),
    ],
    getBundledRealFeatures(),
  );

  setAndPersistGhostFeatures(nextGhostFeatures);
}

export function pruneGhostFeaturesAgainstRealData(realFeatures: RealFeature[]) {
  initializeGhostFeatures();

  const nextGhostFeatures = sanitizeGhostFeatures(
    get(ghostFeatures),
    realFeatures,
  );
  setAndPersistGhostFeatures(nextGhostFeatures);
}

export function toGhostFeatureCollection(ghostFeatures: GhostFeature[]) {
  return {
    type: "FeatureCollection",
    features: ghostFeatures.map((ghostFeature) => ({
      type: "Feature",
      id: ghostFeature.id,
      properties: {
        id: ghostFeature.id,
        name: ghostFeature.name,
        "fivh:category": ghostFeature.category,
        ghost: true,
        createdAt: ghostFeature.createdAt,
      },
      geometry: {
        type: "Point",
        coordinates: [ghostFeature.long, ghostFeature.lat],
      },
    })),
  };
}
