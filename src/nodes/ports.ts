import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { Config, Shape, PortStyle } from "../model/configurationModel.js";
import { ShapeRegistry } from "./registry.js";
import { buildResolvedShapeConfig } from "./overlay.js";

/**
 * Renders connection ports for a node.
 * @param nodeGroup - The D3 selection of the node's <g> element
 * @param node - The node data
 * @param config - The engine configuration
 * @param registry - The shape registry to get the renderer
 */
export function renderPorts(
  nodeGroup: d3.Selection<SVGGElement, PlacedNode, any, any>,
  node: PlacedNode,
  config: Config,
  registry: ShapeRegistry
): void {
  const portConfig = config.canvasProperties.ports;
  if (!portConfig || !portConfig.enabled) {
    return;
  }

  const style = getShapeStyle(node, config);
  if (!style) {
    return;
  }

  const renderer = registry.get(node.type);
  const resolvedConfig = buildResolvedShapeConfig(node, style);
  const ports = renderer.getPorts(resolvedConfig);

  const portData = (Object.entries(ports) as [string, { x: number; y: number }][]).map(([key, pos]) => ({
    id: key,
    x: pos.x,
    y: pos.y,
  }));

  const portSelection = nodeGroup
    .selectAll<SVGCircleElement, { id: string; x: number; y: number }>("circle.port")
    .data(portData, (d) => d.id);

  portSelection
    .join(
      (enter) => enter.append("circle").attr("class", "port"),
      (update) => update,
      (exit) => exit.remove()
    )
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", portConfig.radius)
    .attr("fill", portConfig.fillColor)
    .attr("stroke", portConfig.strokeColor)
    .attr("stroke-width", portConfig.strokeWidth)
    .attr("opacity", portConfig.showOnHoverOnly ? 0 : portConfig.opacity)
    .style("cursor", portConfig.cursor)
    .on("mouseenter", function() {
        if (portConfig.showOnHoverOnly) {
            d3.select(this).transition().duration(200).attr("opacity", portConfig.opacity);
        }
    })
    .on("mouseleave", function() {
        if (portConfig.showOnHoverOnly) {
            d3.select(this).transition().duration(200).attr("opacity", 0);
        }
    })
    .each(function() {
      // Bring ports to front manually by re-appending them to the end of the node group.
      // In SVG, the last child of a group is rendered on top of previous children.
      if (this.parentNode) {
        this.parentNode.appendChild(this);
      }
    });
}

function getShapeStyle(node: PlacedNode, config: Config): Shape | undefined {
  const list = config.shapes.default?.[node.type as keyof typeof config.shapes.default];
  if (!Array.isArray(list)) return undefined;
  return list.find((s: Shape) => s.id === node.shapeVariantId);
}
