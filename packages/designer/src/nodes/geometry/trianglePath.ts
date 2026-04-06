import { ResolvedShapeConfig } from "@zenode/core";

/**
 * Generates an SVG path data string for an isosceles triangle within the given bounding box.
 */
export function trianglePath(config: ResolvedShapeConfig): string {
    const { x, y, width, height } = config;
    return `M ${x + width / 2} ${y}
            L ${x + width} ${y + height}
            L ${x} ${y + height} Z`;
}
