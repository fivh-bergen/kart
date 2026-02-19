import { useStore } from "@nanostores/react";
import { useState } from "react";
import {
  $feature,
  $showInfoPanel,
  getSelectedFeature,
  hideInfoPanel,
  type Feature,
} from "../store/feature";
import "./Panel.css";
import "./CreateNodePanel.css";
import type { PropsWithChildren } from "react";
import { formatAddress } from "../utils/format-address";
import { makeEditorURL } from "../utils/make-editor-url";
import TagBadge from "./TagBadge";
import { OpeningHours } from "./OpeningHours";
import { RxArrowRight, RxHome, RxLink1, RxMobile } from "react-icons/rx";
import { RiFacebookLine, RiInstagramLine } from "react-icons/ri";
import KindBadge from "./kind-badge";
import {
  configure,
  getFeature,
  isLoggedIn,
  login,
  uploadChangeset,
} from "osm-api";
import { getNodeId } from "../utils/get-node-id";

const KIND_OPTIONS = [
  {
    value: "Bruktbutikk",
    label: "Bruktbutikk",
    osmTags: { shop: "second_hand" },
  },
  { value: "Utlån", label: "Utlån", osmTags: { amenity: "rental" } },
  { value: "Reparasjon", label: "Reparasjon", osmTags: { craft: "repair" } },
] as const;

export const Panel = () => {
  const show = useStore($showInfoPanel);
  const featureId = useStore($feature);

  if (show && !featureId) {
    return (
      <InfoPanel onClose={hideInfoPanel} title="Om tjenesten">
        <ServiceInfo />
      </InfoPanel>
    );
  } else if (show && featureId) {
    const feature = getSelectedFeature(featureId);
    if (!feature) {
      return null;
    }
    return (
      <InfoPanel onClose={hideInfoPanel} title={feature.name}>
        <FeatureInfo feature={feature} key={feature.id} />
      </InfoPanel>
    );
  } else {
    return null;
  }
};

interface InfoPanelProps {
  title: string;
  onClose: () => void;
}

const InfoPanel: React.FC<PropsWithChildren<InfoPanelProps>> = ({
  title,
  onClose,
  children,
}) => {
  return (
    <div id="panel" className="panel">
      <div id="panel-content" className="panel-content">
        <div className="panel-header">
          <h1 id="feature-name">{title}</h1>
          <button
            id="panel-close"
            className="close-button"
            aria-label="Lukk"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="panel-main-content">{children}</div>
      </div>
    </div>
  );
};

interface FeatureInfoProps {
  feature: Feature;
}
const FeatureInfo: React.FC<FeatureInfoProps> = ({ feature }) => {
  const [isEditing, setIsEditing] = useState(false);
  const address = formatAddress(feature.address);

  return isEditing ? (
    <EditNodeForm feature={feature} onCancel={() => setIsEditing(false)} />
  ) : (
    <>
      <div className="panel-lead">
        <div className="tags-box">
          <KindBadge kind={feature.kind} />
          {feature.tags.map((tag) => (
            <TagBadge tag={tag} />
          ))}
        </div>

        {feature.description && (
          <div className="description-box">
            <p id="feature-description">{feature.description}</p>
          </div>
        )}
      </div>
      {(address ||
        feature.opening_hours ||
        feature.website ||
        feature.facebook ||
        feature.phone) && (
        <div className="panel-body">
          {address && (
            <div className="feature-info-flex">
              <RxHome size={"1.5rem"} />
              <a
                className="subtle-link"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
              >
                {address}
              </a>
            </div>
          )}

          {feature?.opening_hours && (
            <OpeningHours
              openingHours={feature.opening_hours}
              openingHoursChecked={feature.openingHoursChecked}
            />
          )}

          {feature.website && (
            <div className="feature-info-flex">
              <RxLink1 size={"1.5rem"} />
              <a className="subtle-link" href={feature.website} target="_blank">
                {new URL(feature.website).host.replace("www.", "")}
              </a>
            </div>
          )}
          {feature.instagram && (
            <div className="feature-info-flex">
              <RiInstagramLine size={"1.5rem"} />
              <a
                className="subtle-link"
                href={feature.instagram}
                target="_blank"
              >
                Instagram
              </a>
            </div>
          )}
          {feature.facebook && (
            <div className="feature-info-flex">
              <RiFacebookLine size={"1.5rem"} />
              <a
                className="subtle-link"
                href={feature.facebook}
                target="_blank"
              >
                Facebook
              </a>
            </div>
          )}

          {feature.phone && (
            <div className="feature-info-flex">
              <RxMobile size={"1.5rem"} />
              <a className="subtle-link" href={`tel:${feature.phone}`}>
                {feature.phone}
              </a>
            </div>
          )}
        </div>
      )}
      <div className="panel-footer">
        <a
          className="edit-link"
          href={makeEditorURL(feature.id)}
          target="_blank"
          rel="noreferrer"
        >
          Endre i OpenStreetMap
        </a>

        {isLoggedIn() ? (
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            Rediger sted
          </button>
        ) : (
          <button
            onClick={async () => {
              configure({
                apiUrl: "https://master.apis.dev.openstreetmap.org",
              });
              await login({
                mode: "popup",
                clientId: "bYTbKd_JTmh--DeetcXg2YLoGA0rJ1kHRjPEqFTrSuE",
                redirectUrl: "https://localhost:4321/kart/auth",
                scopes: ["write_api"],
              });
            }}
          >
            Logg inn for å endre
          </button>
        )}
      </div>
    </>
  );
};

const EditNodeForm: React.FC<{ feature: Feature; onCancel: () => void }> = ({
  feature,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const kind = formData.get("kind") as string;
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

    // Find the OSM tags for the selected kind
    const kindOption = KIND_OPTIONS.find((k) => k.value === kind);
    const osmKindTags = kindOption?.osmTags || { shop: "second_hand" };

    try {
      configure({
        apiUrl: "https://master.apis.dev.openstreetmap.org",
      });

      const [node] = await getFeature("node", getNodeId(feature.id));

      const updatedTags = {
        ...node.tags,
        name: name.trim(),
        "fivh:kind": kind,
        ...osmKindTags,
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
          comment: `Updated ${kind}: ${name}`,
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
            defaultValue={feature.name}
            required
          />
        </div>

        <div className="form-section">
          <label htmlFor="kind" className="required">
            Type sted
          </label>
          <select id="kind" name="kind" defaultValue={feature.kind} required>
            {KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label htmlFor="description">Beskrivelse</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={feature.description || ""}
          />
        </div>

        <div className="form-section">
          <label htmlFor="website">Nettside</label>
          <input
            type="url"
            id="website"
            name="website"
            defaultValue={feature.website || ""}
          />
        </div>

        <div className="form-section">
          <label htmlFor="phone">Telefon</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={feature.phone || ""}
          />
        </div>

        <div className="form-section">
          <label htmlFor="opening_hours">Åpningstider</label>
          <input
            type="text"
            id="opening_hours"
            name="opening_hours"
            defaultValue={feature.opening_hours || ""}
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
                defaultValue={feature.address?.street || ""}
              />
            </div>
            <div className="form-section">
              <label htmlFor="housenumber">Nr.</label>
              <input
                type="text"
                id="housenumber"
                name="housenumber"
                defaultValue={feature.address?.buildingNumber || ""}
              />
            </div>
            <div className="form-section">
              <label htmlFor="postcode">Postnr.</label>
              <input
                type="text"
                id="postcode"
                name="postcode"
                defaultValue={feature.address?.postalCode || ""}
              />
            </div>
            <div className="form-section">
              <label htmlFor="city">By</label>
              <input
                type="text"
                id="city"
                name="city"
                defaultValue={feature.address?.city || ""}
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

const ServiceInfo = () => {
  return (
    <div className="panel-lead">
      <p>
        Velkommen til gjenbruksportalen! Denne tjenesten er utviklet av{" "}
        <a
          href="https://www.framtiden.no/om-oss/lokallag/vestland"
          target="_blank"
        >
          Fremtiden i Våre Hender Bergen
        </a>{" "}
        med midler fra{" "}
        <a href="https://www.lnu.no" target="_blank">
          LNU
        </a>
        , og er til for å gjøre det enklere for deg å finne bruktbutikker,
        reparasjonssteder og utleiesteder i Bergen.
      </p>
      <p>
        Med filterknappene kan du velge hvilken type steder du vil se i kartet.
        Trykk på samme filterknapp igjen for å fjerne filteret. Ved å trykke på
        en nål på kartet får du opp detaljer om det stedet.
      </p>
      <h2>Åpen kildekode, åpen data</h2>
      <p>
        Dette prosjektet har åpen kildekode. Kildekoden og teknisk dokumentasjon
        finnes på{" "}
        <a href="https://github.com/fivh-bergen/kart" target="_blank">
          GitHub
        </a>
        .
      </p>
      <p>
        Informasjonen i kartet kommer fra OpenStreetMap, en åpen database for
        geografisk informasjon som alle kan bruke og alle kan bidra til. Det er
        i bunn og grunn wikipedia i kartform. Hvis du vet om en butikk som ikke
        er på kartet eller ser noen manglende eller gale opplysninger, kan du
        selv rette opp i dette via{" "}
        <a href="https://openstreetmap.org" target="_blank">
          OpenStreetMap.org
        </a>{" "}
        eller via en app som{" "}
        <a href="https://streetcomplete.app/" target="_blank">
          StreetComplete
        </a>{" "}
        eller{" "}
        <a href="https://every-door.app/" target="_blank">
          EveryDoor
        </a>
        .
      </p>
      <p>
        Ved å bidra til OpenStreetMap bidrar du til å holde gjenbruksportalen
        oppdatert, men du bidrar også til flerfoldige andre løsninger som bruker
        data fra OpenStreetMap.
      </p>
      <h2>Ofte stilte spørsmål</h2>
      <h3>Har dere riktige åpningstider for påske, jul, sommer, osv.?</h3>
      <p>
        Sannsynligvis ikke. Det er en del jobb å kartlegge avvikende
        åpningstider, så du må nok undersøke dette selv, for eksempel på
        nettsiden til butikken/tjenesten.
      </p>

      <a className="contact-link" href="mailto:bergen@framtiden.no">
        Kontakt oss på bergen@framtiden.no
        <RxArrowRight size={"1.2rem"} />
      </a>
    </div>
  );
};
