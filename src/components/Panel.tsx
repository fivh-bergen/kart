import { useStore } from "@nanostores/react";
import {
  $feature,
  $showInfoPanel,
  hideInfoPanel,
  type Feature,
} from "../store/feature";
import "./Panel.css";
import type { PropsWithChildren } from "react";
import { formatAddress } from "../utils/format-address";
import KindBadge from "./KindBadge";
import { OpeningHours } from "./OpeningHours";
import { makeEditorURL } from "../utils/make-editor-url";

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

      {address && <div> {address} </div>}
      {feature.description && (
        <p id="feature-description">{feature.description}</p>
      )}

      {feature?.opening_hours && (
        <OpeningHours openingHours={feature.opening_hours} />
      )}

      {feature.website && (
        <a href={feature.website} target="_blank">
          Nettside
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
      <p>Denne tjenesten er utviklet av Fremtiden i Våre Hender Bergen.</p>
    </>
  );
};
