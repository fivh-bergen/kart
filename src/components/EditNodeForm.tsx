import { useEffect, useState } from "react";
import { configure, getFeature, uploadChangeset } from "osm-api";
import { getNodeId } from "../utils/get-node-id";
import { hideInfoPanel, type Feature } from "../store/feature";
import {
  CATEGORY_OPTIONS,
  DESIGNATION_OPTIONS_BY_CATEGORY,
  buildManagedOsmTags,
  inferCategoryFromOsmTags,
  getSelectedDesignationNamesFromOsm,
  getManagedOsmTagKeys,
  inferCategoryFromSelectedDesignations,
  type Category,
  type Designation,
} from "../utils/osm-tag-helpers";

export const EditNodeForm: React.FC<{
  feature: Feature;
  onCancel: () => void;
}> = ({ feature, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoadingNode, setIsLoadingNode] = useState(true);
  const [liveNodeTags, setLiveNodeTags] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [selectedDesignations, setSelectedDesignations] = useState<Designation[]>(
    feature.tags,
  );

  useEffect(() => {
    let cancelled = false;

    const loadLiveNode = async () => {
      try {
        configure({
          apiUrl: "https://master.apis.dev.openstreetmap.org",
        });

        const [node] = await getFeature("node", getNodeId(feature.id));
        if (cancelled) {
          return;
        }

        const nodeTags = (node.tags ?? {}) as Record<string, unknown>;
        setLiveNodeTags(nodeTags);

        const categoryFromNode = inferCategoryFromOsmTags(nodeTags);
        setSelectedDesignations(
          getSelectedDesignationNamesFromOsm(nodeTags, categoryFromNode),
        );
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
  }, [feature.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const website = formData.get("website") as string;
    const phone = formData.get("phone") as string;
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

    const inferredCategory =
      inferCategoryFromSelectedDesignations(selectedDesignations);
    const managedOsmTags = buildManagedOsmTags(
      inferredCategory,
      selectedDesignations,
    );

    try {
      configure({
        apiUrl: "https://master.apis.dev.openstreetmap.org",
      });

      const [node] = await getFeature("node", getNodeId(feature.id));

      const preservedTags = { ...node.tags };
      delete preservedTags["fivh:category"];
      delete preservedTags["fivh:tags"];
      for (const key of getManagedOsmTagKeys()) {
        delete preservedTags[key];
      }

      const updatedTags = {
        ...preservedTags,
        name: name.trim(),
        ...managedOsmTags,
        ...(description?.trim() && { description: description.trim() }),
        ...(website?.trim() && { website: website.trim() }),
        ...(phone?.trim() && { phone: phone.trim() }),
        ...(openingHours?.trim() && { opening_hours: openingHours.trim() }),
        ...(street?.trim() && { "addr:street": street.trim() }),
        ...(housenumber?.trim() && { "addr:housenumber": housenumber.trim() }),
        ...(postcode?.trim() && { "addr:postcode": postcode.trim() }),
        ...(city?.trim() && { "addr:city": city.trim() }),
      };

      const updatedNode = { ...node, tags: updatedTags };

      await uploadChangeset(
        {
          created_by: "Gjenbruksportalen",
          comment: `Updated ${inferredCategory}: ${name}`,
        },
        {
          create: [],
          modify: [updatedNode],
          delete: [],
        },
      );

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
        <div className="create-success">
          <p>✓ Stedet ble oppdatert!</p>
          <p className="create-success-note">
            Det kan ta litt tid før endringene vises på kartet.
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
      : feature.name;
  const currentDescription =
    typeof currentTags["description"] === "string"
      ? currentTags["description"]
      : (feature.description ?? "");
  const currentWebsite =
    typeof currentTags["website"] === "string"
      ? currentTags["website"]
      : (feature.website ?? "");
  const currentPhone =
    typeof currentTags["phone"] === "string"
      ? currentTags["phone"]
      : (feature.phone ?? "");
  const currentOpeningHours =
    typeof currentTags["opening_hours"] === "string"
      ? currentTags["opening_hours"]
      : (feature.opening_hours ?? "");
  const currentStreet =
    typeof currentTags["addr:street"] === "string"
      ? currentTags["addr:street"]
      : (feature.address?.street ?? "");
  const currentHousenumber =
    typeof currentTags["addr:housenumber"] === "string"
      ? currentTags["addr:housenumber"]
      : (feature.address?.buildingNumber ?? "");
  const currentPostcode =
    typeof currentTags["addr:postcode"] === "string"
      ? currentTags["addr:postcode"]
      : (feature.address?.postalCode ?? "");
  const currentCity =
    typeof currentTags["addr:city"] === "string"
      ? currentTags["addr:city"]
      : (feature.address?.city ?? "");

  return (
    <div className="edit-form-wrapper">
      <form onSubmit={handleSubmit} className="create-form">
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

        <fieldset className="form-fieldset">
          <legend>Tags</legend>
          {CATEGORY_OPTIONS.map((categoryOption) => (
            <div key={categoryOption.value}>
              <h3
                style={{
                  fontSize: "0.9rem",
                  marginTop: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                {categoryOption.label}
              </h3>
              <div className="address-grid">
                {DESIGNATION_OPTIONS_BY_CATEGORY[categoryOption.value].map(
                  (designationName) => (
                    <div className="form-section" key={designationName}>
                      <label htmlFor={`tag-${designationName}`}>
                        <input
                          type="checkbox"
                          id={`tag-${designationName}`}
                          checked={selectedDesignations.includes(
                            designationName,
                          )}
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
                        />{" "}
                        {designationName}
                      </label>
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </fieldset>

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
          <label htmlFor="phone">Telefon</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={currentPhone}
          />
        </div>

        <div className="form-section">
          <label htmlFor="opening_hours">Åpningstider</label>
          <input
            type="text"
            id="opening_hours"
            name="opening_hours"
            defaultValue={currentOpeningHours}
          />
          <span className="form-hint">
            <a
              href="https://wiki.openstreetmap.org/wiki/Key:opening_hours"
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
                defaultValue={currentPostcode}
              />
            </div>
            <div className="form-section">
              <label htmlFor="city">By</label>
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
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Lagrer..." : "Lagre endringer"}
          </button>
        </div>
      </form>
    </div>
  );
};
