import { ResolvedShapeConfig } from "@zenode/core";

/**
 * Generates an SVG path data string for an ellipse centered within the given bounding box.
 */
export function ellipsePath(config: ResolvedShapeConfig): string {
    const { x, y, width, height } = config;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const rx = width / 2;
    const ry = height / 2;

    return `M ${cx} ${cy - ry}
            A ${rx} ${ry} 0 1 1 ${cx} ${cy + ry}
            A ${rx} ${ry} 0 1 1 ${cx} ${cy - ry} Z`;
}
