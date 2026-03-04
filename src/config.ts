import type {
  LoginOptions,
  OsmOAuth2Scopes,
} from "osm-api/dist/src/auth/types";
import { configure } from "osm-api";
import { config } from "./config.local";

interface OsmApiConfig {
  clientId: string;
}

export interface Config {
  appName: string;
  appAreaName: string;
  appAreaId: number;
  appUrl: string;
  startingPosition: {
    lat: number;
    lng: number;
    zoom: number;
  };
  maxZoom?: number;
  minZoom?: number;
  style: string;
  goatCounterUrl?: string;
  osmApiConfig: OsmApiConfig;
}

export function configureOsmApi() {
  configure({ apiUrl: "https://api.openstreetmap.org" });
}

export function getOsmApiLoginOptions(): LoginOptions {
  if (import.meta.env.DEV) {
    const localRedirectUrl = new URL(
      `${import.meta.env.BASE_URL}/auth`,
      window.location.origin,
    ).toString();
    return {
      mode: "popup",
      clientId: config.osmApiConfig.clientId,
      redirectUrl: localRedirectUrl,
      scopes: ["write_api"] as OsmOAuth2Scopes[],
    };
  } else {
    return {
      mode: "popup",
      clientId: config.osmApiConfig.clientId,
      redirectUrl: `${config.appUrl}/auth`,
      scopes: ["write_api"] as OsmOAuth2Scopes[],
    };
  }
}
