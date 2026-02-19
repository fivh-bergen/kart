#!/usr/bin/env ts-node
import fs from "fs/promises";
import path from "path";
import { reverseGeocode } from "../src/utils/reverseGeocode.ts";
import type { Address } from "../src/utils/reverseGeocode.ts";

const REPO_ROOT = path.resolve(process.cwd());
const FEATURES_PATH = path.join(REPO_ROOT, "src/overpass/features.json");
const CACHE_PATH = path.join(REPO_ROOT, "src/overpass/address-cache.json");

async function loadExistingCache(): Promise<Record<string, Address>> {
  try {
    const raw = await fs.readFile(CACHE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function extractOsmAddress(
  props: Record<string, unknown>,
): Address | undefined {
  const street = props["addr:street"] as string | undefined;
  const housenumber = props["addr:housenumber"] as string | undefined;
  const postcode = props["addr:postcode"] as string | undefined;
  const city = props["addr:city"] as string | undefined;

  if (street || housenumber || postcode || city) {
    return { street, housenumber, postcode, city, source: "osm" };
  }
  return undefined;
}

async function main() {
  const raw = await fs.readFile(FEATURES_PATH, "utf-8");
  const geojson = JSON.parse(raw);
  const features: Array<{
    id?: string;
    properties?: Record<string, unknown>;
    geometry?: { coordinates?: number[] };
  }> = geojson.features ?? [];

  const cache = await loadExistingCache();
  const limit = process.env.PREFETCH_LIMIT
    ? Number(process.env.PREFETCH_LIMIT)
    : undefined;
  let geocoded = 0;

  for (const feat of features) {
    const id = feat.id;
    if (!id) continue;

    const props = feat.properties ?? {};
    const osmAddr = extractOsmAddress(props);
    if (osmAddr) {
      cache[id] = osmAddr;
      continue;
    }

    if (cache[id]) continue; // already cached from a previous run
    if (limit && geocoded >= limit) break;

    const coords = feat.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;
    const [lon, lat] = coords;

    console.log(`Reverse geocoding ${id} (${lat}, ${lon})`);
    const addr = await reverseGeocode(lat, lon, { delayMs: 1100 });
    if (addr) {
      cache[id] = addr;
    }
    geocoded++;
  }

  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
  console.log(`Wrote ${Object.keys(cache).length} entries to ${CACHE_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
