import { useStore } from "@nanostores/react";
import {
  $feature,
  $showInfoPanel,
  hideInfoPanel,
  LocationTypeTag,
  type Feature,
} from "../store/feature";
import "./Panel.css";
import type { PropsWithChildren } from "react";
import { formatAddress } from "../utils/format-address";
import { makeEditorURL } from "../utils/make-editor-url";
import KindBadge from "./KindBadge";
import { OpeningHours } from "./OpeningHours";

export const Panel = () => {
  const show = useStore($showInfoPanel);

  const feature = useStore($feature);

  if (show && !feature) {
    return (
      <InfoPanel onClose={hideInfoPanel} title="Om tjenesten">
        <ServiceInfo />
      </InfoPanel>
    );
  } else if (show && feature) {
    return (
      <InfoPanel onClose={hideInfoPanel} title={feature.name}>
        <FeatureInfo feature={feature} />
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
        <button
          id="panel-close"
          className="close-button"
          aria-label="Lukk"
          onClick={onClose}
        >
          &times;
        </button>

        <h1 id="feature-name">{title}</h1>

        <div className="panel-body">{children}</div>
      </div>
    </div>
  );
};

interface FeatureInfoProps {
  feature: Feature;
}
const FeatureInfo: React.FC<FeatureInfoProps> = ({ feature }) => {
  const address = formatAddress(feature.address);

  return (
    <>
      <KindBadge kind={feature.kind} />
      {feature.tags.map((tag) => ())}

      {address && <div> {address} </div>}
      {feature.description && (
        <p id="feature-description">{feature.description}</p>
      )}

      {feature?.opening_hours && (
        <OpeningHours
          openingHours={feature.opening_hours}
          openingHoursChecked={feature.openingHoursChecked}
        />
      )}

      {feature.website && (
        <a href={feature.website} target="_blank">
          {new URL(feature.website).host.replace("www.", "")}
        </a>
      )}
      {feature.facebook && (
        <a href={feature.facebook} target="_blank">
          Facebook
        </a>
      )}

      <a
        className="edit-link"
        href={makeEditorURL(feature.id)}
        target="_blank"
        rel="noreferrer"
      >
        Oppdater informasjon
      </a>
    </>
  );
};

const ServiceInfo = () => {
  return (
    <>
      <p>
        Velkommen til gjenbruksportalen! Denne tjenesten er utviklet av
        Fremtiden i Våre Hender Bergen med midler fra{" "}
        <a href="https://www.lnu.no" target="_blank">
          LNU
        </a>
        , og er til for å gjøre det enklere for deg å finne bruktbutikker,
        reparasjonssteder og utleiesteder i Bergen.
      </p>
      <p>
        Oppe til venstre kan du velge hvilken type steder du vil se i kartet.
        Ved å trykke på en nål på kartet får du opp detaljer om det stedet.
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
        OpenStreetMap.
      </p>
      <h2>Ofte stilte spørsmål</h2>
      <h3>Har dere riktige åpningstider for påske, jul, sommer, osv.?</h3>
      <p>
        Sannsynligvis ikke. Det er en del jobb å kartlegge avvikende
        åpningstider, så du må nok undersøke dette selv, for eksempel på
        nettsiden til butikken/tjenesten.
      </p>
    </>
  );
};

