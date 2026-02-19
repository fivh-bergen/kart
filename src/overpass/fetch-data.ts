import * as fs from "fs/promises";
import * as path from "path";
import osmtogeojson from "osmtogeojson";
import { getFivhTags } from "../utils/osm-tag-helpers";

export async function getFetchUrl(): Promise<string> {
  const filePath = path.resolve(
    path.dirname(""),
    "./src/overpass/query.overpassql",
  );
  const data = await fs.readFile(filePath);
  const query = Buffer.from(data);
  const urlFormatted = new URLSearchParams();
  urlFormatted.append("data", query.toString());

  const url = new URL("api/interpreter", "https://overpass-api.de");
  return url.href + "?" + urlFormatted.toString();
}

async function fetchOverpassData(url: string): Promise<Response> {
  let response: Response | undefined = undefined;
  let attempts = 0;
  const maxAttempts = 5;
  const baseDelay = 5000; // 5 seconds

  while (attempts < maxAttempts) {
    response = await fetch(url);
    if (response.status !== 504) {
      break;
    }
    attempts++;
    const delay = baseDelay * Math.pow(2, attempts - 1);
    console.warn(
      `Received 504 from Overpass API. Retrying in ${delay}ms (attempt ${attempts}/${maxAttempts})...`,
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (!response || response.status === 504) {
    throw new Error(
      "Overpass API returned 504 Gateway Timeout after multiple attempts.",
    );
  }
  if (attempts > 0) {
    console.log(
      `Received ${response.status} from Overpass API after ${attempts} retries.`,
    );
  }
  return response;
}

const url = await getFetchUrl();
const response = await fetchOverpassData(url);

const contentType = response.headers.get("content-type") || "";
let output;
if (contentType.includes("application/json")) {
  output = await response.json();
} else {
  // Try to read as text and log the error
  const text = await response.text();
  if (text.trim().startsWith("<")) {
    console.log(response.status);
    console.error("Overpass API returned XML error:", text);
    throw new Error("Overpass API returned XML error. See logs for details.");
  } else {
    console.error("Unexpected response from Overpass API:", text);
    throw new Error(
      "Unexpected response from Overpass API. See logs for details.",
    );
  }
}

const geojson = osmtogeojson(output);

// process the data here

const features = geojson.features.map((feature) => {
  const fivhTags = getFivhTags(feature);
  const category = getCategory(feature);
  return {
    ...feature,
    properties: {
      ...feature.properties,
      "fivh:tags": fivhTags.join(";"),
      "fivh:category": category,
    },
  };
});

geojson.features = features;

await fs.writeFile(
  path.resolve(path.dirname(""), `./src/overpass/features.json`),
  JSON.stringify(geojson, null, 2),
);

function getCategory(
  feature: GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>,
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
    return "Gjenbruk";
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
    return "Gjenbruk";
  }
}
