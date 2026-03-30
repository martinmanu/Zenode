import { semicirclePath } from "../geometry/semicirclePath.js";
import { ShapeRenderer } from "../../types/index.js";

export const SemicircleRenderer: ShapeRenderer = {
  draw(g, config) {
    g.append("path")
      .attr("d", this.getPath(config))
      .attr("fill", config.color)
      .attr("fill-opacity", config.transparency ?? 1)
      .attr("stroke", config.stroke.color)
      .attr("stroke-width", config.stroke.width)
      .attr(
        "stroke-dasharray",
        config.stroke.strokeDasharray?.length
          ? config.stroke.strokeDasharray.join(" ")
          : null
      );
  },

  getPath(config) {
    const { x, y, width, height } = config;
    return semicirclePath(x, y, width, height);
  },

  getBounds(config) {
    return { x: config.x, y: config.y, width: config.width, height: config.height };
  },

  getPorts(config) {
    const { x, y, width, height } = config;
    return {
      peak: { x: x + width / 2, y: y },
      left_base: { x: x, y: y + height },
      right_base: { x: x + width, y: y + height },
      bottom_center: { x: x + width / 2, y: y + height },
      center: { x: x + width / 2, y: y + height / 2 },
    };
  },
};
