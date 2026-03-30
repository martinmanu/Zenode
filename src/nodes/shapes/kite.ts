import { ShapeRenderer } from "../../types/index.js";
import { kitePath } from "../geometry/kitePath.js";

/**
 * Kite shape renderer using SVG <path>.
 */
export const KiteRenderer: ShapeRenderer = {
  draw(group, config) {
    const { color, stroke, transparency } = config;
    group
      .append("path")
      .attr("d", kitePath(config))
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
    return kitePath(config);
  },

  getBounds(config) {
    const { x, y, width, height } = config;
    return { x, y, width, height };
  },

  getPorts(config) {
    const { x, y, width, height } = config;
    return {
      top: { x: x + width / 2, y: y },
      right: { x: x + width, y: y + height * 0.35 },
      bottom: { x: x + width / 2, y: y + height },
      left: { x: x, y: y + height * 0.35 },
      center: { x: x + width / 2, y: y + height / 2.2 }, // Adjust for visual center
    };
  },
};
