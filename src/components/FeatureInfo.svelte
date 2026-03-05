<script lang="ts">
  import { onMount } from "svelte";
  import { login } from "osm-api";
  import { getOsmApiLoginOptions } from "../config";
  import type { Feature } from "../store/feature";
  import { hideInfoPanel } from "../store/feature";
  import {
    isOsmLoggedIn,
    initializeOsmAuthStore,
    syncOsmAuthState,
  } from "../store/auth";
  import { formatAddress } from "../utils/format-address";
  import { makeNodeURL } from "../utils/osm-urls";
  import { groupDesignations } from "../utils/designation";
  import { getInstagramUsername } from "../utils/instagram";
  import DesignationBadge from "./DesignationBadge.svelte";
  import OpeningHours from "./OpeningHours.svelte";
  import EditNodeForm from "./EditNodeForm.svelte";
  import DeleteDialog from "./DeleteDialog.svelte";

  interface Props {
    feature: Feature;
  }

  let { feature }: Props = $props();

  let isEditing = $state(false);
  let deleteDialog: ReturnType<typeof DeleteDialog> | undefined = $state();

  const address = $derived(formatAddress(feature.address));
  const groupedDesignations = $derived(groupDesignations(feature.designations));

  onMount(() => {
    initializeOsmAuthStore();
    void syncOsmAuthState();
  });
</script>

{#if isEditing}
  <EditNodeForm {feature} onCancel={() => (isEditing = false)} />
{:else}
  <div class="panel-lead">
    {#each groupedDesignations as group (group.groupLabel)}
      <div class="designation-group">
        <h3>{group.groupLabel}</h3>
        <div class="tags-box">
          {#each group.designations as d (d.name)}
            <DesignationBadge designation={d.name} />
          {/each}
        </div>
      </div>
    {/each}

    {#if feature.description}
      <div class="description-box">
        <p>{feature.description}</p>
      </div>
    {/if}
  </div>

  {#if address || feature.opening_hours || feature.website || feature.facebook || feature.phone || feature.email}
    <div class="panel-body">
      {#if address}
        <div class="feature-info-flex">
          <!-- Home icon -->
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
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <a
            class="subtle-link"
            href="https://www.google.com/maps/search/?api=1&query={encodeURIComponent(
              address,
            )}"
            target="_blank"
          >
            {address}
          </a>
        </div>
      {/if}

      {#if feature.opening_hours}
        <OpeningHours
          openingHours={feature.opening_hours}
          openingHoursChecked={feature.openingHoursChecked}
        />
      {/if}

      {#if feature.website}
        <div class="feature-info-flex">
          <!-- Link icon -->
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
            <path
              d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            />
            <path
              d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            />
          </svg>
          <a class="subtle-link" href={feature.website} target="_blank">
            {new URL(feature.website).host.replace("www.", "")}
          </a>
        </div>
      {/if}

      {#if feature.instagram}
        <div class="feature-info-flex">
          <!-- Instagram icon -->
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
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          <a class="subtle-link" href={feature.instagram} target="_blank">
            {getInstagramUsername(feature.instagram) || "Instagram"}
          </a>
        </div>
      {/if}

      {#if feature.facebook}
        <div class="feature-info-flex">
          <!-- Facebook icon -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
            />
          </svg>
          <a class="subtle-link" href={feature.facebook} target="_blank">
            Facebook
          </a>
        </div>
      {/if}

      {#if feature.phone}
        <div class="feature-info-flex">
          <!-- Phone icon -->
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
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <a class="subtle-link" href="tel:{feature.phone}">
            {feature.phone}
          </a>
        </div>
      {/if}

      {#if feature.email}
        <div class="feature-info-flex">
          <!-- Email icon -->
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
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <a class="subtle-link" href="mailto:{feature.email}">
            {feature.email}
          </a>
        </div>
      {/if}
    </div>
  {/if}

  <div class="panel-footer">
    <a
      class="edit-link"
      href={makeNodeURL(feature.id)}
      target="_blank"
      rel="noreferrer"
    >
      Vis i OpenStreetMap
    </a>

    {#if $isOsmLoggedIn}
      <div class="action-buttons">
        <button class="delete-button" onclick={() => deleteDialog?.open()}>
          Slett
        </button>
        <button class="edit-button" onclick={() => (isEditing = true)}>
          Endre
        </button>
      </div>
    {:else}
      <button
        class="edit-button"
        onclick={async () => {
          initializeOsmAuthStore();
          await login(getOsmApiLoginOptions());
          void syncOsmAuthState();
        }}
      >
        Logg inn for å endre
      </button>
    {/if}
  </div>

  <DeleteDialog bind:this={deleteDialog} {feature} onclose={() => {}} />
{/if}

<style>
  .panel-lead {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .tags-box {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .designation-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .description-box {
    color: #404654;
    font-size: 1.125rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .panel-body {
    display: flex;
    flex-direction: column;
    background-color: #f6f6f6;
    border-radius: 0.5rem;
    gap: 1rem;
    padding: 1.5rem;
    color: black;
  }

  .feature-info-flex {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .subtle-link {
    color: black;
  }

  .subtle-link:visited {
    color: black;
  }

  .panel-footer {
    flex: 2;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 1rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .edit-link {
    color: #404654;
  }

  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 0.5rem;
    margin-top: auto;
  }

  .edit-button {
    background-color: #ff7a00;
    border: none;
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .edit-button:hover:not(:disabled) {
    background-color: #e66d00;
  }

  .delete-button {
    background-color: #c00;
    border: none;
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .delete-button:hover:not(:disabled) {
    background-color: #a00;
  }
</style>
