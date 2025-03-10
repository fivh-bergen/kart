import { useEffect, useRef } from "react";
import { config } from "../config";
import maplibregl from "maplibre-gl";
import { $map, setMap } from "../store/map";
import { useStore } from "@nanostores/react";
import "./Map.css";
import { features } from "../overpass/features";
import { setFeature, showInfoPanel } from "../store/feature";
import { panMapToShowMarker } from "../utils/pan-map";
import { makeMarkerElement } from "./marker";

export const Map = () => {
  const mapContainer = useRef(null);
  const map = useStore($map);

  useEffect(() => {
    if (mapContainer.current && !map) {
      const map = new maplibregl.Map({
        container: mapContainer.current, // container id
        style: config.style, // style URL
        center: [config.startingPosition.lng, config.startingPosition.lat], // starting position [lng, lat]
        zoom: config.startingPosition.zoom, // starting zoom
        maxBounds: config.maxBounds,
        maxZoom: 20,
        minZoom: 10,
      });

      setMap(map);

      map.dragRotate.disable();

      map.on("zoom", (e) => {
        if (e.target.getZoom() < 14) {
          // show marker labels only when sufficiently zoomed in
          document.documentElement.style.setProperty(`--display-label`, "none");
        } else {
          document.documentElement.style.setProperty(
            `--display-label`,
            "block"
          );
        }
      });

      features.features.forEach((feature) => {
        // add marker to map

        const marker = new maplibregl.Marker({
          element: makeMarkerElement(
            feature.properties["name"],
            feature.properties["fivh:kind"]
          ),
          color: "#FF7A00",
          className: `marker marker-${feature.properties["fivh:kind"]}`,
        })
          .setLngLat(feature.geometry.coordinates)
          .addTo(map);

        const element = marker.getElement();

        const pin = element.querySelector(".marker-pin");
        if (!pin) {
          throw new Error("No pin found in marker element");
        }
        const textLabel = element.querySelector(".marker-label");
        // add click event to open the info panel and pan camera if necessary

        const clickHandler = () => {
          panMapToShowMarker(
            map,
            feature.geometry.coordinates[0],
            feature.geometry.coordinates[1]
          );
          setFeature(feature);
          showInfoPanel();
        };
        pin.addEventListener("click", clickHandler);

        if (textLabel) {
          textLabel.addEventListener("click", clickHandler);
        }
      });
    }
  }, [mapContainer.current, map]);

  return <div className="map" ref={mapContainer}></div>;
};
