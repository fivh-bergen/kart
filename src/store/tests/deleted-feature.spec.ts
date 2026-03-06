// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import {
  deletedFeatures,
  initializeDeletedFeatures,
  addDeletedFeature,
} from "../deleted-feature";

beforeEach(() => {
  window.localStorage.clear();
  deletedFeatures.set([]);
});

describe("deleted-feature store", () => {
  it("reads from localStorage on initialization", () => {
    window.localStorage.setItem(
      "fivh:deleted-features",
      JSON.stringify(["a", "b"]),
    );
    initializeDeletedFeatures();
    expect(get(deletedFeatures)).toEqual(["a", "b"]);
  });

  it("persists ids when added", () => {
    initializeDeletedFeatures();
    addDeletedFeature("foo");
    expect(get(deletedFeatures)).toEqual(["foo"]);
    expect(
      JSON.parse(window.localStorage.getItem("fivh:deleted-features")!),
    ).toEqual(["foo"]);
  });

  it("does not duplicate ids", () => {
    initializeDeletedFeatures();
    addDeletedFeature("x");
    addDeletedFeature("x");
    expect(get(deletedFeatures)).toEqual(["x"]);
  });
});
