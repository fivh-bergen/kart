import { atom } from "nanostores";
import type { FeatureData } from "../overpass/features";

export type Feature = {
  kind: "repair" | "rental" | "second-hand";
  lat: number;
  long: number;
  id: string;
  name: string;
  opening_hours: string;
  description?: string;
  website?: string;
  facebook?: string;
  address: Address;
};

export interface Address {
  buildingNumber?: string;
  street?: string;
  postalCode?: string;
  city?: string;
}

export const $feature = atom<Feature | null>(null);

export function setFeature(feature: FeatureData) {
  $feature.set({
    kind: feature.properties["fivh:kind"],
    name: feature.properties.name ?? "Navn mangler",
    description: feature.properties?.description ?? "",
    opening_hours: feature.properties.opening_hours ?? "",
    lat: feature.geometry.coordinates[1],
    long: feature.geometry.coordinates[0],
    id: feature.id,
    website: feature.properties.website,
    facebook: feature.properties["contact:facebook"],
    address: {
      street: feature.properties["addr:street"],
      buildingNumber: feature.properties["addr:housenumber"],
      postalCode: feature.properties["addr:postcode"],
      city: feature.properties["addr:city"],
    },
  });
}

export function clearFeature() {
  $feature.set(null);
}

export const $showInfoPanel = atom(false);

export function showInfoPanel() {
  $showInfoPanel.set(true);
}

export function hideInfoPanel() {
  $showInfoPanel.set(false);
}

export enum Tag {
  SecondHandShop = "Bruktbutikk",
  WomensClothes = "Kvinneklær",
  MensClothes = "Herreklær",
  ChildrensClothes = "Barneklær",
  GiveBox = "Gi bort-boks",
  BicycleRepair = "Sykkelreparasjon",
  AssistedSelfService = "Selvbetjening",
  ComputerRepair = "Datareparasjon",
  MobilePhoneRepair = "Telefonreparasjon",
  CameraRepair = "Kamerareparasjon",
  RepairCafe = "Repair Café",
  BicycleRental = "Sykkelutleie",
  BoatRental = "Båtutleie",
  MotorcycleRental = "Motorsykkelutleie",
  ScooterRental = "Scooterutleie",
  SkiRental = "Skiutleie",
  ToolHireShop = "Verktøyutleie",
  ToyLibrary = "Lekeutleie",
}
