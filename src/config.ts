import type { OsmOAuth2Scopes } from "osm-api/dist/src/auth/types";
import { configure } from "osm-api/dist/src/config";
import { config } from "./config.national";

interface OsmConfig {
  apiUrl: string;
  clientId: string;
  redirectUrl: string;
  scopes: OsmOAuth2Scopes[];
}

export interface Config {
  appName: string;
  appAreaName: string;
  appAreaId?: number;
  startingPosition: {
    lat: number;
    lng: number;
    zoom: number;
  };
  maxZoom?: number;
  minZoom?: number;
  style: string;
  goatCounterUrl?: string;
  osmApi: OsmConfig;
}

export function configureOsmApi() {
  configure({ apiUrl: config.osmApi.apiUrl });
}
