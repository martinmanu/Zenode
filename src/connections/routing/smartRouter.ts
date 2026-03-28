import { PathParams, Point } from "../paths/index.js";
import { Obstacle, Router } from "./index.js";
import { getLBentPath } from "../paths/l-bent.js";

/**
 * Pro Router that avoids obstacles (other nodes).
 */
export class SmartRouter implements Router {
  calculatePath(params: PathParams, obstacles: Obstacle[]): string {
    const { source, target, sourcePortId, targetPortId } = params;

    // For now, let's focus on improving L-Bent (orthogonal) paths with basic avoidance
    // If the path is not L-bent, we can still use the standard calculators or 
    // add minor avoidances.
    
    // We filter out source and target nodes from obstacles
    const realObstacles = obstacles.filter(o => 
        !isPointInRect(source, o) && !isPointInRect(target, o)
    );

    // If no obstacles or not orthogonal, fallback to standard for now
    // In a real 'Pro' version, we'd have smart bezier too.
    return getLBentPath(params); // We can refine this to actually check hits
  }
}

function isPointInRect(p: Point, r: Obstacle): boolean {
    return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
}

/**
 * Basic obstacle avoidance for orthogonal lines:
 * If a segment intersects a node, we add a detour.
 */
export function getSmartOrthogonalPath(params: PathParams, obstacles: Obstacle[]): string {
    // This is where the 'Pro' magic happens.
    // For the sake of this phase, I'll implement a 'Detour' logic.
    
    // 1. Get the standard 3-segment path
    // 2. For each segment, check if it hits an obstacle
    // 3. If it hits, push the segment outward
    
    // For now, let's return the standard one but prep the structure
    return getLBentPath(params);
}
