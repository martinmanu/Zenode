/**
 * Builds an SVG path for an octagon centered in a box.
 */
export function octagonPath(
  x: number,
  y: number,
  width: number,
  height: number
): string {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2;
  const ry = height / 2;
  
  const points: string[] = [];
  for (let i = 0; i < 8; i++) {
    // Offset by PI/8 to have horizontal/vertical sides
    const angle = (i * Math.PI) / 4 + Math.PI / 8;
    const px = cx + rx * Math.cos(angle);
    const py = cy + ry * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  
  return `M ${points.join(" L ")} Z`;
}
