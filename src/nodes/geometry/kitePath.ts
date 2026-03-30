import { ResolvedShapeConfig } from "../../types/index.js";

/**
 * Generates an SVG path data string for a kite within the given bounding box.
 */
export function kitePath(config: ResolvedShapeConfig): string {
    const { x, y, width, height } = config;
    return `M ${x + width / 2} ${y}
            L ${x + width} ${y + height * 0.35}
            L ${x + width / 2} ${y + height}
            L ${x} ${y + height * 0.35} Z`;
}
