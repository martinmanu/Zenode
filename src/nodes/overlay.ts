import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { Shape } from "../model/configurationModel.js";
import { ShapeRegistry } from "./registry.js";
import { ResolvedShapeConfig } from "../types/index.js";

export function buildResolvedShapeConfig(node: PlacedNode, style: Shape): ResolvedShapeConfig {
  const width = style.width ?? node.width ?? 120;
  const height = style.height ?? node.height ?? 60;
  const radius = style.radius ?? node.radius ?? 30;

  if (node.type === "circle") {
    return {
      type: node.type,
      x: 0,
      y: 0,
      width: radius * 2,
      height: radius * 2,
      radius,
      color: style.color,
      stroke: style.stroke,
      transparency: style.transparency ?? 1,
      borderRadius: style.borderRadius,
    };
  }

  return {
    type: node.type,
    x: -width / 2,
    y: -height / 2,
    width,
    height,
    radius,
    color: style.color,
    stroke: style.stroke,
    transparency: style.transparency ?? 1,
    borderRadius: style.borderRadius,
  };
}

function buildSelectionConfig(config: ResolvedShapeConfig, pad: number): ResolvedShapeConfig {
  if (config.type === "circle") {
    return {
      ...config,
      radius: config.radius + pad,
      width: (config.radius + pad) * 2,
      height: (config.radius + pad) * 2,
    };
  }

  const expandedBorderRadius = config.borderRadius
    ? {
      leftTop: (config.borderRadius.leftTop ?? 0) + pad,
      rightTop: (config.borderRadius.rightTop ?? 0) + pad,
      rightBottom: (config.borderRadius.rightBottom ?? 0) + pad,
      leftBottom: (config.borderRadius.leftBottom ?? 0) + pad,
    }
    : undefined;

  return {
    ...config,
    x: config.x - pad,
    y: config.y - pad,
    width: config.width + pad * 2,
    height: config.height + pad * 2,
    borderRadius: expandedBorderRadius,
  };
}

export function renderSelectionRing(
  selection: d3.Selection<SVGGElement, PlacedNode, any, any>,
  node: PlacedNode,
  style: Shape,
  shapeRegistry: ShapeRegistry,
  stroke: string,
  pad = 4
): void {
  const renderer = shapeRegistry.get(node.type);
  const baseConfig = buildResolvedShapeConfig(node, style);
  const ringConfig = buildSelectionConfig(baseConfig, pad);

  selection.append("path")
    .attr("class", "selection-ring")
    .attr("d", renderer.getPath(ringConfig))
    .attr("fill", "none")
    .attr("stroke", stroke)
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4 2")
    .style("pointer-events", "none");
}
