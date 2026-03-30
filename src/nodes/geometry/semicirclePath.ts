/**
 * Builds an SVG path for a semi-circle that fits within a bounding box.
 * The flat side is at the bottom by default.
 */
export function semicirclePath(
  x: number,
  y: number,
  width: number,
  height: number
): string {
  const rx = width / 2;
  const ry = height; // Use full height as vertical radius for the arc

  // Start at bottom-left, arc to bottom-right, then close back to start
  return `M ${x},${y + height} 
          A ${rx},${ry} 0 0 1 ${x + width},${y + height} 
          Z`;
}
