export interface Point {
  x: number;
  y: number;
}

export interface PathParams {
  source: Point;
  target: Point;
  sourcePortId?: string;
  targetPortId?: string;
}

export type PathCalculator = (params: PathParams) => string;

import { getStraightPath } from "./straight";
import { getCurvedPath } from "./curved";
import { getSShapedPath } from "./s-shaped";
import { getLBentPath } from "./l-bent";

export const PathCalculators: Record<string, PathCalculator> = {
  straight: getStraightPath,
  curved: getCurvedPath,
  "s-shaped": getSShapedPath,
  "l-bent": getLBentPath,
};
