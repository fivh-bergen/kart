/** Makes a direct URL to the iD editor on OpenStreetMap for a given node  */
export function makeEditorURL(
  /** Node id in the format node/918579285 */
  nodeId: string,
): string {
  const id = nodeId.replace("node/", "");
  return `https://www.openstreetmap.org/edit?editor=id&node=${id}`;
}

/** Makes a direct URL to a Node on OpenStreetMap  */
export function makeNodeURL(
  /** Node id in the format node/918579285 */
  nodeId: string,
): string {
  const id = nodeId.replace("node/", "");
  return `https://www.openstreetmap.org/node/${id}`;
}
