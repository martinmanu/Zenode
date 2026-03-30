import { pentagonPath } from "../geometry/pentagonPath.js";
import { ShapeRenderer } from "../../types/index.js";

export const PentagonRenderer: ShapeRenderer = {
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
    return pentagonPath(x, y, width, height);
  },

  getBounds(config) {
    return { x: config.x, y: config.y, width: config.width, height: config.height };
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

    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        ports[`v${i}`] = {
            x: cx + rx * Math.cos(angle),
            y: cy + ry * Math.sin(angle)
        };
    }
    return ports;
  },
};
