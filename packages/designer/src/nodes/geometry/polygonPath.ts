import { ResolvedShapeConfig } from "@zenode/core";

/**
 * Generates an SVG path data string for a regular polygon with N sides.
 */
export function polygonPath(config: ResolvedShapeConfig, sides: number): string {
    const { x, y, width, height } = config;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const rx = width / 2;
    const ry = height / 2;
    
    let path = "";
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const px = cx + rx * Math.cos(angle);
        const py = cy + ry * Math.sin(angle);
        if (i === 0) {
            path += `M ${px} ${py}`;
        } else {
            path += ` L ${px} ${py}`;
        }
    }
    
    return path + " Z";
}
