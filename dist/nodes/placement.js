import * as d3 from 'd3';
import { createDragBehavior } from '../events/drag.js';
import { renderPorts } from './ports.js';
import { buildResolvedShapeConfig, renderSelectionRing, renderResizeHandles } from './overlay.js';
import { applyEffects } from '../effects/engine.js';
import { renderNodeContent } from './content.js';

/**
 * Renders placed nodes using D3 data join. Keeps g.placed-nodes in sync with engine state.
 */
function getShapeStyle(node, config) {
    var _a;
    const list = (_a = config.shapes.default) === null || _a === void 0 ? void 0 : _a[node.type];
    if (!Array.isArray(list))
        return undefined;
    return list.find((s) => s.id === node.shapeVariantId);
}
/**
 * Renders the placed nodes layer using a D3 data join. Call after state changes.
 * @param placedNodesGroup - D3 selection for g.placed-nodes
 * @param placedNodes - Current array of placed nodes
 * @param config - Engine config for shape styles
 */
function renderPlacedNodes(placedNodesGroup, placedNodes, api) {
    const dragBehavior = createDragBehavior(api);
    const binding = placedNodesGroup
        .selectAll("g.node")
        .data(placedNodes, (d) => d.id);
    binding
        .join((enter) => {
        const g = enter
            .append("g")
            .attr("class", "node placed-node")
            .attr("data-id", (d) => d.id)
            .attr("transform", (d) => `translate(${d.x},${d.y}) rotate(${d.rotation || 0})`)
            .call(dragBehavior)
            .on("click", function (event) {
            event.stopPropagation();
            const sel = d3.select(this);
            const d = sel.datum();
            api.setSelectedNodeIds([d.id], d.id);
        });
        g.each(function (d) {
            const style = getShapeStyle(d, api.config);
            if (!style)
                return;
            const el = d3.select(this);
            const renderer = api.shapeRegistry.get(d.type);
            const resolvedConfig = buildResolvedShapeConfig(d, style);
            // Clear only if needed, but renderer.draw usually appends.
            // If renderer.draw is called every time, it might be doubling up elements.
            el.selectAll("path, circle, rect").filter(":not(.port):not(.selection-ring)").remove();
            renderer.draw(el, resolvedConfig, {});
            applyEffects(el, renderer.getPath(resolvedConfig), d.visualState);
            renderNodeContent(el, d.content, renderer.getBounds(resolvedConfig), api.getEditingNodeId() === d.id);
        });
        return g;
    }, (update) => {
        update.attr("transform", (d) => `translate(${d.x},${d.y}) rotate(${d.rotation || 0})`);
        update.each(function (d) {
            const style = getShapeStyle(d, api.config);
            if (!style)
                return;
            const el = d3.select(this);
            const renderer = api.shapeRegistry.get(d.type);
            const resolvedConfig = buildResolvedShapeConfig(d, style);
            // --- Render Ghost (Original State) Preview ---
            const activeOp = api.getActiveOperation();
            el.selectAll(".node-ghost").remove();
            const selection = api.getSelectedNodeIds();
            // Support ghost if node itself is moving, or if it's in a moving visual group
            const isInMovingGroup = api.getVisualGroups().some(g => g.nodeIds.includes(d.id) &&
                g.nodeIds.some(nid => { var _a; return ((_a = activeOp === null || activeOp === void 0 ? void 0 : activeOp.selectionStates) === null || _a === void 0 ? void 0 : _a.has(nid)) || nid === (activeOp === null || activeOp === void 0 ? void 0 : activeOp.nodeId); }));
            const shouldShowGhost = (activeOp && activeOp.type === 'drag') && (selection.includes(d.id) || isInMovingGroup);
            if (shouldShowGhost && activeOp) {
                const ghostG = el.insert("g", ":first-child").attr("class", "node-ghost");
                let ghostNode = d;
                if (activeOp.selectionStates && activeOp.selectionStates.has(d.id)) {
                    ghostNode = activeOp.selectionStates.get(d.id);
                }
                else if (activeOp.nodeId === d.id) {
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
                    renderer.draw(ghostG, ghostResolved, {});
                    // Apply configurable styles
                    const ghostCfg = api.config.canvasProperties.ghostPreview;
                    const groupGhostCfg = api.config.canvasProperties.groupGhostPreview;
                    if (ghostCfg) {
                        const groups = api.getVisualGroups();
                        const isInMovingGroup = groups.some(g => g.nodeIds.includes(d.id) &&
                            g.nodeIds.some(nid => { var _a; return ((_a = activeOp === null || activeOp === void 0 ? void 0 : activeOp.selectionStates) === null || _a === void 0 ? void 0 : _a.has(nid)) || nid === (activeOp === null || activeOp === void 0 ? void 0 : activeOp.nodeId); }));
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
            renderer.draw(el, resolvedConfig, {});
            applyEffects(el, renderer.getPath(resolvedConfig), d.visualState);
            renderNodeContent(el, d.content, renderer.getBounds(resolvedConfig), api.getEditingNodeId() === d.id);
        });
        return update;
    }, (exit) => exit.remove());
    // We don't need the second .each loop here because we moved the logic into join
    // syncSelectionRings will still call renderPorts
    syncSelectionRings(placedNodesGroup, api, placedNodes);
    renderVisualGroups(placedNodesGroup, api);
}
/**
 * Calculates and renders a boundary around visual groups that have at least one member selected.
 */
function renderVisualGroups(placedNodesGroup, api, placedNodes) {
    var _a;
    const parent = api.canvasObject.visualGroups;
    if (!parent || !parent.selectAll)
        return;
    const groups = api.getVisualGroups();
    const selectedIds = new Set(api.getSelectedNodeIds());
    const isConnMode = ((_a = api.isConnectionModeEnabled) === null || _a === void 0 ? void 0 : _a.call(api)) || false;
    // --- Boundary Data Join ---
    const boundaries = parent.selectAll("g.visual-group-boundary")
        .data(groups, (d) => d.id);
    // Remove old boundaries
    boundaries.exit().remove();
    // Create new boundaries
    const boundEnter = boundaries.enter().append("g")
        .attr("class", d => `visual-group-boundary ${d.id}`)
        .attr("data-group-nodes", d => d.nodeIds.join(","));
    // Update all boundaries (enter + update)
    const boundsAll = boundEnter.merge(boundaries);
    boundsAll.each(function (group) {
        const g = d3.select(this);
        const bounds = api.getGroupBounds(group.id);
        if (!bounds) {
            g.style("display", "none");
            return;
        }
        g.style("display", "block");
        const { x, y, width: w, height: h } = bounds;
        const isGroupActive = group.nodeIds.some((id) => selectedIds.has(id));
        g.attr("transform", `translate(${x}, ${y})`)
            .attr("data-group-nodes", group.nodeIds.join(','));
        // Layer 1: Background rect (clickable)
        let bg = g.select("rect.bg-rect");
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
            .on("mousedown", (event) => {
            // Only trigger group selection if not dragging ports
            if (!event.target.classList.contains('port')) {
                api.setSelectedNodeIds(group.nodeIds, 'collective-group-trigger');
            }
        });
        // Layer 1.5: Hit-test area for the border specifically
        let borderHit = g.select("rect.border-hit");
        if (borderHit.empty()) {
            borderHit = g.append("rect").attr("class", "border-hit");
        }
        borderHit.attr("width", w + 10)
            .attr("height", h + 10)
            .attr("x", -5)
            .attr("y", -5)
            .attr("fill", "transparent")
            .style("cursor", "move")
            .on("mousedown", (event) => {
            // Allow drag and node events to proceed by not stopping propagation
            api.setSelectedNodeIds(group.nodeIds, 'collective-group-trigger');
        });
        // Layer 2: Dashed border
        let border = g.select("rect.border-rect");
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
                    if (!portCfg)
                        return;
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
                        .on("mousedown", (event) => {
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
        g.call(dragBehavior);
    });
    // Only groups containing nodes in the active selectionStates should show ghosts
    const activeOp = api.getActiveOperation();
    const ghostCfg = api.config.canvasProperties.groupGhostPreview;
    const ghostParent = (api.ghostsLayer || parent);
    // Only groups containing nodes in the active selectionStates should show ghosts
    const movingGroups = ((ghostCfg === null || ghostCfg === void 0 ? void 0 : ghostCfg.enabled) && activeOp && activeOp.type === 'drag')
        ? groups.filter(g => {
            const selectionStates = activeOp.selectionStates;
            // Show ghost if this group is being dragged, or ANY of its members are dragging
            return (g.id === activeOp.nodeId) ||
                (selectionStates && g.nodeIds.some(id => selectionStates.has(id)));
        })
        : [];
    const ghosts = ghostParent.selectAll("g.visual-group-ghost")
        .data(movingGroups, (d) => d.id);
    ghosts.exit().remove();
    const ghostEnter = ghosts.enter().append("g")
        .attr("class", "visual-group-ghost")
        .style("pointer-events", "none");
    const ghostAll = ghostEnter.merge(ghosts);
    ghostAll.each(function (group) {
        const g = d3.select(this);
        const oBounds = api.getGroupBounds(group.id, activeOp.selectionStates);
        if (!oBounds) {
            g.style("display", "none");
            return;
        }
        g.style("display", "block");
        const { x: oX, y: oY, width: oW, height: oH } = oBounds;
        g.attr("transform", `translate(${oX}, ${oY})`);
        let rect = g.select("rect");
        if (rect.empty()) {
            rect = g.append("rect");
        }
        rect.attr("width", oW)
            .attr("height", oH)
            .attr("rx", 8)
            .attr("fill", ghostCfg.fillColor || "transparent")
            .attr("stroke", ghostCfg.strokeColor || "#005bc4")
            .attr("stroke-width", ghostCfg.strokeWidth || 1.5)
            .attr("stroke-dasharray", (ghostCfg.strokeDashArray || [4, 4]).join(" "))
            .attr("opacity", ghostCfg.opacity || 0.4);
    });
}
function syncSelectionRings(placedNodesGroup, api, placedNodes) {
    const selected = new Set(api.getSelectedNodeIds());
    const selectionStroke = "var(--zenode-selection-color, #4A90E2)";
    placedNodesGroup
        .selectAll("g.node")
        .each(function (nodeDatum) {
        const group = d3.select(this);
        const isSelected = selected.has(nodeDatum.id);
        group.classed("selected", isSelected);
        group.selectAll(".selection-ring").remove();
        if (!isSelected)
            return;
        const style = getShapeStyle(nodeDatum, api.config);
        if (!style)
            return;
        renderSelectionRing(group, nodeDatum, style, api.shapeRegistry, selectionStroke, 4);
        renderResizeHandles(group, nodeDatum, style, api);
    });
    // Finally render ports for ALL nodes to ensure they are always on top
    placedNodesGroup
        .selectAll("g.node")
        .each(function (d) {
        const el = d3.select(this);
        renderPorts(el, d, api.config, api.shapeRegistry, api);
    });
    // Guard for stale ids after node deletions.
    const presentIds = new Set(placedNodes.map((n) => n.id));
    const filtered = [...selected].filter((id) => presentIds.has(id));
    if (filtered.length !== selected.size) {
        api.setSelectedNodeIds(filtered);
    }
}

export { renderPlacedNodes };
//# sourceMappingURL=placement.js.map
