<script lang="ts">
  import { login, getFeature, uploadChangeset } from "osm-api";
  import { configureOsmApi, getOsmApiLoginOptions } from "../config";
  import { getNodeId } from "../utils/get-node-id";
  import { addDeletedFeature } from "../store/deleted-feature";
  import { hideInfoPanel } from "../store/feature";
  import type { Feature } from "../store/feature";
  import {
    isOsmLoggedIn,
    initializeOsmAuthStore,
    syncOsmAuthState,
  } from "../store/auth";
  import { makeEditorURL } from "../utils/osm-urls";

  interface Props {
    feature: Feature;
    onclose: () => void;
  }

  let { feature, onclose }: Props = $props();

  let dialogElement: HTMLDialogElement | undefined = $state();
  let isDeleting = $state(false);
  let error = $state<string | null>(null);

  export function open() {
    dialogElement?.showModal();
  }

  async function handleConfirmDelete() {
    isDeleting = true;
    error = null;
    try {
      if (!$isOsmLoggedIn) {
        initializeOsmAuthStore();
        await login(getOsmApiLoginOptions());
        await syncOsmAuthState();
      }

      configureOsmApi();
      const [node] = await getFeature("node", getNodeId(feature.id));

      const deletePayload = {
        tags: {
          created_by: "Gjenbruksportalen",
          comment: `Deleted ${feature.category}: ${feature.name}`,
        },
        diff: {
          create: [] as any[],
          modify: [] as any[],
          delete: [node],
        },
      };

      await uploadChangeset(deletePayload.tags, deletePayload.diff);
      addDeletedFeature(feature.id);
      dialogElement?.close();
      hideInfoPanel();
    } catch (err) {
      console.error("Failed to delete node:", err);
      error = err instanceof Error ? err.message : "Kunne ikke slette stedet";
    } finally {
      isDeleting = false;
    }
  }
</script>

<dialog bind:this={dialogElement} {onclose}>
  <h1>Sikker?</h1>
  <p>Er du sikker på at du vil slette dette stedet?</p>
  <p>
    Dette skal kun gjøres dersom det ble opprettet ved en feil eller hvis stedet
    ikke eksisterer i det hele tatt lenger, f.eks. hvis lokalene er tømt eller
    tatt over av noen andre.
  </p>
  <p>
    Ta en titt på disse artiklene for å lære mer om hva som kan gjøres når en
    butikk stenger permanent:
  </p>
  <ul>
    <li>
      <a
        href="https://wiki.openstreetmap.org/wiki/Keep_the_history"
        target="_blank">Keep the History</a
      >
    </li>
    <li>
      <a
        href="https://wiki.openstreetmap.org/wiki/Tag:disused%3D%2A"
        target="_blank">disused=* tag</a
      >
    </li>
  </ul>
  <p>
    Dersom stedet har flyttet eller på annet vis fortsatt eksisterer, kan det
    være nødvendig å
    <a href={makeEditorURL(feature.id)} target="_blank"
      >redigere manuelt i OpenStreetMap</a
    >.
  </p>
  {#if error}
    <div class="error-message">{error}</div>
  {/if}
  <div class="dialog-actions">
    <button
      class="delete-button"
      onclick={handleConfirmDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "Sletter..." : "Ja, slett"}
    </button>
    <button
      class="edit-button"
      onclick={() => dialogElement?.close()}
      disabled={isDeleting}
    >
      Avbryt
    </button>
  </div>
</dialog>

<style>
  dialog {
    position: fixed;
    inset: 0;
    margin: auto;
    height: fit-content;
    border: none;
    border-radius: 0.5rem;
    padding: 1rem;
    width: min(90vw, 500px);
    max-width: 500px;
    background: white;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
    z-index: 1000;

    h1 {
      margin-top: 0;
    }
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  .dialog-actions {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .error-message {
    color: #c00;
    margin-top: 0.5rem;
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
</style>
