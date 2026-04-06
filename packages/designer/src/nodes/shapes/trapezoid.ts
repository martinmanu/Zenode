import { ShapeRenderer } from "@zenode/core";
import { trapezoidPath } from "../geometry/trapezoidPath.js";

/**
 * Trapezoid shape renderer using SVG <path>.
 */
export const TrapezoidRenderer: ShapeRenderer = {
  draw(group, config) {
    const { color, stroke, transparency } = config;
    group
      .append("path")
      .attr("d", trapezoidPath(config))
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
    return trapezoidPath(config);
  },

  getBounds(config) {
    const { x, y, width, height } = config;
    return { x, y, width, height };
  },

  getPorts(config) {
    const { x, y, width, height } = config;
    const offset = width * 0.2;
    return {
      top_left: { x: x + offset, y: y },
      top_right: { x: x + width - offset, y: y },
      bottom_left: { x: x, y: y + height },
      bottom_right: { x: x + width, y: y + height },
      center: { x: x + width / 2, y: y + height / 2 },
    };
  },
};
