import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { VisualState } from "../types/index.js";
import { applyEffects } from "../effects/engine.js";
import { buildResolvedShapeConfig } from "../nodes/overlay.js";
import { PathCalculators, PathParams } from "./paths/index.js";

export interface StoredConnection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  type: string;
  visualState?: VisualState;
}

function getNodePortPos(node: PlacedNode, portId: string, registry: any, config: any): { x: number; y: number } {
  const shapeList = config.shapes.default?.[node.type as keyof typeof config.shapes.default] ?? [];
  const style = shapeList.find((s: any) => s.id === node.shapeVariantId);
  if (!style) return { x: node.x, y: node.y };

  const renderer = registry.get(node.type);
  const resolved = buildResolvedShapeConfig(node, style);
  const ports = renderer.getPorts(resolved);
  const port = ports[portId] || ports.center || { x: 0, y: 0 };

  return { x: node.x + port.x, y: node.y + port.y };
}

/**
 * Draws all connections using the specialized path calculators.
 */
export function renderConnections(
  connectionsGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  connections: StoredConnection[],
  placedNodes: PlacedNode[],
  engine?: any // Pass engine to get registry and config
): void {
  const nodeById = new Map(placedNodes.map((n) => [n.id, n]));
  const valid = connections.filter(
    (c) => nodeById.has(c.sourceNodeId) && nodeById.has(c.targetNodeId)
  );

  const registry = engine?.shapeRegistry;
  const config = engine?.config;

  const binding = connectionsGroup
    .selectAll<SVGGElement, StoredConnection>("g.connection")
    .data(valid, (d: StoredConnection) => d.id);

  binding
    .join(
      (enter) => {
        const g = enter
          .append("g")
          .attr("class", "connection")
          .attr("data-connection-id", (d) => d.id);

        g.append("path").attr("class", "connection-line");
        return g;
      },
      (update) => update,
      (exit) => exit.remove()
    )
    .each(function (d) {
      const group = d3.select<SVGGElement, StoredConnection>(this);
      const sourceNode = nodeById.get(d.sourceNodeId)!;
      const targetNode = nodeById.get(d.targetNodeId)!;

      let source = { x: sourceNode.x, y: sourceNode.y };
      let target = { x: targetNode.x, y: targetNode.y };

      if (registry && config) {
        source = getNodePortPos(sourceNode, d.sourcePortId, registry, config);
        target = getNodePortPos(targetNode, d.targetPortId, registry, config);
      } else {
          // Fallback to center if engine not provided
          source = { x: sourceNode.x + (sourceNode.width ?? 0) / 2, y: sourceNode.y + (sourceNode.height ?? 0) / 2 };
          target = { x: targetNode.x + (targetNode.width ?? 0) / 2, y: targetNode.y + (targetNode.height ?? 0) / 2 };
      }

      const params: PathParams = {
          source,
          target,
          sourcePortId: d.sourcePortId,
          targetPortId: d.targetPortId
      };

      let path: string;
      if (engine?.isSmartRoutingEnabled?.()) {
          const obstacles = placedNodes.map(n => ({
              id: n.id,
              x: n.x,
              y: n.y,
              width: n.width || 0,
              height: n.height || 0
          }));
          path = engine.smartRouter.calculatePath(params, obstacles);
      } else {
          const calculator = PathCalculators[d.type] || PathCalculators.straight;
          path = calculator(params);
      }

      // Style from config
      const connConfig = config?.connections?.default?.[d.type as keyof typeof config.connections.default] || 
                         config?.connections?.default?.straight;

      group
        .select<SVGPathElement>("path.connection-line")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", connConfig?.color || "#333")
        .attr("stroke-width", connConfig?.width || 2)
        .attr("stroke-dasharray", connConfig?.lineStyle?.dashArray?.join(",") || null)
        .style("pointer-events", "none");

      // Render Label
      renderConnectionLabel(group, path, d, config);

      applyEffects(group as any, path, d.visualState);
    });
}

/**
 * Renders a pill-style text label at the midpoint of the path.
 */
function renderConnectionLabel(
  group: d3.Selection<SVGGElement, StoredConnection, null, undefined>,
  pathData: string,
  d: StoredConnection,
  config: any
): void {
  // Find connection config for styles
  const connConfig = config?.connections?.default?.[d.type as keyof typeof config.connections.default] || 
                     config?.connections?.default?.straight;
  const lineStyle = connConfig?.lineStyle;

  if (!lineStyle?.innerTextEnabled) {
    group.select("g.label-group").remove();
    return;
  }

  const labelText = lineStyle.innerText || "";
  if (!labelText) return;

  // Use a temporary path to find the midpoint
  const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  tempPath.setAttribute("d", pathData);
  // Temporarily append to measure correctly
  const svgNode = group.node()?.ownerSVGElement;
  if (svgNode) svgNode.appendChild(tempPath);
  
  const totalLength = tempPath.getTotalLength();
  const midpoint = tempPath.getPointAtLength(totalLength / 2);
  
  if (svgNode) svgNode.removeChild(tempPath);

  let labelGroup = group.select<SVGGElement>("g.label-group");
  if (labelGroup.empty()) {
    labelGroup = group.append("g").attr("class", "label-group");
    labelGroup.append("rect").attr("class", "label-bg");
    labelGroup.append("text").attr("class", "label-text");
  }

  const padding = lineStyle.labelPadding ?? 4;
  const fontSize = lineStyle.innerTextSize ?? 12;

  const text = labelGroup.select<SVGTextElement>("text.label-text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("fill", lineStyle.innerTextColor || "#000")
    .style("font-size", `${fontSize}px`)
    .style("pointer-events", "none")
    .text(labelText);

  // Get text bounds for the background pill
  const bbox = (text.node() as SVGTextElement).getBBox();
  
  labelGroup.select("rect.label-bg")
    .attr("x", midpoint.x - bbox.width / 2 - padding)
    .attr("y", midpoint.y - bbox.height / 2 - padding)
    .attr("width", bbox.width + padding * 2)
    .attr("height", bbox.height + padding * 2)
    .attr("rx", lineStyle.labelBorderRadius ?? 4)
    .attr("fill", lineStyle.labelBackground || "#ffffff")
    .attr("stroke", "#ddd")
    .attr("stroke-width", 0.5);

  text.attr("x", midpoint.x).attr("y", midpoint.y);
}

/**
 * Renders a ghost connection line from a port to the current mouse position.
 */
export function renderGhostConnection(
  ghostGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  from: { x: number; y: number },
  to: { x: number; y: number },
  style?: any, // GhostConnectionStyle
  type: string = "straight",
  sourcePortId?: string,
  targetPortId?: string
): void {
  const params: PathParams = {
    source: from,
    target: to,
    sourcePortId,
    targetPortId
  };

  const calculator = PathCalculators[type] || PathCalculators.straight;
  const path = calculator(params);

  const line = ghostGroup.selectAll<SVGPathElement, any>("path.ghost-line").data([null]);

  const color = style?.color || "var(--zenode-selection-color, #4A90E2)";
  const width = style?.strokeWidth || 2;
  const opacity = style?.opacity ?? 1;
  const dash = style?.dashed ? (style.dashArray?.join(" ") || "4 4") : "none";

  line.join(
    (enter) => enter.append("path").attr("class", "ghost-line"),
    (update) => update
  )
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", width)
    .attr("stroke-dasharray", dash)
    .attr("opacity", opacity)
    .style("pointer-events", "none");
}
