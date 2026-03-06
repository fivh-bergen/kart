<script lang="ts">
  import { onMount } from "svelte";
  import { getFeature, login, uploadChangeset } from "osm-api";
  import { configureOsmApi, getOsmApiLoginOptions } from "../config";
  import { getNodeId } from "../utils/get-node-id";
  import {
    hideInfoPanel,
    type Feature,
    type NewFeatureLocation,
  } from "../store/feature";
  import {
    categories,
    getDesignationsForCategory,
    inferCategoryFromOsmTags,
    type CategoryName,
  } from "../utils/category";
  import {
    applyDesignationChanges,
    getDesignationLabel,
    getDesignationsFromTags,
    groupDesignationsByConflict,
    isDesignationEditable,
  } from "../utils/designation";
  import { format } from "date-fns";
  import {
    isOsmLoggedIn,
    initializeOsmAuthStore,
    syncOsmAuthState,
  } from "../store/auth";
  import { addGhostFeature } from "../store/ghost-feature";

  interface Props {
    mode?: "edit" | "create";
    feature?: Feature;
    location?: NewFeatureLocation;
    onCancel: () => void;
  }

  let { mode = "edit", feature, location, onCancel }: Props = $props();

  const isCreateMode = mode === "create";

  const fallbackCategoryTags: Record<CategoryName, Record<string, string>> = {
    reuse: { shop: "second_hand" },
    rental: { shop: "rental" },
    repair: { shop: "repair" },
  };

  let isSubmitting = $state(false);
  let error = $state<string | null>(null);
  let success = $state(false);
  let isLoadingNode = $state(!isCreateMode);
  let liveNodeTags = $state<Record<string, unknown> | null>(null);
  let selectedCategory = $state<CategoryName>(
    isCreateMode ? "reuse" : (feature?.category ?? "reuse"),
  );
  let selectedDesignations = $state<string[]>([]);
  let initialDesignations = $state<string[]>([]);

  let designationGroups = $derived.by(() => {
    const editableDesignationsForCategory = getDesignationsForCategory(
      selectedCategory,
    ).filter(isDesignationEditable);
    return groupDesignationsByConflict(editableDesignationsForCategory);
  });

  onMount(() => {
    initializeOsmAuthStore();
    void syncOsmAuthState();

    if (isCreateMode) {
      isLoadingNode = false;
      liveNodeTags = null;
      selectedCategory = "reuse";
      selectedDesignations = [];
      initialDesignations = [];
      return;
    }

    if (!feature) return;

    let cancelled = false;

    const loadLiveNode = async () => {
      try {
        configureOsmApi();
        const [node] = await getFeature("node", getNodeId(feature!.id));
        if (cancelled) return;

        const nodeTags = node.tags ?? {};
        liveNodeTags = nodeTags;
        selectedCategory = inferCategoryFromOsmTags(nodeTags);

        const designationsFromNode = getDesignationsFromTags(nodeTags);
        const editableDesignations = designationsFromNode.filter(
          isDesignationEditable,
        );
        selectedDesignations = editableDesignations;
        initialDesignations = editableDesignations;
      } catch (err) {
        if (!cancelled) {
          error =
            err instanceof Error
              ? err.message
              : "Kunne ikke hente oppdaterte data fra OpenStreetMap";
        }
      } finally {
        if (!cancelled) {
          isLoadingNode = false;
        }
      }
    };

    loadLiveNode();

    return () => {
      cancelled = true;
    };
  });

  // Current tag values for form defaults
  const currentTags = $derived(liveNodeTags ?? {});
  const currentName = $derived(
    typeof currentTags["name"] === "string"
      ? (currentTags["name"] as string)
      : (feature?.name ?? ""),
  );
  const currentDescription = $derived(
    typeof currentTags["description"] === "string"
      ? (currentTags["description"] as string)
      : (feature?.description ?? ""),
  );
  const currentWebsite = $derived(
    typeof currentTags["website"] === "string"
      ? (currentTags["website"] as string)
      : (feature?.website ?? ""),
  );
  const currentInstagram = $derived(
    typeof currentTags["contact:instagram"] === "string"
      ? (currentTags["contact:instagram"] as string)
      : (feature?.instagram ?? ""),
  );
  const currentFacebook = $derived(
    typeof currentTags["contact:facebook"] === "string"
      ? (currentTags["contact:facebook"] as string)
      : (feature?.facebook ?? ""),
  );
  const currentPhone = $derived(
    typeof currentTags["phone"] === "string"
      ? (currentTags["phone"] as string)
      : (feature?.phone ?? ""),
  );
  const currentEmail = $derived(
    typeof currentTags["contact:email"] === "string"
      ? (currentTags["contact:email"] as string)
      : typeof currentTags["email"] === "string"
        ? (currentTags["email"] as string)
        : (feature?.email ?? ""),
  );
  const currentOpeningHours = $derived(
    typeof currentTags["opening_hours"] === "string"
      ? (currentTags["opening_hours"] as string)
      : (feature?.opening_hours ?? ""),
  );
  const currentStreet = $derived(
    typeof currentTags["addr:street"] === "string"
      ? (currentTags["addr:street"] as string)
      : (feature?.address?.street ?? ""),
  );
  const currentHousenumber = $derived(
    typeof currentTags["addr:housenumber"] === "string"
      ? (currentTags["addr:housenumber"] as string)
      : (feature?.address?.buildingNumber ?? ""),
  );
  const currentPostcode = $derived(
    typeof currentTags["addr:postcode"] === "string"
      ? (currentTags["addr:postcode"] as string)
      : (feature?.address?.postalCode ?? ""),
  );
  const currentCity = $derived(
    typeof currentTags["addr:city"] === "string"
      ? (currentTags["addr:city"] as string)
      : (feature?.address?.city ?? ""),
  );

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    if (!$isOsmLoggedIn) {
      error = "Du må logge inn med OpenStreetMap for å lagre";
      return;
    }

    isSubmitting = true;
    error = null;

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const website = formData.get("website") as string;
    const instagram = formData.get("instagram") as string;
    const facebook = formData.get("facebook") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const openingHours = formData.get("opening_hours") as string;
    const street = formData.get("street") as string;
    const housenumber = formData.get("housenumber") as string;
    const postcode = formData.get("postcode") as string;
    const city = formData.get("city") as string;

    if (!name.trim()) {
      error = "Navn er påkrevd";
      isSubmitting = false;
      return;
    }

    const editableNames = new Set(
      getDesignationsForCategory(selectedCategory).filter(
        isDesignationEditable,
      ),
    );
    const initialEditable = initialDesignations.filter((d) =>
      editableNames.has(d),
    );
    const selectedEditable = selectedDesignations.filter((d) =>
      editableNames.has(d),
    );

    const added = selectedEditable.filter((d) => !initialEditable.includes(d));
    const removed = initialEditable.filter(
      (d) => !selectedEditable.includes(d),
    );

    try {
      configureOsmApi();

      if (!isCreateMode) {
        if (!feature) throw new Error("Mangler feature for redigering");

        const [node] = await getFeature("node", getNodeId(feature.id));

        const existingTags: Record<string, string> = {};
        for (const [key, value] of Object.entries(node.tags ?? {})) {
          if (typeof value === "string") {
            existingTags[key] = value;
          }
        }

        delete existingTags["fivh:category"];
        delete existingTags["fivh:designations"];

        const withDesignationChanges = applyDesignationChanges(
          existingTags,
          added,
          removed,
        );

        const emailTagKey =
          typeof node.tags?.["contact:email"] === "string"
            ? "contact:email"
            : typeof node.tags?.["email"] === "string"
              ? "email"
              : "contact:email";
        const normalizedOpeningHours = openingHours?.trim() ?? "";
        const currentOH = withDesignationChanges["opening_hours"]?.trim() ?? "";
        const hasOpeningHoursChanged = normalizedOpeningHours !== currentOH;
        const checkDateOpeningHours = format(new Date(), "yyyy-MM-dd");

        const updatedTags = {
          ...withDesignationChanges,
          name: name.trim(),
          ...(description?.trim() && { description: description.trim() }),
          ...(website?.trim() && { website: website.trim() }),
          ...(instagram?.trim() && { "contact:instagram": instagram.trim() }),
          ...(facebook?.trim() && { "contact:facebook": facebook.trim() }),
          ...(phone?.trim() && { phone: phone.trim() }),
          ...(email?.trim() && { [emailTagKey]: email.trim() }),
          ...(normalizedOpeningHours && {
            opening_hours: normalizedOpeningHours,
          }),
          ...(hasOpeningHoursChanged && {
            "check_date:opening_hours": checkDateOpeningHours,
          }),
          ...(street?.trim() && { "addr:street": street.trim() }),
          ...(housenumber?.trim() && {
            "addr:housenumber": housenumber.trim(),
          }),
          ...(postcode?.trim() && { "addr:postcode": postcode.trim() }),
          ...(city?.trim() && { "addr:city": city.trim() }),
        };

        const updatedNode = { ...node, tags: updatedTags };

        await uploadChangeset(
          {
            created_by: "Gjenbruksportalen",
            comment: `Updated ${selectedCategory}: ${name}`,
          },
          {
            create: [],
            modify: [updatedNode],
            delete: [],
          },
        );
      } else {
        if (!location) throw new Error("Mangler lokasjon for nytt sted");

        const tagsFromDesignations = applyDesignationChanges(
          {},
          selectedEditable,
          [],
        );
        const categoryFallbackTags =
          selectedEditable.length === 0
            ? fallbackCategoryTags[selectedCategory]
            : {};
        const normalizedOpeningHours = openingHours?.trim() ?? "";
        const checkDateOpeningHours = format(new Date(), "yyyy-MM-dd");

        const updatedTags = {
          ...categoryFallbackTags,
          ...tagsFromDesignations,
          name: name.trim(),
          ...(description?.trim() && { description: description.trim() }),
          ...(website?.trim() && { website: website.trim() }),
          ...(instagram?.trim() && {
            "contact:instagram": instagram.trim(),
          }),
          ...(facebook?.trim() && {
            "contact:facebook": facebook.trim(),
          }),
          ...(phone?.trim() && { phone: phone.trim() }),
          ...(email?.trim() && { "contact:email": email.trim() }),
          ...(normalizedOpeningHours && {
            opening_hours: normalizedOpeningHours,
            "check_date:opening_hours": checkDateOpeningHours,
          }),
          ...(street?.trim() && { "addr:street": street.trim() }),
          ...(housenumber?.trim() && {
            "addr:housenumber": housenumber.trim(),
          }),
          ...(postcode?.trim() && { "addr:postcode": postcode.trim() }),
          ...(city?.trim() && { "addr:city": city.trim() }),
        };

        await uploadChangeset(
          {
            created_by: "Gjenbruksportalen",
            comment: `Added ${selectedCategory}: ${name}`,
          },
          {
            create: [
              {
                type: "node" as const,
                id: -1,
                version: 0,
                changeset: 0,
                timestamp: new Date().toISOString(),
                user: "",
                uid: 0,
                lat: location.lat,
                lon: location.long,
                tags: updatedTags,
              },
            ],
            modify: [],
            delete: [],
          },
        );

        addGhostFeature({
          name: name.trim(),
          category: selectedCategory,
          lat: location.lat,
          long: location.long,
        });
      }

      success = true;
      setTimeout(() => {
        hideInfoPanel();
      }, 2000);
    } catch (err) {
      console.error("Failed to update node:", err);
      error =
        err instanceof Error ? err.message : "Kunne ikke oppdatere stedet";
    } finally {
      isSubmitting = false;
    }
  }

  function toggleDesignation(designationName: string, checked: boolean) {
    if (checked) {
      if (!selectedDesignations.includes(designationName)) {
        selectedDesignations = [...selectedDesignations, designationName];
      }
    } else {
      selectedDesignations = selectedDesignations.filter(
        (item) => item !== designationName,
      );
    }
  }

  function selectExclusiveDesignation(
    groupDesignations: string[],
    designationName: string | null,
  ) {
    const filtered = selectedDesignations.filter(
      (d) => !groupDesignations.includes(d),
    );
    if (designationName) {
      selectedDesignations = [...filtered, designationName];
    } else {
      selectedDesignations = filtered;
    }
  }
</script>

{#if success}
  <div class="edit-form-wrapper">
    <div class="edit-success">
      <p>
        ✓ {isCreateMode ? "Stedet ble lagt til!" : "Stedet ble oppdatert!"}
      </p>
      <p class="edit-success-note">
        {isCreateMode
          ? "Det kan ta litt tid før stedet vises på kartet."
          : "Det kan ta litt tid før endringene vises på kartet."}
      </p>
    </div>
  </div>
{:else if isLoadingNode}
  <div class="edit-form-wrapper">
    <p>Laster oppdaterte data fra OpenStreetMap...</p>
  </div>
{:else}
  <div class="edit-form-wrapper">
    <form onsubmit={handleSubmit} class="edit-form">
      <div class="form-section">
        <label for="name" class="required">Navn</label>
        <input type="text" id="name" name="name" value={currentName} required />
      </div>

      <div class="form-section">
        <label for="category">Kategori</label>
        <select id="category" name="category" bind:value={selectedCategory}>
          {#each categories as category (category.name)}
            <option value={category.name}>{category.label}</option>
          {/each}
        </select>
      </div>

      {#each designationGroups as group (group.key)}
        <fieldset class="form-fieldset">
          <legend
            class={["group:shop", "group:repairer", "group:renter"].includes(
              group.key,
            )
              ? "required"
              : ""}
          >
            {group.label}
          </legend>
          <div class="designation-grid">
            {#if !group.multiValue && !["group:shop", "group:repairer", "group:renter"].includes(group.key)}
              <label class="designation-option" for="tag-{group.key}-none">
                <input
                  type="radio"
                  name="exclusive-{group.key}"
                  id="tag-{group.key}-none"
                  checked={!group.designations.some((d) =>
                    selectedDesignations.includes(d),
                  )}
                  onchange={() =>
                    selectExclusiveDesignation(group.designations, null)}
                />
                <span>Ingen</span>
              </label>
            {/if}
            {#each group.designations as designationName (designationName)}
              <label class="designation-option" for="tag-{designationName}">
                {#if group.multiValue}
                  <input
                    type="checkbox"
                    id="tag-{designationName}"
                    checked={selectedDesignations.includes(designationName)}
                    onchange={(e) =>
                      toggleDesignation(
                        designationName,
                        (e.currentTarget as HTMLInputElement).checked,
                      )}
                  />
                {:else}
                  <input
                    type="radio"
                    name="exclusive-{group.key}"
                    id="tag-{designationName}"
                    checked={selectedDesignations.includes(designationName)}
                    required={[
                      "group:shop",
                      "group:repairer",
                      "group:renter",
                    ].includes(group.key)}
                    onchange={() =>
                      selectExclusiveDesignation(
                        group.designations,
                        designationName,
                      )}
                  />
                {/if}
                <span>{getDesignationLabel(designationName)}</span>
              </label>
            {/each}
          </div>
        </fieldset>
      {/each}

      <div class="form-section">
        <label for="description">Beskrivelse</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={currentDescription}
        ></textarea>
      </div>

      <div class="form-section">
        <label for="website">Nettside</label>
        <input type="url" id="website" name="website" value={currentWebsite} />
      </div>

      <div class="form-section">
        <label for="instagram">Instagram</label>
        <input
          type="url"
          id="instagram"
          name="instagram"
          placeholder="https://instagram.com/..."
          value={currentInstagram}
        />
      </div>

      <div class="form-section">
        <label for="facebook">Facebook</label>
        <input
          type="url"
          id="facebook"
          name="facebook"
          placeholder="https://facebook.com/..."
          value={currentFacebook}
        />
      </div>

      <div class="form-section">
        <label for="phone">Telefon</label>
        <input type="tel" id="phone" name="phone" value={currentPhone} />
      </div>

      <div class="form-section">
        <label for="email">E-post</label>
        <input type="email" id="email" name="email" value={currentEmail} />
      </div>

      <div class="form-section">
        <label for="opening_hours">Åpningstider</label>
        <input
          type="text"
          id="opening_hours"
          name="opening_hours"
          placeholder="Tu-Fr 09:00-16:30; Sa 10:30-14:30; Mo,Su,PH off"
          value={currentOpeningHours}
        />
        <span class="form-hint">
          <a
            href="https://wiki.openstreetmap.org/wiki/Key:opening_hours#Explanation_by_example"
            target="_blank"
            rel="noreferrer"
          >
            Se format
          </a>
        </span>
      </div>

      <fieldset class="form-fieldset">
        <legend>Adresse</legend>
        <div class="address-grid">
          <div class="form-section">
            <label for="street">Gate</label>
            <input
              type="text"
              id="street"
              name="street"
              value={currentStreet}
            />
          </div>
          <div class="form-section">
            <label for="housenumber">Nr.</label>
            <input
              type="text"
              id="housenumber"
              name="housenumber"
              value={currentHousenumber}
            />
          </div>
          <div class="form-section">
            <label for="postcode">Postnr.</label>
            <input
              type="text"
              id="postcode"
              name="postcode"
              inputmode="numeric"
              autocomplete="postal-code"
              value={currentPostcode}
            />
          </div>
          <div class="form-section">
            <label for="city">Poststed</label>
            <input type="text" id="city" name="city" value={currentCity} />
          </div>
        </div>
      </fieldset>

      {#if error}
        <div class="form-error">{error}</div>
      {/if}

      <div class="form-actions">
        <button
          type="button"
          class="cancel-button"
          onclick={onCancel}
          disabled={isSubmitting}
        >
          Avbryt
        </button>
        {#if $isOsmLoggedIn}
          <button type="submit" class="submit-button" disabled={isSubmitting}>
            {isSubmitting
              ? "Lagrer..."
              : isCreateMode
                ? "Lagre sted"
                : "Lagre endringer"}
          </button>
        {:else}
          <button
            type="button"
            class="submit-button"
            disabled={isSubmitting}
            onclick={async () => {
              initializeOsmAuthStore();
              await login(getOsmApiLoginOptions());
              void syncOsmAuthState();
            }}
          >
            Logg inn for å lagre
          </button>
        {/if}
      </div>
    </form>
  </div>
{/if}

<style>
  .edit-form-wrapper {
    flex: 1;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    padding-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .edit-form-wrapper :global(.form-actions) {
    margin-top: auto;
  }

  .edit-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .edit-success {
    text-align: center;
    padding: 2rem 0;
  }

  .edit-success-note {
    color: #666;
    font-size: 0.875rem;
  }
</style>
