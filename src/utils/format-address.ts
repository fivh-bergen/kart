import type { Address } from "../store/feature";

export function formatAddress({
  buildingNumber,
  street,
  postalCode,
  city,
}: Address): string | undefined {
  const normalizedStreet = street?.trim() || undefined;
  const normalizedBuildingNumber = buildingNumber?.trim() || undefined;
  const normalizedPostalCode = postalCode?.trim() || undefined;
  const normalizedCity = city?.trim() || undefined;

  const streetLine = [normalizedStreet, normalizedBuildingNumber]
    .filter(Boolean)
    .join(" ");
  const locationLine = [normalizedPostalCode, normalizedCity]
    .filter(Boolean)
    .join(" ");

  if (streetLine && locationLine) {
    return `${streetLine}, ${locationLine}`;
  }

  return streetLine || locationLine || undefined;
}
