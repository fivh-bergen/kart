import { useEffect, useMemo, useState } from "react";
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
  $isOsmLoggedIn,
  initializeOsmAuthStore,
  syncOsmAuthState,
} from "../store/auth";
import { addGhostFeature } from "../store/ghost-feature";
import { useStore } from "@nanostores/react";

export type OSMChangePayload = {
  create: any[];
  modify: any[];
  delete: any[];
};

export type ChangesetUploadPayload = {
  tags: Record<string, string>;
  diff: OSMChangePayload;
};

export type BuildChangesetArgs = {
  mode: "edit" | "create";
  feature?: Feature;
  location?: NewFeatureLocation;
  selectedCategory: CategoryName;
  selectedDesignations: string[];
  initialDesignations: string[];
  updatedTags: Record<string, string>;
  name: string;
  node?: any;
  defaultPayload: ChangesetUploadPayload;
};

type EditModeProps = {
  mode?: "edit";
  feature: Feature;
  onCancel: () => void;
  buildChangeset?: (
    args: BuildChangesetArgs,
  ) => ChangesetUploadPayload | Promise<ChangesetUploadPayload>;
};

type CreateModeProps = {
  mode: "create";
  location: NewFeatureLocation;
  onCancel: () => void;
  buildChangeset?: (
    args: BuildChangesetArgs,
  ) => ChangesetUploadPayload | Promise<ChangesetUploadPayload>;
};

export type EditNodeFormProps = EditModeProps | CreateModeProps;

const fallbackCategoryTags: Record<CategoryName, Record<string, string>> = {
  reuse: { shop: "second_hand" },
  rental: { shop: "rental" },
  repair: { shop: "repair" },
};

export const EditNodeForm: React.FC<EditNodeFormProps> = (props) => {
  const mode = props.mode ?? "edit";
  const isCreateMode = mode === "create";
  const feature = "feature" in props ? props.feature : undefined;
  const location = "location" in props ? props.location : undefined;
  const { onCancel } = props;
  const loggedIn = useStore($isOsmLoggedIn);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoadingNode, setIsLoadingNode] = useState(!isCreateMode);
  const [liveNodeTags, setLiveNodeTags] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryName>(
    isCreateMode ? "reuse" : (feature?.category ?? "reuse"),
  );
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>(
    [],
  );
  const [initialDesignations, setInitialDesignations] = useState<string[]>([]);

  useEffect(() => {
    initializeOsmAuthStore();
    void syncOsmAuthState();
  }, []);

  useEffect(() => {
    if (isCreateMode) {
      setIsLoadingNode(false);
      setLiveNodeTags(null);
      setSelectedCategory("reuse");
      setSelectedDesignations([]);
      setInitialDesignations([]);
      return;
    }

    if (!feature) {
      return;
    }

    let cancelled = false;

    const loadLiveNode = async () => {
      try {
        configureOsmApi();

        const [node] = await getFeature("node", getNodeId(feature.id));
        if (cancelled) {
          return;
        }

        const nodeTags = node.tags ?? {};
        setLiveNodeTags(nodeTags);
        setSelectedCategory(inferCategoryFromOsmTags(nodeTags));

        const designationsFromNode = getDesignationsFromTags(nodeTags);

        // Respect `editable` flag — only editable designations are part of the form state
        const editableDesignations = designationsFromNode.filter(
          isDesignationEditable,
        );
        setSelectedDesignations(editableDesignations);
        setInitialDesignations(editableDesignations);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Kunne ikke hente oppdaterte data fra OpenStreetMap",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingNode(false);
        }
      }
    };

    loadLiveNode();

    return () => {
      cancelled = true;
    };
  }, [isCreateMode, feature?.id]);

  const designationGroups = useMemo(() => {
    const editableDesignationsForCategory = getDesignationsForCategory(
      selectedCategory,
    ).filter(isDesignationEditable);

    return groupDesignationsByConflict(editableDesignationsForCategory);
  }, [selectedCategory]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!loggedIn) {
      setError("Du må logge inn med OpenStreetMap for å lagre");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
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
      setError("Navn er påkrevd");
      setIsSubmitting(false);
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
        if (!feature) {
          throw new Error("Mangler feature for redigering");
        }

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
        const currentOpeningHours =
          withDesignationChanges["opening_hours"]?.trim() ?? "";
        const hasOpeningHoursChanged =
          normalizedOpeningHours !== currentOpeningHours;
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

        const defaultPayload: ChangesetUploadPayload = {
          tags: {
            created_by: "Gjenbruksportalen",
            comment: `Updated ${selectedCategory}: ${name}`,
          },
          diff: {
            create: [],
            modify: [updatedNode],
            delete: [],
          },
        };

        const payload = props.buildChangeset
          ? await props.buildChangeset({
              mode,
              feature,
              selectedCategory,
              selectedDesignations,
              initialDesignations,
              updatedTags,
              name,
              node,
              defaultPayload,
            })
          : defaultPayload;

        await uploadChangeset(payload.tags, payload.diff);
      } else {
        if (!location) {
          throw new Error("Mangler lokasjon for nytt sted");
        }

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
          ...(instagram?.trim() && { "contact:instagram": instagram.trim() }),
          ...(facebook?.trim() && { "contact:facebook": facebook.trim() }),
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

        const defaultPayload: ChangesetUploadPayload = {
          tags: {
            created_by: "Gjenbruksportalen",
            comment: `Added ${selectedCategory}: ${name}`,
          },
          diff: {
            create: [
              {
                type: "node",
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
        };

        const payload = props.buildChangeset
          ? await props.buildChangeset({
              mode,
              location,
              selectedCategory,
              selectedDesignations,
              initialDesignations,
              updatedTags,
              name,
              defaultPayload,
            })
          : defaultPayload;

        await uploadChangeset(payload.tags, payload.diff);

        addGhostFeature({
          name: name.trim(),
          category: selectedCategory,
          lat: location.lat,
          long: location.long,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        hideInfoPanel();
      }, 2000);
    } catch (err) {
      console.error("Failed to update node:", err);
      setError(
        err instanceof Error ? err.message : "Kunne ikke oppdatere stedet",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="edit-form-wrapper">
        <div className="edit-success">
          <p>
            ✓ {isCreateMode ? "Stedet ble lagt til!" : "Stedet ble oppdatert!"}
          </p>
          <p className="edit-success-note">
            {isCreateMode
              ? "Det kan ta litt tid før stedet vises på kartet."
              : "Det kan ta litt tid før endringene vises på kartet."}
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingNode) {
    return (
      <div className="edit-form-wrapper">
        <p>Laster oppdaterte data fra OpenStreetMap...</p>
      </div>
    );
  }

  const currentTags = liveNodeTags ?? {};
  const currentName =
    typeof currentTags["name"] === "string"
      ? currentTags["name"]
      : (feature?.name ?? "");
  const currentDescription =
    typeof currentTags["description"] === "string"
      ? currentTags["description"]
      : (feature?.description ?? "");
  const currentWebsite =
    typeof currentTags["website"] === "string"
      ? currentTags["website"]
      : (feature?.website ?? "");
  const currentInstagram =
    typeof currentTags["contact:instagram"] === "string"
      ? currentTags["contact:instagram"]
      : (feature?.instagram ?? "");
  const currentFacebook =
    typeof currentTags["contact:facebook"] === "string"
      ? currentTags["contact:facebook"]
      : (feature?.facebook ?? "");
  const currentPhone =
    typeof currentTags["phone"] === "string"
      ? currentTags["phone"]
      : (feature?.phone ?? "");
  const currentEmail =
    typeof currentTags["contact:email"] === "string"
      ? currentTags["contact:email"]
      : typeof currentTags["email"] === "string"
        ? currentTags["email"]
        : (feature?.email ?? "");
  const currentOpeningHours =
    typeof currentTags["opening_hours"] === "string"
      ? currentTags["opening_hours"]
      : (feature?.opening_hours ?? "");
  const currentStreet =
    typeof currentTags["addr:street"] === "string"
      ? currentTags["addr:street"]
      : (feature?.address?.street ?? "");
  const currentHousenumber =
    typeof currentTags["addr:housenumber"] === "string"
      ? currentTags["addr:housenumber"]
      : (feature?.address?.buildingNumber ?? "");
  const currentPostcode =
    typeof currentTags["addr:postcode"] === "string"
      ? currentTags["addr:postcode"]
      : (feature?.address?.postalCode ?? "");
  const currentCity =
    typeof currentTags["addr:city"] === "string"
      ? currentTags["addr:city"]
      : (feature?.address?.city ?? "");

  return (
    <div className="edit-form-wrapper">
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-section">
          <label htmlFor="name" className="required">
            Navn
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={currentName}
            required
          />
        </div>

        <div className="form-section">
          <label htmlFor="category">Kategori</label>
          <select
            id="category"
            name="category"
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value as CategoryName)
            }
          >
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {designationGroups.map((group) => (
          <fieldset className="form-fieldset" key={group.key}>
            <legend
              className={
                ["group:shop", "group:repairer", "group:renter"].includes(
                  group.key,
                )
                  ? "required"
                  : ""
              }
            >
              {group.label}
            </legend>
            <div className="designation-grid">
              {/* some groups should never be allowed to select the "none" option,
                  forcing the user to pick one of the real values. */}
              {!group.multiValue &&
                !["group:shop", "group:repairer", "group:renter"].includes(
                  group.key,
                ) && (
                  <label
                    className="designation-option"
                    htmlFor={`tag-${group.key}-none`}
                  >
                    <input
                      type="radio"
                      name={`exclusive-${group.key}`}
                      id={`tag-${group.key}-none`}
                      checked={
                        !group.designations.some((d) =>
                          selectedDesignations.includes(d),
                        )
                      }
                      onChange={() => {
                        setSelectedDesignations((current) =>
                          current.filter(
                            (d) => !group.designations.includes(d),
                          ),
                        );
                      }}
                    />
                    <span>Ingen</span>
                  </label>
                )}
              {group.designations.map((designationName) => (
                <label
                  className="designation-option"
                  htmlFor={`tag-${designationName}`}
                  key={designationName}
                >
                  {group.multiValue ? (
                    <input
                      type="checkbox"
                      id={`tag-${designationName}`}
                      checked={selectedDesignations.includes(designationName)}
                      onChange={(event) => {
                        setSelectedDesignations((current) => {
                          if (event.target.checked) {
                            if (current.includes(designationName)) {
                              return current;
                            }
                            return [...current, designationName];
                          }
                          return current.filter(
                            (item) => item !== designationName,
                          );
                        });
                      }}
                    />
                  ) : (
                    <input
                      type="radio"
                      name={`exclusive-${group.key}`}
                      id={`tag-${designationName}`}
                      checked={selectedDesignations.includes(designationName)}
                      // enforce selection for a few critical groups
                      required={[
                        "group:shop",
                        "group:repairer",
                        "group:renter",
                      ].includes(group.key)}
                      onChange={() => {
                        setSelectedDesignations((current) => {
                          const filtered = current.filter(
                            (d) => !group.designations.includes(d),
                          );
                          return [...filtered, designationName];
                        });
                      }}
                    />
                  )}
                  <span>{getDesignationLabel(designationName)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="form-section">
          <label htmlFor="description">Beskrivelse</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={currentDescription}
          />
        </div>

        <div className="form-section">
          <label htmlFor="website">Nettside</label>
          <input
            type="url"
            id="website"
            name="website"
            defaultValue={currentWebsite}
          />
        </div>

        <div className="form-section">
          <label htmlFor="instagram">Instagram</label>
          <input
            type="url"
            id="instagram"
            name="instagram"
            placeholder="https://instagram.com/..."
            defaultValue={currentInstagram}
          />
        </div>

        <div className="form-section">
          <label htmlFor="facebook">Facebook</label>
          <input
            type="url"
            id="facebook"
            name="facebook"
            placeholder="https://facebook.com/..."
            defaultValue={currentFacebook}
          />
        </div>

        <div className="form-section">
          <label htmlFor="phone">Telefon</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={currentPhone}
          />
        </div>

        <div className="form-section">
          <label htmlFor="email">E-post</label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={currentEmail}
          />
        </div>

        <div className="form-section">
          <label htmlFor="opening_hours">Åpningstider</label>
          <input
            type="text"
            id="opening_hours"
            name="opening_hours"
            placeholder="Tu-Fr 09:00-16:30; Sa 10:30-14:30; Mo,Su,PH off"
            defaultValue={currentOpeningHours}
          />
          <span className="form-hint">
            <a
              href="https://wiki.openstreetmap.org/wiki/Key:opening_hours#Explanation_by_example"
              target="_blank"
              rel="noreferrer"
            >
              Se format
            </a>
          </span>
        </div>

        <fieldset className="form-fieldset">
          <legend>Adresse</legend>
          <div className="address-grid">
            <div className="form-section">
              <label htmlFor="street">Gate</label>
              <input
                type="text"
                id="street"
                name="street"
                defaultValue={currentStreet}
              />
            </div>
            <div className="form-section">
              <label htmlFor="housenumber">Nr.</label>
              <input
                type="text"
                id="housenumber"
                name="housenumber"
                defaultValue={currentHousenumber}
              />
            </div>
            <div className="form-section">
              <label htmlFor="postcode">Postnr.</label>
              <input
                type="text"
                id="postcode"
                name="postcode"
                inputMode="numeric"
                autoComplete="postal-code"
                defaultValue={currentPostcode}
              />
            </div>
            <div className="form-section">
              <label htmlFor="city">Poststed</label>
              <input
                type="text"
                id="city"
                name="city"
                defaultValue={currentCity}
              />
            </div>
          </div>
        </fieldset>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Avbryt
          </button>
          {loggedIn ? (
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Lagrer..."
                : isCreateMode
                  ? "Lagre sted"
                  : "Lagre endringer"}
            </button>
          ) : (
            <button
              type="button"
              className="submit-button"
              disabled={isSubmitting}
              onClick={async () => {
                initializeOsmAuthStore();
                await login(getOsmApiLoginOptions());
                void syncOsmAuthState();
              }}
            >
              Logg inn for å lagre
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
