import { useStore } from "@nanostores/react";
import { $map } from "../store/map";
import "./Filter.css";
import { useEffect, useState } from "react";
import type { Category } from "../utils/category";

export const Filter = () => {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const map = useStore($map);

  const isSelected = (kind: Category) => selectedCategories.includes(kind);

  const toggleCategory = (kind: Category) => {
    if (isSelected(kind)) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([kind]);
    }
  };

  useEffect(() => {
    if (map) {
      const mapStyle = map.getStyle();

      if (selectedCategories.length === 0) {
        // show all
        (mapStyle.sources.features as any).filter = null;
      } else {
        (mapStyle.sources.features as any).filter = [
          "in",
          ["get", "fivh:category"],
          ["literal", selectedCategories],
        ];
      }
      map.setStyle(mapStyle);
    }
  }, [selectedCategories, map]);

  return (
    <div className="filter-container">
      <button
        className={
          isSelected("Gjenbruk")
            ? "filter-button filter-button-selected"
            : "filter-button"
        }
        onClick={() => toggleCategory("Gjenbruk")}
      >
        Gjenbruk
      </button>
      <button
        className={
          isSelected("Reparasjon")
            ? "filter-button filter-button-selected"
            : "filter-button"
        }
        onClick={() => toggleCategory("Reparasjon")}
      >
        Reparasjon
      </button>
      <button
        className={
          isSelected("Utlån")
            ? "filter-button filter-button-selected"
            : "filter-button"
        }
        onClick={() => toggleCategory("Utlån")}
      >
        Utlån
      </button>
    </div>
  );
};
