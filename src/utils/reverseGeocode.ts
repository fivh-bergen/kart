import fs from "fs/promises";
import path from "path";

type Address = {
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  source?: string;
};

const CACHE_FILE = path.resolve(process.cwd(), "kart/src/overpass/address-cache.json");

let cache: Record<string, Address> | null = null;

async function loadCache() {
  if (cache !== null) return cache;
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    cache = JSON.parse(raw);
  } catch (err) {
    cache = {};
  }
  return cache;
}

async function saveCache() {
  if (cache === null) return;
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.warn("Failed to save address cache", err);
  }
}

function roundCoord(n: number) {
  return Number(n.toFixed(6));
}

export async function reverseGeocode(lat: number, lon: number, opts?: { delayMs?: number }): Promise<Address | null> {
  const delayMs = opts?.delayMs ?? 1100;

  const key = `${roundCoord(lat)},${roundCoord(lon)}`;
  const c = await loadCache();
  if (c[key]) return c[key];

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;

  await new Promise((r) => setTimeout(r, delayMs));

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "fivh-bergen/kart - reverseGeocode (https://github.com/fivh-bergen/kart)",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn("reverseGeocode: non-ok response", res.status);
      return null;
    }

    const data = await res.json();
    const addr = data?.address;
    if (!addr) return null;

    const out: Address = {
      street: addr.road || addr.street || addr.pedestrian || addr.cycleway || addr.footway,
      housenumber: addr.house_number,
      postcode: addr.postcode,
      city: addr.city || addr.town || addr.village || addr.hamlet || addr.county,
      source: "nominatim",
    };

    c[key] = out;
    await saveCache();

    return out;
  } catch (err) {
    console.warn("reverseGeocode: error", err);
    return null;
  }
}

export type { Address };
