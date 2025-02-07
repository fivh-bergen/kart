/** Makes a direct URL to the rapid editor for a given node  */
export function makeRapidURL(
  long: number,
  lat: number,
  /** Node id in the format node/918579285 */
  nodeId: string
): string {
  const rapidId = nodeId.replace("node/", "n");
  return `https://rapideditor.org/rapid#map=18.34/${long}/${lat}&background=geovekst-nib&id=${rapidId}`;
}
