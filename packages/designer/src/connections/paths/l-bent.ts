import { PathParams, Point } from "./index.js";

/**
 * Orthogonal connector that respects port directions to avoid shape overlap.
 */
export function getLBentPath(params: PathParams): string {
  const { source, target, sourcePortId, targetPortId } = params;

  const standoff = 20; // Distance to move away from port before turning

  const getOffset = (portId: string | undefined, point: Point) => {
    switch (portId) {
      case "top": return { x: point.x, y: point.y - standoff };
      case "bottom": return { x: point.x, y: point.y + standoff };
      case "left": return { x: point.x - standoff, y: point.y };
      case "right": return { x: point.x + standoff, y: point.y };
      default: return null;
    }
  };

  const sOff = getOffset(sourcePortId, source);
  const tOff = getOffset(targetPortId, target);

  // If we can't determine offsets, fall back to simple mid-way routing
  if (!sOff || !tOff) {
    const midX = source.x + (target.x - source.x) / 2;
    return `M ${source.x} ${source.y} L ${midX} ${source.y} L ${midX} ${target.y} L ${target.x} ${target.y}`;
  }

  // 3-segment orthogonal routing (Z-shape or U-shape)
  // 1. exit source
  // 2. intermediate horizontal/vertical
  // 3. enter target

  const points: Point[] = [source, sOff];

  // Logic to determine intermediate points based on port orientations
  if ((sourcePortId === "top" || sourcePortId === "bottom") && (targetPortId === "top" || targetPortId === "bottom")) {
      // Both vertical
      const midY = sOff.y + (tOff.y - sOff.y) / 2;
      points.push({ x: sOff.x, y: midY });
      points.push({ x: tOff.x, y: midY });
  } else if ((sourcePortId === "left" || sourcePortId === "right") && (targetPortId === "left" || targetPortId === "right")) {
      // Both horizontal
      const midX = sOff.x + (tOff.x - sOff.x) / 2;
      points.push({ x: midX, y: sOff.y });
      points.push({ x: midX, y: tOff.y });
  } else {
      // Mixed or different axes (one vertical, one horizontal)
      // Standard L-shape between the two standoff points
      if (sourcePortId === "top" || sourcePortId === "bottom") {
          points.push({ x: sOff.x, y: tOff.y });
      } else {
          points.push({ x: tOff.x, y: sOff.y });
      }
  }

  points.push(tOff);
  points.push(target);

  return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
}
