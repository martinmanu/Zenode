import { ShapeRenderer } from "@zenode/core";
import { polygonPath } from "../geometry/polygonPath.js";

/**
 * Nonagon shape renderer using SVG <path>.
 */
export const NonagonRenderer: ShapeRenderer = {
  draw(group, config) {
    const { color, stroke, transparency } = config;
    group
      .append("path")
      .attr("d", polygonPath(config, 9))
      .attr("fill", color)
      .attr("fill-opacity", transparency ?? 1)
      .attr("stroke", stroke.color)
      .attr("stroke-width", stroke.width)
      .attr(
        "stroke-dasharray",
        (stroke as any).strokeDasharray?.length
          ? (stroke as any).strokeDasharray.join(" ")
          : null
      );
  },

  getPath(config) {
    return polygonPath(config, 9);
  },

  getBounds(config) {
    const { x, y, width, height } = config;
    return { x, y, width, height };
  },

  getPorts(config) {
    const { x, y, width, height } = config;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const rx = width / 2;
    const ry = height / 2;

    const ports: any = {
      center: { x: cx, y: cy },
    };

    for (let i = 0; i < 9; i++) {
        const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2;
        ports[`v${i}`] = {
            x: cx + rx * Math.cos(angle),
            y: cy + ry * Math.sin(angle)
        };
    }
    return ports;
  },
};
