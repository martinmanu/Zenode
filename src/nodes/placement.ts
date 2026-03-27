/**
 * Renders placed nodes using D3 data join. Keeps g.placed-nodes in sync with engine state.
 */
import * as d3 from "d3";
import { PlacedNode } from "../model/interface.js";
import { Config, Shape } from "../model/configurationModel.js";
import { createDragBehavior, DragApi } from "../events/drag.js";
import { ShapeRegistry } from "./registry.js";
import { buildResolvedShapeConfig, renderSelectionRing } from "./overlay.js";

/** Minimal API for rendering and interaction */
export interface RenderApi extends DragApi {
  shapeRegistry: ShapeRegistry;
  getSelectedNodeIds(): string[];
  setSelectedNodeIds(ids: string[]): void;
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
          .attr("transform", (d) => `translate(${d.x},${d.y})`)
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
          renderer.draw(el as any, resolvedConfig, {});
        });
        return g;
      },
      (update) => update.attr("transform", (d) => `translate(${d.x},${d.y})`),
      (exit) => exit.remove()
    );

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

  // Guard for stale ids after node deletions.
  const presentIds = new Set(placedNodes.map((n) => n.id));
  const filtered = [...selected].filter((id) => presentIds.has(id));
  if (filtered.length !== selected.size) {
    api.setSelectedNodeIds(filtered);
  }
}
