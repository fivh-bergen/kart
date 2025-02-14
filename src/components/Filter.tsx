import "./Filter.css";
import { toggleCategory as toggleFilter } from "../store/filter";

export const Filter = () => {
  const toggleCategory = (kind: "rental" | "repair" | "second-hand") => {
    toggleCategoryVisibility(kind);
    toggleFilter(kind);
  };

  return (
    <div className="filter-container">
      <button
        className="filter-button"
        onClick={() => toggleCategory("second-hand")}
      >
        Gjenbruk
      </button>
      <button
        className="filter-button"
        onClick={() => toggleCategory("repair")}
      >
        Reparasjon
      </button>
      <button
        className="filter-button"
        onClick={() => toggleCategory("rental")}
      >
        Utleie
      </button>
    </div>
  );
};

/** Mutates the CSS variables --display-rental, --display-repair or --display-second-hand
 *  to show or hide markers in the map */
function toggleCategoryVisibility(kind: "rental" | "repair" | "second-hand") {
  if (
    document.documentElement.style.getPropertyValue(`--display-${kind}`) ===
    "none"
  ) {
    document.documentElement.style.setProperty(`--display-${kind}`, "bock");
  } else {
    document.documentElement.style.setProperty(`--display-${kind}`, "none");
  }
}
