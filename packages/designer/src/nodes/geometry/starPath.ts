/**
 * Builds an SVG path for a 5-pointed star centered in a box.
 */
export function starPath(
  x: number,
  y: number,
  width: number,
  height: number,
  points: number = 5,
  innerRadiusRatio: number = 0.5
): string {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2;
  const ry = height / 2;
  const rxInner = rx * innerRadiusRatio;
  const ryInner = ry * innerRadiusRatio;
  
  const pathPoints: string[] = [];
  const count = points * 2;
  
  for (let i = 0; i < count; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const isOuter = i % 2 === 0;
    const currRx = isOuter ? rx : rxInner;
    const currRy = isOuter ? ry : ryInner;
    
    const px = cx + currRx * Math.cos(angle);
    const py = cy + currRy * Math.sin(angle);
    pathPoints.push(`${px},${py}`);
  }
  
  return `M ${pathPoints.join(" L ")} Z`;
}
