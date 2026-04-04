import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { Shape, Config } from "../model/configurationModel.js";
import { ShapeRegistry } from "./registry.js";
import { ResolvedShapeConfig } from "../types/index.js";
import { createResizeBehavior } from "../events/resize.js";

export function buildResolvedShapeConfig(node: PlacedNode, style: Shape): ResolvedShapeConfig {
  const width = node.width ?? style.width ?? 120;
  const height = node.height ?? style.height ?? 60;
  const radius = node.radius ?? style.radius ?? 30;

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

/**
 * Renders 8-point interactive resize handles around a selected node.
 */
export function renderResizeHandles(
    group: d3.Selection<SVGGElement, PlacedNode, any, any>,
    node: PlacedNode,
    style: Shape,
    api: any
): void {
    if (!node.width || !node.height) return; // Only rectangular-ish for now
    
    const w = node.width;
    const h = node.height;
    const halfW = w / 2;
    const halfH = h / 2;

    const handles = [
        { x: -halfW, y: -halfH, cursor: 'nw-resize', type: 'nw' },
        { x: 0,      y: -halfH, cursor: 'n-resize',  type: 'n' },
        { x: halfW,  y: -halfH, cursor: 'ne-resize', type: 'ne' },
        { x: halfW,  y: 0,      cursor: 'e-resize',  type: 'e' },
        { x: halfW,  y: halfH,  cursor: 'se-resize', type: 'se' },
        { x: 0,      y: halfH,  cursor: 's-resize',  type: 's' },
        { x: -halfW, y: halfH,  cursor: 'sw-resize', type: 'sw' },
        { x: -halfW, y: 0,      cursor: 'w-resize',  type: 'w' }
    ];

    const handleGroup = group.append("g").attr("class", "resize-handles");
    const resizeBehavior = createResizeBehavior(api);

    handleGroup.selectAll("rect.resize-handle")
        .data(handles)
        .enter()
        .append("rect")
        .attr("class", d => `resize-handle handle-${d.type}`)
        .attr("x", d => d.x - 4)
        .attr("y", d => d.y - 4)
        .attr("width", 8)
        .attr("height", 8)
        .attr("fill", "white")
        .attr("stroke", "var(--zenode-selection-color)")
        .attr("stroke-width", 1.5)
        .style("cursor", d => d.cursor)
        .style("pointer-events", "all")
        .call(resizeBehavior as any);
}

export function getNodeRect(node: PlacedNode, api: { config: Config, shapeRegistry: ShapeRegistry }): NodeRect | null {
  const style = getShapeStyle(node, api.config);
  if (!style) return null;
  const renderer = api.shapeRegistry.get(node.type);
  const resolved = buildResolvedShapeConfig(node, style);
  const local = renderer.getBounds(resolved);

  const left = node.x + local.x;
  const top = node.y + local.y;
  const right = left + local.width;
  const bottom = top + local.height;

  return {
    left,
    right,
    top,
    bottom,
    cx: left + local.width / 2,
    cy: top + local.height / 2,
  };
}

export function getShapeStyle(node: PlacedNode, config: Config): Shape | undefined {
  const list = config.shapes.default?.[node.type as keyof typeof config.shapes.default];
  if (!Array.isArray(list)) return undefined;
  return list.find((s: Shape) => s.id === node.shapeVariantId);
}

export interface NodeRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  cx: number;
  cy: number;
}
