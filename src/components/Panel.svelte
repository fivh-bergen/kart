<script lang="ts">
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
</script>

<div class="panel" class:is-open={$showInfoPanel} aria-hidden={!$showInfoPanel}>
  <div class="panel-content">
    {#if $showInfoPanel}
      <div class="panel-header">
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

    .panel:has(.edit-form-wrapper) {
      height: 100dvh;
      border-radius: 0;
    }
  }
</style>
