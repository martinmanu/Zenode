import { PathParams } from "../paths/index.js";
import { Obstacle, Router } from "./index.js";
/**
 * Pro Router that avoids obstacles (other nodes).
 */
export declare class SmartRouter implements Router {
    calculatePath(params: PathParams, obstacles: Obstacle[]): string;
}
/**
 * Basic obstacle avoidance for orthogonal lines:
 * If a segment intersects a node, we add a detour.
 */
export declare function getSmartOrthogonalPath(params: PathParams, obstacles: Obstacle[]): string;
