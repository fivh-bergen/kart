export function makeRapidURL(
  long: number,
  lat: number,
  nodeId: string
): string {
  const rapidId = nodeId.replace("node/", "n");
  return `https://rapideditor.org/rapid#map=18.34/${long}/${lat}&background=geovekst-nib&id=${rapidId}`;
}
