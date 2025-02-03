import { useEffect, useRef } from "react";
import { config } from "../config";
import maplibregl from "maplibre-gl";
import { $map, setMap } from "../store/map";
import { useStore } from "@nanostores/react";
import "./map.css";

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
      });

      setMap(map);
    }
  }, [mapContainer.current, map]);

  return <div className="map" ref={mapContainer}></div>;
};
