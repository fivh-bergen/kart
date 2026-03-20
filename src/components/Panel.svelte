<script lang="ts">
  import { onMount } from "svelte";
  import {
    showInfoPanel,
    selectedFeatureId,
    isCreatingFeature,
    newFeatureLocation,
    hideInfoPanel,
    getSelectedFeature,
  } from "../store/feature";
  import FeatureInfo from "./FeatureInfo.svelte";
  import ServiceInfo from "./ServiceInfo.svelte";
  import EditNodeForm from "./EditNodeForm.svelte";

  let panelTitle = $derived.by(() => {
    if ($showInfoPanel && $isCreatingFeature && $newFeatureLocation) {
      return "Legg til butikk";
    }
    if ($showInfoPanel && !$selectedFeatureId) {
      return "Om tjenesten";
    }
    if ($showInfoPanel && $selectedFeatureId) {
      const feature = getSelectedFeature($selectedFeatureId);
      return feature?.name ?? "";
    }
    return "";
  });

  const MOBILE_BREAKPOINT = 968;
  const CLOSE_THRESHOLD_RATIO = 0.25;
  const MIN_CLOSE_THRESHOLD_PX = 120;

  let panelEl: HTMLDivElement | undefined;
  let isMobile = $state(false);
  let isDragging = $state(false);
  let dragStartY = $state(0);
  let dragOffsetY = $state(0);

  function resetDragState() {
    isDragging = false;
    dragOffsetY = 0;
    dragStartY = 0;
  }

  function handleDragStart(event: TouchEvent) {
    if (!isMobile || !$showInfoPanel || event.touches.length !== 1) {
      return;
    }

    isDragging = true;
    dragStartY = event.touches[0].clientY;
    dragOffsetY = 0;
  }

  function handleDragMove(event: TouchEvent) {
    if (!isDragging || event.touches.length !== 1) {
      return;
    }

    const deltaY = event.touches[0].clientY - dragStartY;
    dragOffsetY = Math.max(0, deltaY);

    if (dragOffsetY > 0) {
      event.preventDefault();
    }
  }

  function handleDragEnd() {
    if (!isDragging) {
      return;
    }

    const panelHeight = panelEl?.getBoundingClientRect().height ?? 0;
    const closeThreshold = Math.max(
      panelHeight * CLOSE_THRESHOLD_RATIO,
      MIN_CLOSE_THRESHOLD_PX,
    );
    const shouldClose = dragOffsetY >= closeThreshold;

    isDragging = false;
    dragOffsetY = 0;

    if (shouldClose) {
      hideInfoPanel();
    }
  }

  onMount(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT}px)`,
    );
    const syncMediaState = () => {
      isMobile = mediaQuery.matches;
      if (!isMobile) {
        resetDragState();
      }
    };

    syncMediaState();
    mediaQuery.addEventListener("change", syncMediaState);

    return () => {
      mediaQuery.removeEventListener("change", syncMediaState);
    };
  });

  $effect(() => {
    if (!$showInfoPanel) {
      resetDragState();
    }
  });
</script>

<div
  class="panel"
  class:is-open={$showInfoPanel}
  class:is-dragging={isDragging}
  aria-hidden={!$showInfoPanel}
  style={`--panel-drag-offset: ${dragOffsetY}px;`}
  bind:this={panelEl}
>
  <div class="panel-content">
    {#if $showInfoPanel}
      <div class="panel-header">
        <div
          class="panel-drag-handle"
          aria-hidden="true"
          ontouchstart={handleDragStart}
          ontouchmove={handleDragMove}
          ontouchend={handleDragEnd}
          ontouchcancel={handleDragEnd}
        ></div>
        <h1>{panelTitle}</h1>
        <button class="close-button" aria-label="Lukk" onclick={hideInfoPanel}>
          &times;
        </button>
      </div>
      <div class="panel-main-content">
        {#if $isCreatingFeature && $newFeatureLocation}
          <EditNodeForm
            mode="create"
            location={$newFeatureLocation}
            onCancel={hideInfoPanel}
          />
        {:else if !$selectedFeatureId}
          <ServiceInfo />
        {:else}
          {@const feature = getSelectedFeature($selectedFeatureId)}
          {#if feature}
            {#key feature.id}
              <FeatureInfo {feature} />
            {/key}
          {/if}
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .panel {
    position: fixed;
    top: 3.3rem;
    right: 0.3rem;
    bottom: 0.3rem;
    width: 30%;
    background-color: white;
    border-radius: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    transform: translateX(calc(100% + 1rem));
    opacity: 0;
    pointer-events: none;
    transition:
      transform 0.25s ease,
      opacity 0.2s ease,
      height 0.25s ease,
      border-radius 0.25s ease;
    z-index: 2;
    overflow-y: hidden;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p {
      margin: 0;
      padding: 0;
    }
  }

  .panel.is-open {
    transform: translate3d(0, 0, 0);
    opacity: 1;
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .panel {
      transition: none;
    }
  }

  .panel-content {
    position: absolute;
    left: 0;
    bottom: 0;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .panel-header {
    padding-top: 1.5rem;
    padding-left: 1.5rem;
    padding-right: calc(1.5rem + 36px);
    word-break: break-word;
  }

  .panel-drag-handle {
    display: none;
  }

  .panel-main-content {
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .close-button {
    position: absolute;
    top: 0.5rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 36px;
    cursor: pointer;
  }

  @media screen and (max-width: 968px) {
    .panel {
      position: fixed;
      top: unset;
      right: unset;
      bottom: 0;
      width: 100dvw;
      height: 50%;
      border-radius: 1rem 1rem 0 0;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      transform: translateY(calc(100% + 1rem));
    }

    .panel.is-open {
      transform: translate3d(0, var(--panel-drag-offset, 0px), 0);
    }

    .panel.is-dragging {
      transition: none;
    }

    .panel-header {
      position: relative;
      padding-top: 2.25rem;
    }

    .panel-drag-handle {
      display: block;
      position: absolute;
      top: 0.6rem;
      left: 50%;
      transform: translateX(-50%);
      width: 3rem;
      height: 0.35rem;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.2);
      touch-action: none;
    }

    .panel:has(.edit-form-wrapper) {
      height: 100dvh;
      border-radius: 0;
    }
  }
</style>
