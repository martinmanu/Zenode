import * as d3 from "d3";
import { PlacedNode, VisualGroup } from "../model/interface.js";
import { Config, Shape } from "@zenode/core";
import { VisualState } from "@zenode/core";
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
  dashed?: boolean;
  animated?: boolean;
}

function getNodePortPos(node: PlacedNode, portId: string, registry: any, config: any): { x: number; y: number } {
  const shapeList = config.shapes.default?.[node.type as keyof typeof config.shapes.default] ?? [];
  const style = shapeList.find((s: any) => s.id === node.shapeVariantId);
  if (!style) return { x: node.x, y: node.y };

  const renderer = registry.get(node.type);
  const resolved = buildResolvedShapeConfig(node, style);
  const ports = renderer.getPorts(resolved);
  const port = ports[portId] || ports.center || { x: 0, y: 0 };

  // Calculate rotated port position relative to node center
  const rotation = (node.rotation || 0) * (Math.PI / 180);
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  const rotatedX = port.x * cos - port.y * sin;
  const rotatedY = port.x * sin + port.y * cos;

  return { x: node.x + rotatedX, y: node.y + rotatedY };
}

function getMarkerId(svg: any, type: string, color: string): string {
  if (!type || type === "none") return "";
  let defs = svg.select("defs.zenode-markers");
  if (defs.empty()) {
    defs = svg.append("defs").attr("class", "zenode-markers");
  }
  const safeColor = color.replace(/[^a-zA-Z0-9_-]/g, "");
  const id = `marker-${type}-${safeColor}`;
  if (defs.select(`#${id}`).empty()) {
    const marker = defs.append("marker")
      .attr("id", id)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", type === "arrow" ? 9 : 5)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto-start-reverse");
    if (type === "arrow") {
      marker.append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", color);
    } else if (type === "circle") {
      marker.append("circle").attr("cx", 5).attr("cy", 5).attr("r", 4).attr("fill", color);
    }
  }
  return id;
}

function ensureStyles(): void {
  if (typeof document === "undefined") return;
  if (!document.getElementById("zenode-conn-styles")) {
    const s = document.createElement("style");
    s.id = "zenode-conn-styles";
    s.textContent = `@keyframes zenode-stroke-flow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -32; } }`;
    document.head.appendChild(s);
  }
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
  const groups = engine?.getVisualGroups?.() || [];
  const groupIds = new Set(groups.map((g: any) => g.id));

  const valid = connections.filter(
    (c) => (nodeById.has(c.sourceNodeId) || groupIds.has(c.sourceNodeId)) && 
           (nodeById.has(c.targetNodeId) || groupIds.has(c.targetNodeId))
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

        g.append("path").attr("class", "connection-hitbox");
        g.append("path").attr("class", "connection-ghost-line");
        g.append("path").attr("class", "connection-line");
        return g;
      },
      (update) => update,
      (exit) => exit.remove()
    )
    .each(function (d) {
      const group = d3.select<SVGGElement, StoredConnection>(this);
      
      let source: { x: number, y: number };
      let target: { x: number, y: number };

      const resolveEndpoint = (id: string, portId: string): { x: number, y: number } | null => {
          if (id.startsWith("vgroup-")) {
              const ports = engine?.getGroupPorts?.(id);
              if (!ports || !ports[portId]) return null;
              return ports[portId];
          } else {
              const node = nodeById.get(id);
              if (!node) return null;
              if (registry && config) {
                  return getNodePortPos(node, portId, registry, config);
              }
              return { x: node.x + (node.width ?? 0) / 2, y: node.y + (node.height ?? 0) / 2 };
          }
      };

      const sPos = resolveEndpoint(d.sourceNodeId, d.sourcePortId);
      const tPos = resolveEndpoint(d.targetNodeId, d.targetPortId);

      if (!sPos || !tPos) {
          group.style("display", "none");
          return;
      }
      group.style("display", "block");
      
      source = sPos;
      target = tPos;

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

      // --- Render Ghost (Original State) Connection ---
      const activeOp = engine?.getActiveOperation();
      const selectionStates = activeOp?.selectionStates;
      const ghostCfg = config?.canvasProperties?.connectionGhostPreview;
      const ghostLine = group.select<SVGGElement>("path.connection-ghost-line");
      
      const isEndpointMoving = (id: string): boolean => {
        if (id === activeOp?.nodeId || selectionStates?.has(id)) return true;
        if (id.startsWith("vgroup-")) {
            const groups: VisualGroup[] = engine?.getVisualGroups?.() || [];
            const foundGroup = groups.find((g: VisualGroup) => g.id === id);
            if (foundGroup) {
                return foundGroup.nodeIds.some((nid: string) => nid === activeOp?.nodeId || selectionStates?.has(nid));
            }
        }
        return false;
      };

      const isMovingSource = isEndpointMoving(d.sourceNodeId);
      const isMovingTarget = isEndpointMoving(d.targetNodeId);

      if (ghostCfg?.enabled && activeOp && (isMovingSource || isMovingTarget)) {
        const rawSource = nodeById.get(d.sourceNodeId);
        const rawTarget = nodeById.get(d.targetNodeId);

        // Resolve original endpoint positions from selection states or primary nodeId
        const origSourceNode = selectionStates?.get(d.sourceNodeId) || 
            (d.sourceNodeId === activeOp.nodeId ? activeOp.originalData : rawSource);
            
        const origTargetNode = selectionStates?.get(d.targetNodeId) || 
            (d.targetNodeId === activeOp.nodeId ? activeOp.originalData : rawTarget);
        
        let origSource: { x: number, y: number } | null = null;
        let origTarget: { x: number, y: number } | null = null;
        
        const resolveOriginal = (id: string, portId: string, nodeFallback: PlacedNode | undefined): { x: number, y: number } => {
            if (id.startsWith("vgroup-")) {
                const ports = engine?.getGroupPorts(id, selectionStates);
                return ports?.[portId] || { x: 0, y: 0 };
            } else {
                const node = selectionStates?.get(id) || nodeFallback;
                if (!node) return { x: 0, y: 0 };
                if (registry && config) {
                    return getNodePortPos(node, portId, registry, config);
                }
                return { x: node.x + (node.width ?? 0) / 2, y: node.y + (node.height ?? 0) / 2 };
            }
        };

        origSource = resolveOriginal(d.sourceNodeId, d.sourcePortId, origSourceNode);
        origTarget = resolveOriginal(d.targetNodeId, d.targetPortId, origTargetNode);
        
        const origParams: PathParams = {
          source: origSource,
          target: origTarget,
          sourcePortId: d.sourcePortId,
          targetPortId: d.targetPortId
        };
        
        const calculator = PathCalculators[d.type] || PathCalculators.straight;
        const origPath = calculator(origParams);
        
        ghostLine
          .attr("d", origPath)
          .attr("fill", "none")
          .attr("stroke", ghostCfg.strokeColor)
          .attr("stroke-width", ghostCfg.strokeWidth)
          .attr("stroke-dasharray", ghostCfg.strokeDashArray.join(" "))
          .attr("opacity", ghostCfg.opacity)
          .attr("filter", ghostCfg.filter)
          .style("pointer-events", "none")
          .style("display", "block");
      } else {
        ghostLine.style("display", "none");
      }

      // Style from config
      const connConfig = config?.connections?.default?.[d.type as keyof typeof config.connections.default] ||
        config?.connections?.default?.straight;

      const isSelected = engine?.getSelectedEdgeIds?.()?.includes(d.id);
      const strokeColor = isSelected ? "var(--zenode-selection-color, #4A90E2)" : (connConfig?.color || "#333");

      ensureStyles();

      const markerType = connConfig?.lineStyle?.markerEnd;
      let markerId = "";
      if (markerType && markerType !== "none") {
        const svgNode = group.node()?.ownerSVGElement;
        if (svgNode) {
          markerId = getMarkerId(d3.select(svgNode), markerType, strokeColor);
        }
      }

      group
        .select<SVGPathElement>("path.connection-hitbox")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "transparent")
        .attr("stroke-width", 15)
        .style("cursor", "pointer")
        .on("click", (event) => {
          if (engine?.getPlacementContext?.()) return;
          event.stopPropagation();
          engine?.clearSelection?.();
          engine?.setSelectedEdgeIds?.([d.id]);
        });

      group
        .select<SVGPathElement>("path.connection-line")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", strokeColor)
        .attr("stroke-width", isSelected ? Math.max((connConfig?.width || 2) + 1, 3) : (connConfig?.width || 2))
        .attr("stroke-dasharray", () => {
          if (d.dashed || connConfig?.dashed) {
            return connConfig?.lineStyle?.dashArray?.join(",") || "8,8";
          }
          return null;
        })
        .attr("marker-end", markerId ? `url(#${markerId})` : null)
        .style("pointer-events", "none");
      const anim = connConfig?.lineStyle?.animation;
      const isAnimated = !!d.animated;
      
      if (isAnimated || (connConfig?.animated && anim && anim.type === "flow")) {
        const speed = Math.max(0.1, anim?.speed ?? 2);
        // Larger duration = slower flow. speed 2 -> 4s.
        const duration = 8 / Math.max(0.01, speed);
        group.select<SVGPathElement>("path.connection-line")
          .classed("animated-flow", true)
          .style("animation", `zenode-stroke-flow ${duration.toFixed(3)}s linear infinite`);
      } else {
        group.select<SVGPathElement>("path.connection-line")
          .classed("animated-flow", false)
          .style("animation", "none");
      }

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
