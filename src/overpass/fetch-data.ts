import * as fs from "fs/promises";
import * as path from "path";
import osmtogeojson from "osmtogeojson";
import { getFivhTags } from "../utils/tags.ts";

export async function getFetchUrl(): Promise<string> {
  const filePath = path.resolve(
    path.dirname(""),
    "./src/overpass/query.overpassql"
  );
  const data = await fs.readFile(filePath);
  const query = Buffer.from(data);
  const urlFormatted = new URLSearchParams();
  urlFormatted.append("data", query.toString());

  const url = new URL("api/interpreter", "https://overpass-api.de");
  return url.href + "?" + urlFormatted.toString();
}

const url = await getFetchUrl();
const response = await fetch(url);

const output = await response.json();

const geojson = osmtogeojson(output);

// procress the data here

const features = geojson.features.map((feature) => {
  const fivhTags = getFivhTags(feature);
  const kind = getKind(feature);
  return {
    ...feature,
    properties: {
      ...feature.properties,
      "fivh:tags": fivhTags.join(";"),
      "fivh:kind": kind,
    },
  };
});

geojson.features = features;

await fs.writeFile(
  path.resolve(path.dirname(""), `./public/features.json`),
  JSON.stringify(geojson, null, 2)
);

function getKind(
  feature: GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
) {
  if (!feature.properties) {
    throw new Error("Feature has no properties");
  }
  if (
    feature.properties["shop"] === "second_hand" ||
    feature.properties["second_hand"] === "yes" ||
    feature.properties["second_hand"] === "only" ||
    feature.properties["amenity"] === "give_box"
  ) {
    return "Bruktbutikk";
  } else if (
    feature.properties["repair"] === "yes" ||
    feature.properties["repair"] === "only" ||
    feature.properties["service:bicycle:repair"] === "yes" ||
    feature.properties["repair"] === "assisted_self_service" ||
    feature.properties["computer:repair"] === "yes" ||
    feature.properties["mobile_phone:repair"] === "yes" ||
    feature.properties["camera:repair"] === "yes" ||
    feature.properties["bicycle:repair"] === "yes" ||
    feature.properties["brand"] === "Repair Café" ||
    feature.properties["craft"] === "shoemaker" ||
    feature.properties["craft"] === "goldsmith" ||
    feature.properties["craft"] === "jeweller" ||
    feature.properties["craft"] === "luthier"
  ) {
    return "Reparasjon";
  } else if (
    feature.properties["amenity"] === "bicycle_rental" ||
    feature.properties["amenity"] === "boat_rental" ||
    feature.properties["amenity"] === "boat_sharing" ||
    feature.properties["amenity"] === "motorcycle_rental" ||
    feature.properties["amenity"] === "scooter_rental" ||
    feature.properties["amenity"] === "kick-scooter_rental" ||
    feature.properties["service:bicycle:rental"] === "yes" ||
    feature.properties["amenity"] === "ski_rental" ||
    feature.properties["shop"] === "rental" ||
    feature.properties["shop"] === "tool_hire" ||
    feature.properties["amenity"] === "tool_library" ||
    feature.properties["amenity"] === "toy_library"
  ) {
    return "Utlån";
  } else {
    return undefined;
  }
}
