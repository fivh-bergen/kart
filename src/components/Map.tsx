import { useEffect, useRef } from "react";
import { config } from "../config";
import maplibregl from "maplibre-gl";
import { $map, setMap } from "../store/map";
import { useStore } from "@nanostores/react";
import "./Map.css";

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
    }
  }, [mapContainer.current, map]);

  return <div className="map" ref={mapContainer}></div>;
};
