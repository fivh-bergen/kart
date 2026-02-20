import type maplibregl from "maplibre-gl";

/** Pans the camera (if necessary) so that the marker is not behind the info panel.
 * Assumes that the panel is on the right side of the map at desktop size, and is 30% of the map width.
 * Assumes that the panel is on the bottom of the map at mobile size, and is 50% of the map height.
 */
export function panMapToShowMarker(
  map: maplibregl.Map,
  markerLng: number,
  markerLat: number,
): void {
  const mapWidth = map.getContainer().clientWidth;
  const mapHeight = map.getContainer().clientHeight;

  const bottomPanelHeight = (mapHeight + 80) / 2;
  const sidePanelWidth = mapWidth * 0.3;

  const markerPosition = map.project([markerLng, markerLat]);

  const markerBehindSidePanel = markerPosition.x > mapWidth - sidePanelWidth;
  const shouldReduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const panOptions = shouldReduceMotion ? { duration: 0 } : undefined;

  const panelIsOnTheBottom = window.innerWidth <= 768;
  if (panelIsOnTheBottom) {
    const markerIsBehindBottomPanel =
      markerPosition.y > mapHeight - bottomPanelHeight;
    if (markerIsBehindBottomPanel) {
      map.panBy(
        [0, -((mapHeight - bottomPanelHeight) / 2 - markerPosition.y)],
        panOptions,
      );
    }
  } else if (markerBehindSidePanel) {
    map.panBy([-((mapWidth - sidePanelWidth) / 2 - markerPosition.x), 0], panOptions);
  }
}
