<script lang="ts">
  import { config } from "../config.local";
  import { toggleAboutPanel } from "../store/feature";
  import {
    isOsmLoggedIn,
    initializeOsmAuthStore,
    syncOsmAuthState,
  } from "../store/auth";
  import { logout } from "osm-api";
  import { onMount } from "svelte";

  onMount(() => {
    initializeOsmAuthStore();
    void syncOsmAuthState();
  });

  async function handleLogout() {
    await logout();
    void syncOsmAuthState();
  }
</script>

<div class="header">
  {config.appName}
  <div class="header-actions">
    {#if $isOsmLoggedIn}
      <button class="badge" type="button" onclick={handleLogout}>
        <span class="badge-text">Logg ut</span>
        <!-- Exit icon -->
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
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    {/if}
    <button class="badge" type="button" onclick={toggleAboutPanel}>
      <span class="badge-text">Om tjenesten</span>
      <!-- Question mark icon -->
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
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </button>
  </div>
</div>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 3rem;
    opacity: 0.8;
    background-color: #ff7a00;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    font-size: 1.5rem;
    color: white;
    z-index: 1;
  }

  .header-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .badge {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    gap: 0.5rem;
    border: none;
    height: fit-content;
    color: black;
  }

  .badge-text {
    font-size: 1rem;
    font-family: inherit;
  }

  @media screen and (max-width: 968px) {
    .badge-text {
      display: none;
    }

    .badge {
      border-radius: 50%;
      padding: 0.25rem;
      min-width: 2rem;
      min-height: 2rem;
    }
  }
</style>
