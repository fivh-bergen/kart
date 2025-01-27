import maplibregl from "maplibre-gl";

export const map = new maplibregl.Map({
  container: "map", // container id
  style:
    "https://api.maptiler.com/maps/8d052b8a-bcfc-4d5f-8d90-f3af6edc8e13/style.json?key=JzEcmTM9DI9IYqHFODOt", // style URL
  center: [5.32867, 60.39083], // starting position [lng, lat]
  zoom: 13.5, // starting zoom
});
