/**
 * Renders placed nodes using D3 data join. Keeps g.placed-nodes in sync with engine state.
 */
import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { Config, Shape } from "../model/configurationModel.js";
import { createDragBehavior, DragApi } from "../events/drag.js";
import { ShapeRegistry } from "./registry.js";
import { renderPorts } from "./ports.js";
import { buildResolvedShapeConfig, renderSelectionRing } from "./overlay.js";
import { applyEffects } from "../effects/engine.js";
import { renderNodeContent } from "./content.js";

/** Minimal API for rendering and interaction */
export interface RenderApi extends DragApi {
  shapeRegistry: ShapeRegistry;
  getSelectedNodeIds(): string[];
  setSelectedNodeIds(ids: string[]): void;
  getCanvasPoint(event: MouseEvent): { x: number; y: number };
  startConnectionDrag(sourceNodeId: string, sourcePortId: string, startPoint: { x: number; y: number }): void;
  updateConnectionDrag(currentPoint: { x: number; y: number }): void;
  endConnectionDrag(targetNodeId?: string, targetPortId?: string): void;
  isDrawingConnection(): boolean;
  rotateNode(id: string, rotation: number, recordHistory?: boolean): void;
  updateNodeDimensions(id: string, dimensions: { width?: number; height?: number; radius?: number }, recordHistory?: boolean): void;
  beginOperation(nodeId: string, type: 'drag' | 'rotate' | 'resize'): void;
  endOperation(): void;
  getActiveOperation(): { type: string, nodeId: string, originalData: PlacedNode } | null;
}

function getShapeStyle(node: PlacedNode, config: Config): Shape | undefined {
  const list = config.shapes.default?.[node.type as keyof typeof config.shapes.default];
  if (!Array.isArray(list)) return undefined;
  return list.find((s: Shape) => s.id === node.shapeVariantId);
}

/**
 * Renders the placed nodes layer using a D3 data join. Call after state changes.
 * @param placedNodesGroup - D3 selection for g.placed-nodes
 * @param placedNodes - Current array of placed nodes
 * @param config - Engine config for shape styles
 */
export function renderPlacedNodes(
  placedNodesGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  placedNodes: PlacedNode[],
  api: RenderApi
): void {
  const dragBehavior = createDragBehavior(api);
  const binding = placedNodesGroup
    .selectAll<SVGGElement, PlacedNode>("g.node")
    .data(placedNodes, (d: PlacedNode) => d.id);

  binding
    .join(
      (enter) => {
        const g = enter
          .append("g")
          .attr("class", "node placed-node")
          .attr("data-id", (d) => d.id)
          .attr("transform", (d) => `translate(${d.x},${d.y}) rotate(${d.rotation || 0})`)
          .call(dragBehavior)
          .on("click", function (event) {
            event.stopPropagation();
            const sel = d3.select<SVGGElement, PlacedNode>(this);
            const d = sel.datum();
            api.setSelectedNodeIds([d.id]);
          });

      g.each(function (d) {
        const style = getShapeStyle(d, api.config);
        if (!style) return;
        const el = d3.select<SVGGElement, PlacedNode>(this);
        const renderer = api.shapeRegistry.get(d.type);
        const resolvedConfig = buildResolvedShapeConfig(d, style);

        // Clear only if needed, but renderer.draw usually appends.
        // If renderer.draw is called every time, it might be doubling up elements.
        el.selectAll("path, circle, rect").filter(":not(.port):not(.selection-ring)").remove();

        renderer.draw(el as any, resolvedConfig, {});
        applyEffects(el as any, renderer.getPath(resolvedConfig), d.visualState);
        renderNodeContent(el as any, d.content, renderer.getBounds(resolvedConfig));
      });
      return g;
    },
    (update) => {
      update.attr("transform", (d) => `translate(${d.x},${d.y}) rotate(${d.rotation || 0})`);
      update.each(function (d) {
        const style = getShapeStyle(d, api.config);
        if (!style) return;
        const el = d3.select<SVGGElement, PlacedNode>(this);
        const renderer = api.shapeRegistry.get(d.type);
        const resolvedConfig = buildResolvedShapeConfig(d, style);

        // --- Render Ghost (Original State) Preview ---
        const activeOp = api.getActiveOperation();
        el.selectAll(".node-ghost").remove();
        if (activeOp && activeOp.nodeId === d.id) {
          const ghostG = el.insert("g", ":first-child").attr("class", "node-ghost");
          const ghostNode = activeOp.originalData;
          const ghostStyle = getShapeStyle(ghostNode, api.config);
          
          if (ghostStyle) {
            const ghostResolved = buildResolvedShapeConfig(ghostNode, ghostStyle);
            // Counter-transform the ghost so it stays at the original logical position
            // while the parent 'g.node' has moved to the new (d.x, d.y)
            const dx = ghostNode.x - d.x;
            const dy = ghostNode.y - d.y;
            const currentRotation = d.rotation || 0;
            const ghostRotation = ghostNode.rotation || 0;
            
            ghostG.attr("transform", `rotate(${-currentRotation}) translate(${dx},${dy}) rotate(${ghostRotation})`);
            renderer.draw(ghostG as any, ghostResolved, {});

            // Apply configurable styles
            const ghostCfg = api.config.canvasProperties.ghostPreview;
            if (ghostCfg) {
              ghostG.style("opacity", ghostCfg.opacity)
                    .style("filter", ghostCfg.filter)
                    .style("pointer-events", "none");

              ghostG.selectAll("path, rect, circle")
                    .style("stroke-dasharray", ghostCfg.strokeDashArray.join(" "))
                    .style("stroke", ghostCfg.strokeColor)
                    .style("stroke-width", ghostCfg.strokeWidth)
                    .style("fill", ghostCfg.fillColor);
            }
          }
        }

        // Ensure we don't clear ports during update
        el.selectAll("path, circle, rect, g.node-content").filter(":not(.port):not(.selection-ring):not(.node-ghost *)").remove();

        renderer.draw(el as any, resolvedConfig, {});
        applyEffects(el as any, renderer.getPath(resolvedConfig), d.visualState);
        renderNodeContent(el as any, d.content, renderer.getBounds(resolvedConfig));
      });
      return update;
    },
    (exit) => exit.remove()
  );

  // We don't need the second .each loop here because we moved the logic into join
  // syncSelectionRings will still call renderPorts
  syncSelectionRings(placedNodesGroup, api, placedNodes);
}

function syncSelectionRings(
  placedNodesGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  api: RenderApi,
  placedNodes: PlacedNode[]
): void {
  const selected = new Set(api.getSelectedNodeIds());
  const selectionStroke = "var(--zenode-selection-color, #4A90E2)";

  placedNodesGroup
    .selectAll<SVGGElement, PlacedNode>("g.node")
    .each(function (nodeDatum) {
      const group = d3.select<SVGGElement, PlacedNode>(this);
      const isSelected = selected.has(nodeDatum.id);

      group.classed("selected", isSelected);
      group.selectAll(".selection-ring").remove();

      if (!isSelected) return;

      const style = getShapeStyle(nodeDatum, api.config);
      if (!style) return;

      renderSelectionRing(group, nodeDatum, style, api.shapeRegistry, selectionStroke, 4);
    });

  // Finally render ports for ALL nodes to ensure they are always on top
  placedNodesGroup
    .selectAll<SVGGElement, PlacedNode>("g.node")
    .each(function (d) {
      const el = d3.select<SVGGElement, PlacedNode>(this);
      renderPorts(el as any, d, api.config, api.shapeRegistry, api);
    });

  // Guard for stale ids after node deletions.
  const presentIds = new Set(placedNodes.map((n) => n.id));
  const filtered = [...selected].filter((id) => presentIds.has(id));
  if (filtered.length !== selected.size) {
    api.setSelectedNodeIds(filtered);
  }
}
