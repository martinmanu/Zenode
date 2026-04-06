import { PathParams } from "./index.js";

export function getStraightPath(params: PathParams): string {
  const { source, target } = params;
  return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}
