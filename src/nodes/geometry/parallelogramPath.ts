import { ResolvedShapeConfig } from "../../types/index.js";

/**
 * Generates an SVG path data string for a parallelogram within the given bounding box.
 */
export function parallelogramPath(config: ResolvedShapeConfig): string {
    const { x, y, width, height } = config;
    const offset = width * 0.2; // 20% offset for the slant
    return `M ${x + offset} ${y}
            L ${x + width} ${y}
            L ${x + width - offset} ${y + height}
            L ${x} ${y + height} Z`;
}
