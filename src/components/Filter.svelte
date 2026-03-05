<script lang="ts">
  import { selectedCategories } from "../store/filter";
  import { categories, type CategoryName } from "../utils/category";

  function toggleCategory(kind: CategoryName) {
    selectedCategories.update((current) => {
      if (current.includes(kind)) {
        return [];
      }
      return [kind];
    });
  }
</script>

<div class="filter-container">
  {#each categories as c (c.name)}
    <button
      class="filter-button"
      class:filter-button-selected={$selectedCategories.includes(c.name)}
      onclick={() => toggleCategory(c.name)}
    >
      {c.label}
    </button>
  {/each}
</div>

<style>
  .filter-container {
    position: fixed;
    display: flex;
    top: 4rem;
    left: 1rem;
    gap: 0.5rem;
  }

  .filter-button {
    font-size: 1.2rem;
    border-radius: 0.5rem;
    background-color: #ffffff;
    color: black;
    width: fit-content;
    padding: 0.5rem;
    border: none;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    font-family: inherit;
  }

  .filter-button-selected {
    background-color: #ff7a00;
    color: white;
  }
</style>
