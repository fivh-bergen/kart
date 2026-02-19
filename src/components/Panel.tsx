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
import type { PropsWithChildren } from "react";
import { formatAddress } from "../utils/format-address";
import { makeNodeURL } from "../utils/osm-urls";
import DesignationBadge from "./DesignationBadge";
import { OpeningHours } from "./OpeningHours";
import { RxArrowRight, RxHome, RxLink1, RxMobile } from "react-icons/rx";
import { RiFacebookLine, RiInstagramLine } from "react-icons/ri";
import CategoryBadge from "./category-badge";
import { configure, isLoggedIn, login } from "osm-api";
import { getInstagramUsername } from "../utils/instagram";
import { EditNodeForm } from "./EditNodeForm";

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
          <CategoryBadge category={feature.category} />
          {feature.designations.map((designation) => (
            <DesignationBadge tag={designation} />
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
                {getInstagramUsername(feature.instagram) || "Instagram"}
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
          href={makeNodeURL(feature.id)}
          target="_blank"
          rel="noreferrer"
        >
          Vis i OpenStreetMap
        </a>

        {isLoggedIn() ? (
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            Endre
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
