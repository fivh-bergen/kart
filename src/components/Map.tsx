import { useEffect, useRef, useState } from "react";
import { config } from "../config.local";
import maplibregl, { GeoJSONSource } from "maplibre-gl";
import "./Map.css";
import { useStore } from "@nanostores/react";
import {
  $showInfoPanel,
  hideInfoPanel,
  setSelectedFeatureId,
  showInfoPanel,
  startNewFeatureCreation,
} from "../store/feature";
import { panMapToShowMarker } from "../utils/pan-map";
import "maplibre-gl/dist/maplibre-gl.css";
import { setMap } from "../store/map";
import { RxCheck, RxCross2, RxPlus } from "react-icons/rx";
import {
  $ghostFeatures,
  initializeGhostFeatures,
  pruneGhostFeaturesAgainstRealData,
  toGhostFeatureCollection,
} from "../store/ghost-feature";

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const isPickingLocationRef = useRef(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const showInfoPanelState = useStore($showInfoPanel);

  useEffect(() => {
    isPickingLocationRef.current = isPickingLocation;
  }, [isPickingLocation]);

  useEffect(() => {
    if (mapContainer.current) {
      const map = new maplibregl.Map({
        container: mapContainer.current, // container id
        style: config.style, // style URL
        center: [config.startingPosition.lng, config.startingPosition.lat], // starting position [lng, lat]
        zoom: config.startingPosition.zoom, // starting zoom

        minZoom: config.minZoom || 10,
        dragRotate: false,
      });

      map.touchZoomRotate.disableRotation();
      mapRef.current = map;

      map.on("load", async () => {
        initializeGhostFeatures();

        map.addSource("features", {
          type: "geojson",
          data: "/kart/features.json",
          cluster: true,
          clusterRadius: 30,
          clusterMinPoints: 2,
          clusterMaxZoom: 19,
          maxzoom: config.maxZoom || 20,
        });

        map.addSource("ghost-features", {
          type: "geojson",
          data: toGhostFeatureCollection($ghostFeatures.get()) as any,
        });

        map.addLayer({
          id: "clusters",
          source: "features",
          type: "circle",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#FF7A00",
            "circle-opacity": 0.8,
            "circle-radius": ["step", ["get", "point_count"], 20, 4, 30, 6, 40],
          },
        });

        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "features",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-size": 24,
            "text-allow-overlap": true,
          },
          paint: {
            "text-color": "#fff",
          },
        });

        map.addLayer({
          id: "ghost-markers",
          type: "symbol",
          source: "ghost-features",
          layout: {
            "icon-image": ["get", "fivh:category"],
            "icon-overlap": "always",
            "text-allow-overlap": true,
            "text-field": ["concat", ["get", "name"], " (venter)"] as any,
            "text-variable-anchor-offset": [
              "top",
              [0, 1.5],
              "bottom",
              [0, -1.5],
              "left",
              [1.5, 0],
              "right",
              [-1.5, 0],
            ],
            "text-justify": "auto",
          },
          paint: {
            "icon-opacity": 0.45,
            "text-opacity": 0.75,
            "text-halo-color": "#fff",
            "text-halo-width": 1,
          },
        });

        const secondHandIcon = await map.loadImage("/kart/Bruktbutikk.png");
        const rentalIcon = await map.loadImage("/kart/Utlaan.png");
        const repairIcon = await map.loadImage("/kart/Reparasjon.png");
        // use internal category names as image keys
        map.addImage("reuse", secondHandIcon.data);
        map.addImage("rental", rentalIcon.data);
        map.addImage("repair", repairIcon.data);

        map.addLayer({
          id: "markers",
          type: "symbol",
          source: "features",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "icon-image": ["get", "fivh:category"],
            "icon-overlap": "always",
            "text-allow-overlap": true,
            "text-field": ["get", "name"],
            "text-variable-anchor-offset": [
              "top",
              [0, 1.5],
              "bottom",
              [0, -1.5],
              "left",
              [1.5, 0],
              "right",
              [-1.5, 0],
            ],
            "text-justify": "auto",
          },
          paint: {
            "icon-color": "#fff",
            "text-halo-color": "#fff",
            "text-halo-width": 1,
          },
        });

        const updateGhostSource = (
          ghostFeatures: typeof $ghostFeatures.value,
        ) => {
          const source = map.getSource("ghost-features") as
            | GeoJSONSource
            | undefined;
          source?.setData(toGhostFeatureCollection(ghostFeatures) as any);
        };

        const unlistenGhostFeatures = $ghostFeatures.listen(updateGhostSource);

        try {
          const response = await fetch("/kart/features.json", {
            cache: "no-store",
          });
          if (response.ok) {
            const realData = (await response.json()) as {
              features?: Array<{
                properties?: { name?: unknown };
                geometry?: { coordinates?: unknown };
              }>;
            };

            if (Array.isArray(realData.features)) {
              pruneGhostFeaturesAgainstRealData(realData.features);
            }
          }
        } catch {}

        map.on("click", "clusters", async (e) => {
          if (isPickingLocationRef.current) {
            return;
          }

          const features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          }) as any;
          const clusterId = features[0].properties.cluster_id;

          const source = map.getSource("features") as GeoJSONSource;

          if (!source) {
            return;
          }
          const zoom = await source.getClusterExpansionZoom(clusterId);
          hideInfoPanel();
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom + 1,
          });
        });

        map.on("mouseenter", "clusters", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseenter", "markers", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "clusters", () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("mouseleave", "markers", () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("click", "markers", (e) => {
          if (isPickingLocationRef.current) {
            return;
          }

          const features = e.features;
          if (features) {
            const feature = features[0] as any;
            setSelectedFeatureId(String(feature.properties.id));
            showInfoPanel();
            panMapToShowMarker(
              map,
              feature.geometry.coordinates[0],
              feature.geometry.coordinates[1],
            );
          }
        });

        map.on("remove", () => {
          unlistenGhostFeatures();
        });
        setMap(map);
      });

      return () => {
        map.remove();
        mapRef.current = null;
      };
    }

    return undefined;
  }, []);

  const handleAddShopClick = () => {
    if (!isPickingLocation) {
      hideInfoPanel();
      setIsPickingLocation(true);
      return;
    }

    const map = mapRef.current;
    if (!map) {
      return;
    }

    const center = map.getCenter();
    startNewFeatureCreation({ lat: center.lat, long: center.lng });
    setIsPickingLocation(false);
  };

  const handleCancelLocationPick = () => {
    setIsPickingLocation(false);
  };

  return (
    <>
      <div className="map" ref={mapContainer}></div>

      {isPickingLocation && (
        <div className="map-center-target" aria-hidden>
          <div className="map-center-target-pin" />
        </div>
      )}

      {!showInfoPanelState && (
        <div className="map-fab-stack">
          {isPickingLocation && (
            <button
              type="button"
              className="map-fab-cancel"
              aria-label="Avbryt plassering"
              onClick={handleCancelLocationPick}
            >
              <RxCross2 size="1.5rem" />
            </button>
          )}
          <button
            type="button"
            className="map-fab"
            aria-label={
              isPickingLocation ? "Bekreft plassering" : "Legg til ny butikk"
            }
            onClick={handleAddShopClick}
          >
            {isPickingLocation ? (
              <RxCheck size="1.5rem" />
            ) : (
              <RxPlus size="1.5rem" />
            )}
          </button>
        </div>
      )}
    </>
  );
};
