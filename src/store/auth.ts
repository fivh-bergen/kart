import { atom } from "nanostores";
import { authReady, isLoggedIn } from "osm-api";
import { configureOsmApi } from "../config";

export const $isOsmLoggedIn = atom(false);

let isInitialized = false;

export async function syncOsmAuthState() {
  configureOsmApi();
  await authReady;
  $isOsmLoggedIn.set(isLoggedIn());
}

export function initializeOsmAuthStore() {
  if (isInitialized || typeof window === "undefined") {
    return;
  }

  isInitialized = true;
  void syncOsmAuthState();

  const authChannel = new BroadcastChannel("osm-api-auth-complete");
  authChannel.addEventListener("message", () => {
    void syncOsmAuthState();
  });

  window.addEventListener("focus", () => {
    void syncOsmAuthState();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void syncOsmAuthState();
    }
  });
}