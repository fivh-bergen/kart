import "./Filter.css";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $map } from "../store/map";
import { categories, type CategoryName } from "../utils/category";

export const Filter = () => {
  const [selectedCategories, setSelectedCategories] = useState<CategoryName[]>(
    [],
  );

  const map = useStore($map);

  const isSelected = (kind: CategoryName) => selectedCategories.includes(kind);

  const toggleCategory = (kind: CategoryName) => {
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
      {categories.map((c) => (
        <button
          key={c.name}
          className={
            isSelected(c.name)
              ? "filter-button filter-button-selected"
              : "filter-button"
          }
          onClick={() => toggleCategory(c.name)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
};
