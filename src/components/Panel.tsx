import { useStore } from "@nanostores/react";
import { $feature, $showInfoPanel, hideInfoPanel } from "../store/feature";
import "./panel.css";

export const Panel = () => {
  const show = useStore($showInfoPanel);

  const feature = useStore($feature);

  if (!show) {
    return null;
  } else {
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

          <h1 id="feature-name">{feature?.name}</h1>
          <p id="feature-description">{feature?.description}</p>
        </div>
      </div>
    );
  }
};
