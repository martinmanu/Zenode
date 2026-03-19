export function snapToGrid(
  x: number,
  y: number,
  grid: number
): { x: number; y: number } {
  const snappedX = Math.round(x / grid) * grid;
  const snappedY = Math.round(y / grid) * grid;
  return { x: snappedX, y: snappedY };
}

/**
 * Generates a unique shape ID based on type and existing shapes.
 */
export function generateShapeId(baseId: string, shapeMap: Map<unknown, unknown>): string {
  let count = 1;
  while (shapeMap.has(`${baseId}-${count}`)) {
    count++;
  }
  return `${baseId}-${count}`;
}

/**
 * Generates a unique id for a placed node (nanoid-style short id).
 * Uses crypto.randomUUID when available, otherwise a time-based fallback.
 */
export function generatePlacedNodeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}