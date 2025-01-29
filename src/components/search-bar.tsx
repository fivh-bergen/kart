import json from "../data/features.json";
import lunr from "lunr";
import "./search-bar.css";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { useState, type ChangeEventHandler } from "react";
import { setFeature, showInfoPanel } from "../store/feature";
import type { FeatureJSON } from "../data/types";
import { useStore } from "@nanostores/react";
import { $map } from "../store/map";
import { flyToFeature } from "../utils/pan-map";

const data = json;

const getFeature = (id: string): FeatureJSON | undefined => {
  return data.elements.find((element) => element.id === parseInt(id));
};

const index = lunr(function (this: lunr.Builder) {
  this.ref("id");
  this.field("name");

  data.elements.forEach((doc) => {
    this.add({ id: doc.id, name: doc.tags.name });
  });
});

export const SearchBar = () => {
  const [results, setResults] = useState<lunr.Index.Result[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const map = useStore($map);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const query = e.target.value;
    if (!query) {
      setIsTyping(false);
      setResults([]);
      return;
    }
    setIsTyping(true);
    const results = index.search(`${query}~1`);

    setResults(results);
  };

  const handleSearchResultClick = (feature: FeatureJSON | undefined) => {
    if (!feature) {
      return;
    }
    if (map) {
      flyToFeature(map, feature);
    }
    setFeature(feature);
    showInfoPanel();
  };
  return (
    <div className="search-bar-container">
      <div
        className={
          results.length > 0
            ? "search-line-wrapper search-box-border"
            : "search-line-wrapper"
        }
      >
        <HiMiniMagnifyingGlass size={"1.5rem"} />
        <input
          id=""
          type="text"
          className="search-bar-input"
          placeholder="Søk..."
          onChange={handleChange}
        />
        {isTyping && (
          <button
            aria-label="Clear search"
            className="search-bar-clear"
            onClick={() => {
              setResults([]);
              (
                document.querySelector(".search-bar-input") as HTMLInputElement
              ).value = "";
            }}
          >
            &times;
          </button>
        )}
      </div>

      <div className="search-results">
        {results?.map((result) => (
          <button
            className="search-results-item"
            key={result.ref}
            onClick={() => handleSearchResultClick(getFeature(result.ref))}
          >
            {getFeature(result.ref)?.tags.name ?? "Unknown"}
          </button>
        ))}
      </div>
    </div>
  );
};
