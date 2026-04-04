/**
 * Renders placed nodes using D3 data join. Keeps g.placed-nodes in sync with engine state.
 */
import * as d3 from "d3";
import { PlacedNode, VisualGroup } from "../model/interface.js";
import { Config, Shape } from "../model/configurationModel.js";
import { createDragBehavior, DragApi } from "../events/drag.js";
import { ShapeRegistry } from "./registry.js";
import { renderPorts } from "./ports.js";
import { buildResolvedShapeConfig, renderSelectionRing, renderResizeHandles, getNodeRect } from "./overlay.js";
import { applyEffects } from "../effects/engine.js";
import { renderNodeContent } from "./content.js";

/** Minimal API for rendering and interaction */
export interface RenderApi extends DragApi {
  shapeRegistry: ShapeRegistry;
  getSelectedNodeIds(): string[];
  setSelectedNodeIds(ids: string[], primaryId?: string): void;
  getCanvasPoint(event: MouseEvent): { x: number; y: number };
  startConnectionDrag(sourceNodeId: string, sourcePortId: string, startPoint: { x: number; y: number }): void;
  updateConnectionDrag(currentPoint: { x: number; y: number }): void;
  endConnectionDrag(targetNodeId?: string, targetPortId?: string): void;
  isDrawingConnection(): boolean;
  rotateNode(id: string, rotation: number, recordHistory?: boolean): void;
  updateNodeDimensions(id: string, dimensions: { width?: number; height?: number; radius?: number }, recordHistory?: boolean): void;
  updateNodePosition(id: string, x: number, y: number, recordHistory?: boolean): void;
  beginOperation(nodeId: string, type: 'drag' | 'rotate' | 'resize'): void;
  endOperation(): void;
  createDragBehavior(): d3.DragBehavior<SVGGElement, any, any>;
  getActiveOperation(): { type: string, nodeId: string, originalData: PlacedNode, selectionStates?: Map<string, PlacedNode> } | null;
  getEditingNodeId(): string | null;
  getVisualGroups(): VisualGroup[];
  getGroupBounds(groupId: string, overrideNodes?: Map<string, PlacedNode>): { x: number, y: number, width: number, height: number } | null;
  getGroupPorts(groupId: string): Record<string, { x: number, y: number }> | null;
  isConnectionModeEnabled?(): boolean;
  config: Config;
  ghostsLayer?: any;
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
            api.setSelectedNodeIds([d.id], d.id);
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
          renderNodeContent(el as any, d.content, renderer.getBounds(resolvedConfig), api.getEditingNodeId() === d.id);
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

          const selection = api.getSelectedNodeIds();
          // Support ghost if node itself is moving, or if it's in a moving visual group
          const isInMovingGroup = api.getVisualGroups().some(g =>
            g.nodeIds.includes(d.id) &&
            g.nodeIds.some(nid => activeOp?.selectionStates?.has(nid) || nid === activeOp?.nodeId)
          );

          const shouldShowGhost = (activeOp && activeOp.type === 'drag') && (selection.includes(d.id) || isInMovingGroup);

          if (shouldShowGhost && activeOp) {
            const ghostG = el.insert("g", ":first-child").attr("class", "node-ghost");

            let ghostNode = d;
            if (activeOp.selectionStates && activeOp.selectionStates.has(d.id)) {
              ghostNode = activeOp.selectionStates.get(d.id)!;
            } else if (activeOp.nodeId === d.id) {
              ghostNode = activeOp.originalData;
            }
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
              const groupGhostCfg = api.config.canvasProperties.groupGhostPreview;

              if (ghostCfg) {
                const groups = api.getVisualGroups();
                const isInMovingGroup = groups.some(g =>
                  g.nodeIds.includes(d.id) &&
                  g.nodeIds.some(nid => activeOp?.selectionStates?.has(nid) || nid === activeOp?.nodeId)
                );

                const strokeColor = isInMovingGroup && groupGhostCfg
                  ? groupGhostCfg.strokeColor
                  : ghostCfg.strokeColor;

                const dashArray = isInMovingGroup && groupGhostCfg
                  ? groupGhostCfg.strokeDashArray
                  : ghostCfg.strokeDashArray;

                ghostG.style("opacity", ghostCfg.opacity)
                  .style("filter", ghostCfg.filter)
                  .style("pointer-events", "none");

                ghostG.selectAll("path, rect, circle")
                  .style("stroke-dasharray", dashArray.join(" "))
                  .style("stroke", strokeColor)
                  .style("stroke-width", ghostCfg.strokeWidth)
                  .style("fill", ghostCfg.fillColor);
              }
            }
          }

          // Ensure we don't clear ports during update
          el.selectAll("path, circle, rect, g.node-content").filter(":not(.port):not(.selection-ring):not(.node-ghost *)").remove();

          renderer.draw(el as any, resolvedConfig, {});
          applyEffects(el as any, renderer.getPath(resolvedConfig), d.visualState);
          renderNodeContent(el as any, d.content, renderer.getBounds(resolvedConfig), api.getEditingNodeId() === d.id);
        });
        return update;
      },
      (exit) => exit.remove()
    );

  // We don't need the second .each loop here because we moved the logic into join
  // syncSelectionRings will still call renderPorts
  syncSelectionRings(placedNodesGroup, api, placedNodes);
  renderVisualGroups(placedNodesGroup, api, placedNodes);
}

/**
 * Calculates and renders a boundary around visual groups that have at least one member selected.
 */
function renderVisualGroups(
  placedNodesGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  api: RenderApi,
  placedNodes: PlacedNode[]
): void {
  const parent = api.canvasObject.visualGroups as d3.Selection<SVGGElement, unknown, null, undefined> | null;
  if (!parent || !parent.selectAll) return;

  const groups = api.getVisualGroups();
  const selectedIds = new Set(api.getSelectedNodeIds());
  const padding = 20;
  const isConnMode = api.isConnectionModeEnabled?.() || false;

  // --- Boundary Data Join ---
  const boundaries = parent.selectAll<SVGGElement, VisualGroup>("g.visual-group-boundary")
    .data(groups, (d: VisualGroup) => d.id);

  // Remove old boundaries
  boundaries.exit().remove();

  // Create new boundaries
  const boundEnter = boundaries.enter().append("g")
    .attr("class", d => `visual-group-boundary ${d.id}`)
    .attr("data-group-nodes", d => d.nodeIds.join(","));

  // Update all boundaries (enter + update)
  const boundsAll = boundEnter.merge(boundaries);

  boundsAll.each(function (this: SVGGElement, group: VisualGroup) {
    const g = d3.select<SVGGElement, VisualGroup>(this);
    const bounds = api.getGroupBounds(group.id);
    if (!bounds) {
      g.style("display", "none");
      return;
    }

    g.style("display", "block");
    const { x, y, width: w, height: h } = bounds;
    const isGroupActive = group.nodeIds.some((id: string) => selectedIds.has(id));

    g.attr("transform", `translate(${x}, ${y})`)
      .attr("data-group-nodes", group.nodeIds.join(','));

    // Layer 1: Background rect (clickable)
    let bg = g.select<SVGRectElement>("rect.bg-rect");
    if (bg.empty()) {
      bg = g.append("rect").attr("class", "bg-rect");
    }
    bg.attr("width", w)
      .attr("height", h)
      .attr("rx", 8)
      .attr("fill", "var(--zenode-selection-color, #4A90E2)")
      .attr("opacity", isGroupActive ? 0.05 : 0.01)
      .style("pointer-events", isGroupActive ? "all" : "none") // Only intercept if already active or during specific triggers
      .style("cursor", "move")
      .on("mousedown", (event: MouseEvent) => {
        // Only trigger group selection if not dragging ports
        if (!(event.target as Element).classList.contains('port')) {
          api.setSelectedNodeIds(group.nodeIds, 'collective-group-trigger');
        }
      });

    // Layer 1.5: Hit-test area for the border specifically
    let borderHit = g.select<SVGRectElement>("rect.border-hit");
    if (borderHit.empty()) {
      borderHit = g.append("rect").attr("class", "border-hit");
    }
    borderHit.attr("width", w + 10)
      .attr("height", h + 10)
      .attr("x", -5)
      .attr("y", -5)
      .attr("fill", "transparent")
      .style("cursor", "move")
      .on("mousedown", (event: MouseEvent) => {
        // Allow drag and node events to proceed by not stopping propagation
        api.setSelectedNodeIds(group.nodeIds, 'collective-group-trigger');
      });

    // Layer 2: Dashed border
    let border = g.select<SVGRectElement>("rect.border-rect");
    if (border.empty()) {
      border = g.append("rect").attr("class", "border-rect");
    }
    border.attr("width", w)
      .attr("height", h)
      .attr("rx", 8)
      .attr("fill", "none")
      .attr("stroke", "var(--zenode-selection-color, #4A90E2)")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", isGroupActive ? "6 4" : "none")
      .attr("opacity", isGroupActive ? 0.8 : 0.2)
      .style("pointer-events", "none");

    // Layer 3: Group Ports
    g.selectAll(".group-port").remove();
    if (isConnMode) {
      const ports = api.getGroupPorts(group.id);
      if (ports) {
        Object.entries(ports).forEach(([portId, pos]) => {
          const relX = pos.x - x;
          const relY = pos.y - y;
          const portCfg = api.config.canvasProperties.ports;
          if (!portCfg) return;

          g.append("circle")
            .attr("class", "port group-port")
            .attr("cx", relX)
            .attr("cy", relY)
            .attr("r", portCfg.radius)
            .attr("fill", portCfg.fillColor)
            .attr("stroke", portCfg.strokeColor)
            .attr("stroke-width", portCfg.strokeWidth)
            .style("cursor", portCfg.cursor)
            .style("pointer-events", "all")
            .on("mousedown", (event: MouseEvent) => {
              event.stopPropagation();
              event.preventDefault();
              const startPoint = api.getCanvasPoint(event);
              api.startConnectionDrag(group.id, portId, startPoint);
            });
        });
      }
    }

    // Attach drag behavior
    const dragBehavior = api.createDragBehavior();
    g.call(dragBehavior as any);
  });

  // Only groups containing nodes in the active selectionStates should show ghosts
  const activeOp = api.getActiveOperation();
  const ghostCfg = api.config.canvasProperties.groupGhostPreview;
  const ghostParent = (api.ghostsLayer || parent) as d3.Selection<SVGGElement, any, any, any>;
  // Only groups containing nodes in the active selectionStates should show ghosts
  const movingGroups = (ghostCfg?.enabled && activeOp && activeOp.type === 'drag')
    ? groups.filter(g => {
        const selectionStates = activeOp.selectionStates;
        // Show ghost if this group is being dragged, or ANY of its members are dragging
        return (g.id === activeOp.nodeId) || 
               (selectionStates && g.nodeIds.some(id => selectionStates.has(id)));
    })
    : [];

  const ghosts = ghostParent.selectAll<SVGGElement, VisualGroup>("g.visual-group-ghost")
    .data(movingGroups, (d: VisualGroup) => d.id);

  ghosts.exit().remove();

  const ghostEnter = ghosts.enter().append("g")
    .attr("class", "visual-group-ghost")
    .style("pointer-events", "none");

  const ghostAll = ghostEnter.merge(ghosts);

  ghostAll.each(function (this: SVGGElement, group: VisualGroup) {
    const g = d3.select<SVGGElement, VisualGroup>(this);
    const oBounds = api.getGroupBounds(group.id, activeOp!.selectionStates);
    if (!oBounds) {
      g.style("display", "none");
      return;
    }

    g.style("display", "block");
    const { x: oX, y: oY, width: oW, height: oH } = oBounds;
    g.attr("transform", `translate(${oX}, ${oY})`);

    let rect = g.select<SVGRectElement>("rect");
    if (rect.empty()) {
      rect = g.append("rect");
    }

    rect.attr("width", oW)
      .attr("height", oH)
      .attr("rx", 8)
      .attr("fill", ghostCfg!.fillColor || "transparent")
      .attr("stroke", ghostCfg!.strokeColor || "#005bc4")
      .attr("stroke-width", ghostCfg!.strokeWidth || 1.5)
      .attr("stroke-dasharray", (ghostCfg!.strokeDashArray || [4, 4]).join(" "))
      .attr("opacity", ghostCfg!.opacity || 0.4);
  });
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
      renderResizeHandles(group, nodeDatum, style, api);
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
