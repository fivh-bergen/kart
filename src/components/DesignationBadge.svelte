<script lang="ts">
  import { getDesignationLabel } from "../utils/designation";

  interface Props {
    designation: string;
  }

  let { designation }: Props = $props();
</script>

<span class="designation-badge">
  {getDesignationLabel(designation)}
</span>

<style>
  .designation-badge {
    border-radius: 0.5rem;
    border: 1px solid black;
    color: black;
    width: fit-content;
    padding: 0.5rem;
  }
</style>
