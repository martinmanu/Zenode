import { PathParams } from "../paths/index.js";

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

/**
 * Interface for intelligent path calculation (e.g. for obstacle avoidance).
 */
export interface Router {
  calculatePath(params: PathParams, obstacles: Obstacle[]): string;
}
