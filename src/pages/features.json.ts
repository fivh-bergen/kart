import type { APIRoute } from "astro";
import features from "../overpass/features.json";

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(features, null, 2));
};
