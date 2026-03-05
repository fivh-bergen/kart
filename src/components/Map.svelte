<script lang="ts">
  import { onMount } from "svelte";
  import { get, derived } from "svelte/store";
  import { config } from "../config.local";
  import maplibregl, { type GeoJSONSource } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import {
    showInfoPanel,
    hideInfoPanel,
    setSelectedFeatureId,
    openInfoPanel,
    startNewFeatureCreation,
  } from "../store/feature";
  import { panMapToShowMarker } from "../utils/pan-map";
  import {
    ghostFeatures,
    initializeGhostFeatures,
    toGhostFeatureCollection,
  } from "../store/ghost-feature";
  import {
    deletedFeatures,
    initializeDeletedFeatures,
  } from "../store/deleted-feature";
  import { selectedCategories } from "../store/filter";
  import type { CategoryName } from "../utils/category";

  let mapContainer: HTMLDivElement;
  let mapRef: maplibregl.Map | null = null;
  let isPickingLocation = $state(false);

  /**
   * Builds and applies MapLibre layer filters that combine:
   * 1. Cluster / non-cluster differentiation
   * 2. Locally-deleted feature exclusion
   * 3. Category filtering
   *
   * This uses MapLibre's native expression filters, so the GPU handles
   * all the filtering — no JS loops over features.
   */
  function updateMapFilters(
    map: maplibregl.Map,
    deletedIds: string[],
    categories: CategoryName[],
  ) {
    const notDeleted: maplibregl.ExpressionSpecification = [
      "!",
      ["in", ["get", "id"], ["literal", deletedIds]],
    ];
    const categoryMatch: maplibregl.ExpressionSpecification | null =
      categories.length > 0
        ? ["in", ["get", "fivh:category"], ["literal", categories]]
        : null;

    const clusterBase: maplibregl.ExpressionSpecification = [
      "has",
      "point_count",
    ];
    const markerBase: maplibregl.ExpressionSpecification = [
      "!",
      ["has", "point_count"],
    ];

    const clusterFilter: maplibregl.ExpressionSpecification = categoryMatch
      ? ["all", clusterBase, notDeleted, categoryMatch]
      : ["all", clusterBase, notDeleted];

    const markerFilter: maplibregl.ExpressionSpecification = categoryMatch
      ? ["all", markerBase, notDeleted, categoryMatch]
      : ["all", markerBase, notDeleted];

    map.setFilter("clusters", clusterFilter);
    map.setFilter("cluster-count", clusterFilter);
    map.setFilter("markers", markerFilter);
  }

  onMount(() => {
    const map = new maplibregl.Map({
      container: mapContainer,
      style: config.style,
      center: [config.startingPosition.lng, config.startingPosition.lat],
      zoom: config.startingPosition.zoom,
      minZoom: config.minZoom || 10,
      dragRotate: false,
    });

    map.touchZoomRotate.disableRotation();
    mapRef = map;

    map.on("load", async () => {
      initializeGhostFeatures();
      initializeDeletedFeatures();

      const currentDeleted = get(deletedFeatures);

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
        data: toGhostFeatureCollection(get(ghostFeatures)) as any,
      });

      map.addLayer({
        id: "clusters",
        source: "features",
        type: "circle",
        filter: ["all", ["has", "point_count"]],
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
        filter: ["all", ["has", "point_count"]],
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
      map.addImage("reuse", secondHandIcon.data);
      map.addImage("rental", rentalIcon.data);
      map.addImage("repair", repairIcon.data);

      map.addLayer({
        id: "markers",
        type: "symbol",
        source: "features",
        filter: ["all", ["!", ["has", "point_count"]]],
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

      // Apply initial filters
      updateMapFilters(map, currentDeleted, get(selectedCategories));

      // Subscribe to filter/deletion changes using a combined derived store
      const filterState = derived(
        [deletedFeatures, selectedCategories],
        ([$deleted, $cats]) => ({
          deletedIds: $deleted,
          categories: $cats,
        }),
      );

      const unsubFilter = filterState.subscribe(
        ({ deletedIds, categories }) => {
          if (map.isStyleLoaded()) {
            updateMapFilters(map, deletedIds, categories);
          }
        },
      );

      // Subscribe to ghost feature changes
      const unsubGhost = ghostFeatures.subscribe((ghosts) => {
        const source = map.getSource("ghost-features") as
          | GeoJSONSource
          | undefined;
        source?.setData(toGhostFeatureCollection(ghosts) as any);
      });

      // --- Map click handlers ---

      map.on("click", "clusters", async (e) => {
        if (isPickingLocation) return;

        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        }) as any;
        const clusterId = features[0].properties.cluster_id;
        const source = map.getSource("features") as GeoJSONSource;
        if (!source) return;

        const zoom = await source.getClusterExpansionZoom(clusterId);
        hideInfoPanel();
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom + 1,
        });
      });

      map.on("click", "markers", (e) => {
        if (isPickingLocation) return;

        const features = e.features;
        if (features) {
          const feature = features[0] as any;
          setSelectedFeatureId(String(feature.properties.id));
          openInfoPanel();
          panMapToShowMarker(
            map,
            feature.geometry.coordinates[0],
            feature.geometry.coordinates[1],
          );
        }
      });

      // Pointer cursors
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

      // Cleanup on map removal
      map.on("remove", () => {
        unsubFilter();
        unsubGhost();
      });
    });

    return () => {
      map.remove();
      mapRef = null;
    };
  });

  function handleAddShopClick() {
    if (!isPickingLocation) {
      hideInfoPanel();
      isPickingLocation = true;
      return;
    }

    if (!mapRef) return;

    const center = mapRef.getCenter();
    startNewFeatureCreation({ lat: center.lat, long: center.lng });
    isPickingLocation = false;
  }

  function handleCancelLocationPick() {
    isPickingLocation = false;
  }
</script>

<div class="map" bind:this={mapContainer}></div>

{#if isPickingLocation}
  <div class="map-center-target" aria-hidden="true">
    <div class="map-center-target-pin"></div>
  </div>
{/if}

{#if !$showInfoPanel}
  <div class="map-fab-stack">
    {#if isPickingLocation}
      <button
        type="button"
        class="map-fab-cancel"
        aria-label="Avbryt plassering"
        onclick={handleCancelLocationPick}
      >
        <!-- Cross icon -->
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    {/if}
    <button
      type="button"
      class="map-fab"
      aria-label={isPickingLocation
        ? "Bekreft plassering"
        : "Legg til ny butikk"}
      onclick={handleAddShopClick}
    >
      {#if isPickingLocation}
        <!-- Check icon -->
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      {:else}
        <!-- Plus icon -->
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      {/if}
    </button>
  </div>
{/if}

<style>
  .map {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .map-fab {
    width: 3.5rem;
    height: 3.5rem;
    border: none;
    border-radius: 9999px;
    background-color: #ff7a00;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  }

  .map-fab-stack {
    position: fixed;
    right: 2rem;
    bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
    z-index: 2;
  }

  .map-fab-cancel {
    border: none;
    border-radius: 9999px;
    background-color: #fff;
    color: #333;
    width: 3.5rem;
    height: 3.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  }

  .map-fab-cancel:hover {
    background-color: #f3f3f3;
  }

  .map-fab:hover {
    background-color: #e66d00;
  }

  .map-center-target {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 2;
  }

  .map-center-target-pin {
    width: 1.5rem;
    height: 1.5rem;
    background-color: #ff7a00;
    border-radius: 50% 50% 50% 0;
    transform: translateY(-0.95rem) rotate(-45deg);
    box-shadow: 0 0.25rem 0.65rem rgba(0, 0, 0, 0.25);
  }

  .map-center-target-pin::after {
    content: "";
    position: absolute;
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 9999px;
    background-color: #fff;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
  }
</style>
