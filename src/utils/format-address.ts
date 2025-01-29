import type { Address } from "../store/feature";

export function formatAddress({
  buildingNumber,
  street,
  postalCode,
  city,
}: Address): string | undefined {
  if (!buildingNumber && !street && !postalCode && !city) {
    return undefined;
  }

  if (
    buildingNumber !== undefined &&
    street !== undefined &&
    postalCode !== undefined &&
    city !== undefined
  ) {
    return `${street} ${buildingNumber}, ${postalCode} ${city}`;
  } else if (
    buildingNumber !== undefined &&
    street !== undefined &&
    postalCode !== undefined
  ) {
    return `${street} ${buildingNumber}, ${postalCode}`;
  } else if (
    buildingNumber !== undefined &&
    street !== undefined &&
    city !== undefined
  ) {
    return `${street} ${buildingNumber}, ${city}`;
  } else if (buildingNumber !== undefined && street !== undefined) {
    return `${street} ${buildingNumber}`;
  }
  return undefined;
}
