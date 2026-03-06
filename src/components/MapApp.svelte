<script lang="ts">
  import Header from "./Header.svelte";
  import Map from "./Map.svelte";
  import Filter from "./Filter.svelte";
  import Panel from "./Panel.svelte";
  import Logo from "./Logo.svelte";
</script>

<div class="app-container">
  <Header />
  <Map />
  <Filter />
  <Panel />
  <Logo />
</div>

<style>
  .app-container {
    height: 100vh;
    height: 100dvh;
    width: 100vw;
    width: 100dvw;
    display: flex;
    flex-direction: column;
  }
</style>
