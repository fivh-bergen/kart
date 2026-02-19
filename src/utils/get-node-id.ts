/** Extracts node ID from a string in the format "node/{id}" */
export function getNodeId(nodeString: string): number {
  const match = nodeString.match(/^node\/(\d+)$/);
  if (!match) {
    throw new Error(`Invalid node string format: ${nodeString}`);
  }
  return parseInt(match[1], 10);
}
