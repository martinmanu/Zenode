/**
 * Builds an SVG path for a regular pentagon centered in a box.
 */
export function pentagonPath(
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
  for (let i = 0; i < 5; i++) {
    // - Math.PI / 2 starts from the top vertex
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const px = cx + rx * Math.cos(angle);
    const py = cy + ry * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  
  return `M ${points.join(" L ")} Z`;
}
