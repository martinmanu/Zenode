import { ResolvedShapeConfig } from "../../types/index.js";

/**
 * Generates an SVG path data string for a trapezoid within the given bounding box.
 */
export function trapezoidPath(config: ResolvedShapeConfig): string {
    const { x, y, width, height } = config;
    const offset = width * 0.2; // 20% offset for the top corners
    return `M ${x + offset} ${y}
            L ${x + width - offset} ${y}
            L ${x + width} ${y + height}
            L ${x} ${y + height} Z`;
}
