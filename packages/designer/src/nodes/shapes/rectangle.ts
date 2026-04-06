import { roundedRectPath } from "../geometry/rectanglePath.js";
import { ShapeRenderer } from "@zenode/core";

export const RectangleRenderer: ShapeRenderer = {
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
    const tl = config.borderRadius?.leftTop ?? 0;
    const tr = config.borderRadius?.rightTop ?? 0;
    const br = config.borderRadius?.rightBottom ?? 0;
    const bl = config.borderRadius?.leftBottom ?? 0;
    return roundedRectPath(x, y, width, height, tl, tr, br, bl);
  },

  getBounds(config) {
    return { x: config.x, y: config.y, width: config.width, height: config.height };
  },

  getPorts(config) {
    const { x, y, width, height } = config;
    return {
      top: { x: x + width / 2, y },
      bottom: { x: x + width / 2, y: y + height },
      left: { x, y: y + height / 2 },
      right: { x: x + width, y: y + height / 2 },
      center: { x: x + width / 2, y: y + height / 2 },
    };
  },
};
