#!/usr/bin/env ts-node
import fs from "fs/promises";
import path from "path";
import Database from "better-sqlite3";
import { reverseGeocode } from "../src/utils/reverseGeocode";

type Feature = any;

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const featuresPath = path.resolve(repoRoot, "src/overpass/features.json");
  const dbDir = path.resolve(repoRoot, "data");
  const dbPath = path.join(dbDir, "address-cache.db");
  const outJson = path.resolve(repoRoot, "src/overpass/address-cache.json");

  await fs.mkdir(dbDir, { recursive: true });

  const raw = await fs.readFile(featuresPath, "utf-8");
  const geojson = JSON.parse(raw);
  const features: Feature[] = geojson.features || [];

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.prepare(
    `CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      lat REAL,
      lon REAL,
      street TEXT,
      housenumber TEXT,
      postcode TEXT,
      city TEXT,
      source TEXT,
      raw TEXT,
      updated_at INTEGER
    )`
  ).run();

  const insert = db.prepare(
    `INSERT OR REPLACE INTO addresses (id, lat, lon, street, housenumber, postcode, city, source, raw, updated_at)
     VALUES (@id,@lat,@lon,@street,@housenumber,@postcode,@city,@source,@raw,@updated_at)`
  );

  let geocoded = 0;
  let skipped = 0;

  for (const feat of features) {
    const id = feat.id;
    if (!id) continue;
    const coords = feat.geometry && feat.geometry.coordinates;
    if (!coords || coords.length < 2) continue;
    const lon = coords[0];
    const lat = coords[1];

    // If OSM already has addr:* on the feature, prefer that and store as source=osm
    const props = feat.properties || {};
    const osmStreet = props["addr:street"];
    const osmHousenumber = props["addr:housenumber"];
    const osmPostcode = props["addr:postcode"];
    const osmCity = props["addr:city"];

    const existing = db.prepare("SELECT id FROM addresses WHERE id = ?").get(id);
    if (existing) {
      skipped++;
      continue;
    }

    if (osmStreet || osmHousenumber || osmPostcode || osmCity) {
      insert.run({
        id,
        lat,
        lon,
        street: osmStreet || null,
        housenumber: osmHousenumber || null,
        postcode: osmPostcode || null,
        city: osmCity || null,
        source: "osm",
        raw: JSON.stringify({ from: "osm_properties" }),
        updated_at: Date.now(),
      });
      geocoded++;
      continue;
    }

    // No existing cached row and no addr in OSM -> call reverse geocode
    console.log(`Geocoding ${id} @ ${lat},${lon}`);
    try {
      const addr = await reverseGeocode(lat, lon, { delayMs: 1100 });
      if (addr) {
        insert.run({
          id,
          lat,
          lon,
          street: addr.street || null,
          housenumber: addr.housenumber || null,
          postcode: addr.postcode || null,
          city: addr.city || null,
          source: addr.source || "remote",
          raw: JSON.stringify(addr),
          updated_at: Date.now(),
        });
        geocoded++;
      } else {
        // Insert empty marker to avoid retrying repeatedly
        insert.run({
          id,
          lat,
          lon,
          street: null,
          housenumber: null,
          postcode: null,
          city: null,
          source: "none",
          raw: JSON.stringify({}),
          updated_at: Date.now(),
        });
      }
    } catch (err) {
      console.warn("Error geocoding", id, err);
    }
  }

  // Export to JSON file for the client to consume (browser cannot read sqlite)
  const rows = db.prepare("SELECT id, street, housenumber, postcode, city, source FROM addresses").all();
  const map: Record<string, any> = {};
  for (const r of rows) {
    map[r.id] = {
      street: r.street,
      housenumber: r.housenumber,
      postcode: r.postcode,
      city: r.city,
      source: r.source,
    };
  }
  await fs.writeFile(outJson, JSON.stringify(map, null, 2), "utf-8");

  console.log(`Done. Geocoded: ${geocoded}, Skipped(existing): ${skipped}, DB: ${dbPath}, JSON: ${outJson}`);
  db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
