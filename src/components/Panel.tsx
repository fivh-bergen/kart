import { useStore } from "@nanostores/react";
import { $feature, $showInfoPanel, hideInfoPanel } from "../store/feature";
import "./panel.css";
import { OpeningHours } from "./OpeningHours";
import { formatAddress } from "../utils/format-address";
import KindBadge from "./KindBadge";

export const Panel = () => {
  const show = useStore($showInfoPanel);

  const feature = useStore($feature);

  if (!show || !feature) {
    return null;
  } else {
    const address = formatAddress(feature.address);
    return (
      <div id="panel" className="panel">
        <div id="panel-content" className="panel-content">
          <button
            id="panel-close"
            className="close-button"
            aria-label="Lukk"
            onClick={hideInfoPanel}
          >
            &times;
          </button>

          <h1 id="feature-name">{feature.name}</h1>

          <div className="panel-body">
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
              href={`https://rapideditor.org/rapid#map=18.34/${feature.long}/${feature.lat}&background=geovekst-nib&id=n${feature.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Oppdater informasjon
            </a>
          </div>
        </div>
      </div>
    );
  }
};
