import "./Filter.css";
import { useEffect, useState } from "react";

type Category = "rental" | "repair" | "second-hand";

export const Filter = () => {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const isSelected = (kind: Category) => selectedCategories.includes(kind);

  const toggleCategory = (kind: Category) => {
    if (isSelected(kind)) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([kind]);
    }
  };

  useEffect(() => {
    if (selectedCategories.length === 0) {
      // show all
      showCategory("rental");
      showCategory("repair");
      showCategory("second-hand");
    } else {
      // show only the ones that are selected
      hideCategory("rental");
      hideCategory("repair");
      hideCategory("second-hand");

      selectedCategories.forEach((category) => {
        showCategory(category);
      });
    }
  }, [selectedCategories]);

  return (
    <div className="filter-container">
      <button
        className={
          isSelected("second-hand")
            ? "filter-button filter-button-selected"
            : "filter-button"
        }
        onClick={() => toggleCategory("second-hand")}
      >
        Bruktbutikk
      </button>
      <button
        className={
          isSelected("repair")
            ? "filter-button filter-button-selected"
            : "filter-button"
        }
        onClick={() => toggleCategory("repair")}
      >
        Reparasjon
      </button>
      <button
        className={
          isSelected("rental")
            ? "filter-button filter-button-selected"
            : "filter-button"
        }
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
  const currentDisplay = document.documentElement.style.getPropertyValue(
    `--display-${kind}`,
  );

  if (currentDisplay === "none" || currentDisplay === "") {
    document.documentElement.style.setProperty(`--display-${kind}`, "block");
  } else {
    document.documentElement.style.setProperty(`--display-${kind}`, "none");
  }
}

function showCategory(category: Category) {
  document.documentElement.style.setProperty(`--display-${category}`, "block");
}

function hideCategory(category: Category) {
  document.documentElement.style.setProperty(`--display-${category}`, "none");
}
