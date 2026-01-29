#!/usr/bin/env ts-node
import fs from "fs/promises";
import path from "path";
import { reverseGeocode } from "../src/utils/reverseGeocode.ts";

async function main() {
  const repoRoot = path.resolve(process.cwd());
  const featuresPath = path.resolve(repoRoot, "src/overpass/features.json");
  const outJson = path.resolve(repoRoot, "src/overpass/address-cache.json");

  const raw = await fs.readFile(featuresPath, "utf-8");
  const geojson = JSON.parse(raw);
  const features = geojson.features || [];

  const map: Record<string, any> = {};

  const limit = process.env.PREFETCH_LIMIT ? Number(process.env.PREFETCH_LIMIT) : undefined;
  let processed = 0;
  for (const feat of features) {
    if (limit && processed >= limit) break;
    const id = feat.id;
    if (!id) continue;
    const props = feat.properties || {};

    // Prefer existing addr:* in OSM
    const osmStreet = props["addr:street"];
    const osmHousenumber = props["addr:housenumber"];
    const osmPostcode = props["addr:postcode"];
    const osmCity = props["addr:city"];

    if (osmStreet || osmHousenumber || osmPostcode || osmCity) {
      map[id] = { street: osmStreet, housenumber: osmHousenumber, postcode: osmPostcode, city: osmCity, source: "osm" };
      continue;
    }

    const coords = feat.geometry && feat.geometry.coordinates;
    if (!coords || coords.length < 2) continue;
    const lon = coords[0];
    const lat = coords[1];

    // Reverse geocode (throttle lightly)
    console.log(`Reverse geocoding ${id} (${lat},${lon})`);
    // Nominatim recommends 1s between requests for public instance
    const addr = await reverseGeocode(lat, lon, { delayMs: 1100 });
    if (addr) {
      map[id] = { street: addr.street, housenumber: addr.housenumber, postcode: addr.postcode, city: addr.city, source: addr.source };
    }
    processed++;
  }

  await fs.writeFile(outJson, JSON.stringify(map, null, 2), "utf-8");
  console.log(`Wrote ${Object.keys(map).length} entries to ${outJson}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
