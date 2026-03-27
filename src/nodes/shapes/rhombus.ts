import { ShapeRenderer } from "../../types/index.js";

export const RhombusRenderer: ShapeRenderer = {
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
    const cx = x + width / 2;
    const cy = y + height / 2;
    return `M ${cx} ${y} L ${x + width} ${cy} L ${cx} ${y + height} L ${x} ${cy} Z`;
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
