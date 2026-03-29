/**
 * Builds an SVG path for a rectangle with independent corner radii.
 */
export function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  r1: number,
  r2: number,
  r3: number,
  r4: number
): string {
  r1 = Math.min(r1, width / 2, height / 2);
  r2 = Math.min(r2, width / 2, height / 2);
  r3 = Math.min(r3, width / 2, height / 2);
  r4 = Math.min(r4, width / 2, height / 2);

  return `M ${x + r1},${y}
          H ${x + width - r2}
          A ${r2},${r2} 0 0 1 ${x + width},${y + r2}
          V ${y + height - r3}
          A ${r3},${r3} 0 0 1 ${x + width - r3},${y + height}
          H ${x + r4}
          A ${r4},${r4} 0 0 1 ${x},${y + height - r4}
          V ${y + r1}
          A ${r1},${r1} 0 0 1 ${x + r1},${y} Z`;
}
