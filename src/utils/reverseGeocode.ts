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
  "fivh-bergen/kart - reverseGeocode (https://github.com/fivh-bergen/kart)";

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function reverseGeocode(
  lat: number,
  lon: number,
  opts?: { delayMs?: number },
): Promise<Address | null> {
  if (opts?.delayMs) {
    await delay(opts.delayMs);
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${encodeURIComponent(roundCoord(lat))}&lon=${encodeURIComponent(roundCoord(lon))}`;

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
