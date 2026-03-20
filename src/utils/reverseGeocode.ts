type Address = {
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  source?: string;
};

function roundCoord(n: number): string {
  return n.toFixed(6);
}

const USER_AGENT =
  "fivh-bergen/kart - addressLookup (https://github.com/fivh-bergen/kart)";

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Convert Overpass ID format (e.g., "node/123456") to Nominatim lookup format (e.g., "N123456")
 */
function convertOsmIdToLookupFormat(osmId: string): string | null {
  const match = osmId.match(/^(node|way|relation)\/(\d+)$/);
  if (!match) return null;

  const typeMap: Record<string, string> = {
    node: "N",
    way: "W",
    relation: "R",
  };
  const osmType = typeMap[match[1]];
  const osmNumber = match[2];

  return `${osmType}${osmNumber}`;
}

/**
 * Look up address using Nominatim lookup endpoint with OSM ID
 */
export async function lookupAddress(
  osmId: string,
  opts?: { delayMs?: number },
): Promise<Address | null> {
  if (opts?.delayMs) {
    await delay(opts.delayMs);
  }

  const lookupId = convertOsmIdToLookupFormat(osmId);
  if (!lookupId) {
    console.warn(`lookupAddress: invalid OSM ID format: ${osmId}`);
    return null;
  }

  const url = `https://nominatim.openstreetmap.org/lookup?osm_ids=${encodeURIComponent(lookupId)}&format=jsonv2&addressdetails=1`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn("lookupAddress: non-ok response", res.status);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const place = data[0];
    const addr = place?.address;
    if (!addr) return null;

    return {
      street:
        addr.road ||
        addr.street ||
        addr.pedestrian ||
        addr.cycleway ||
        addr.footway,
      housenumber: addr.house_number,
      postcode: addr.postcode,
      city:
        addr.city || addr.town || addr.village || addr.hamlet || addr.county,
      source: "nominatim",
    };
  } catch (err) {
    console.warn("lookupAddress: error", err);
    return null;
  }
}

/**
 * Reverse geocode using coordinates (deprecated, use lookupAddress with OSM ID instead)
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
  opts?: { delayMs?: number },
): Promise<Address | null> {
  if (opts?.delayMs) {
    await delay(opts.delayMs);
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=30&lat=${encodeURIComponent(roundCoord(lat))}&lon=${encodeURIComponent(roundCoord(lon))}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
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

    return {
      street:
        addr.road ||
        addr.street ||
        addr.pedestrian ||
        addr.cycleway ||
        addr.footway,
      housenumber: addr.house_number,
      postcode: addr.postcode,
      city:
        addr.city || addr.town || addr.village || addr.hamlet || addr.county,
      source: "nominatim",
    };
  } catch (err) {
    console.warn("reverseGeocode: error", err);
    return null;
  }
}

export type { Address };
