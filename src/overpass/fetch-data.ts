import * as fs from "fs/promises";
import * as path from "path";
import osmtogeojson from "osmtogeojson";
import { config } from "../config.local.ts";
import { getDesignations, inferCategory } from "../utils/geojson.ts";

// Overpass requires a custom User-Agent that identifies the script well, with a
// way to get in touch. Stock UAs, UA faking and UA rotation are explicitly
// banned. See https://community.openstreetmap.org/t/overpass-api-error-406/143198/4
export const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
export const OVERPASS_USER_AGENT =
  "Gjenbruksportalen-Bergen/0.0.1 (+https://github.com/fivh-bergen/kart; contact: brage@bjerk.io)";

export async function getOverpassQuery(): Promise<string> {
  const filePath = path.resolve(
    path.dirname(""),
    "./src/overpass/query.overpassql",
  );
  const data = await fs.readFile(filePath);
  const queryTemplate = Buffer.from(data).toString();
  return queryTemplate.replace("{{APP_AREA_ID}}", String(config.appAreaId));
}

export async function fetchOverpass(query: string): Promise<Response> {
  return fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: {
      "User-Agent": OVERPASS_USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ data: query }).toString(),
  });
}

async function fetchOverpassData(query: string): Promise<Response> {
  let response: Response | undefined = undefined;
  let attempts = 0;
  const maxAttempts = 5;
  const baseDelay = 5000; // 5 seconds

  while (attempts < maxAttempts) {
    response = await fetchOverpass(query);
    if (response.status === 504) {
      console.warn(
        `Received 504 from Overpass API. Attempt ${attempts + 1} of ${maxAttempts}. Retrying...`,
      );
    } else if (response.status === 429) {
      console.warn(
        `Received 429 Too Many Requests from Overpass API. Attempt ${attempts + 1} of ${maxAttempts}. Retrying...`,
      );
    } else {
      break;
    }
    attempts++;
    const delay = baseDelay * Math.pow(2, attempts - 1);
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

const query = await getOverpassQuery();
const response = await fetchOverpassData(query);

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

const features = geojson.features.map((feature) => {
  const designations = getDesignations(feature);
  const category = inferCategory(feature);

  return {
    ...feature,
    properties: {
      ...feature.properties,
      "fivh:designations": designations.join(";"),
      "fivh:category": category,
    },
  };
});

geojson.features = features;

await fs.writeFile(
  path.resolve(path.dirname(""), `./src/overpass/features.json`),
  JSON.stringify(geojson, null, 2),
);
