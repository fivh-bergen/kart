import { useEffect, useRef } from "react";
import { config } from "../config";
import maplibregl, { GeoJSONSource } from "maplibre-gl";
import "./Map.css";
import {
  hideInfoPanel,
  setSelectedFeatureId,
  showInfoPanel,
} from "../store/feature";
import { panMapToShowMarker } from "../utils/pan-map";
import "maplibre-gl/dist/maplibre-gl.css";
import { setMap } from "../store/map";

export const Map = () => {
  const mapContainer = useRef(null);

  useEffect(() => {
    if (mapContainer.current) {
      const map = new maplibregl.Map({
        container: mapContainer.current, // container id
        style: config.style, // style URL
        center: [config.startingPosition.lng, config.startingPosition.lat], // starting position [lng, lat]
        zoom: config.startingPosition.zoom, // starting zoom
        maxBounds: config.maxBounds,
        minZoom: 10,
        dragRotate: false,
      });

      map.touchZoomRotate.disableRotation();

      map.on("load", async () => {
        map.addSource("features", {
          type: "geojson",
          data: "/kart/features.json",
          cluster: true,
          clusterRadius: 30,
          clusterMinPoints: 2,
          clusterMaxZoom: 19,
          maxzoom: 20,
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

        map.on("click", "clusters", async (e) => {
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
        setMap(map);
      });
    }
  }, [mapContainer.current]);

  return <div className="map" ref={mapContainer}></div>;
};
