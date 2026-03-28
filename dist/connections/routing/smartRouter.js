import { getLBentPath } from '../paths/l-bent.js';

/**
 * Pro Router that avoids obstacles (other nodes).
 */
class SmartRouter {
    calculatePath(params, obstacles) {
        const { source, target, sourcePortId, targetPortId } = params;
        // For now, let's focus on improving L-Bent (orthogonal) paths with basic avoidance
        // If the path is not L-bent, we can still use the standard calculators or 
        // add minor avoidances.
        // We filter out source and target nodes from obstacles
        obstacles.filter(o => !isPointInRect(source, o) && !isPointInRect(target, o));
        // If no obstacles or not orthogonal, fallback to standard for now
        // In a real 'Pro' version, we'd have smart bezier too.
        return getLBentPath(params); // We can refine this to actually check hits
    }
}
function isPointInRect(p, r) {
    return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
}

export { SmartRouter };
//# sourceMappingURL=smartRouter.js.map
