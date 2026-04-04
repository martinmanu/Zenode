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
            api.setSelectedNodeIds([d.id]);
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
                    renderer.draw(ghostG, ghostResolved, {});
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
            renderer.draw(el, resolvedConfig, {});
            applyEffects(el, renderer.getPath(resolvedConfig), d.visualState);
            renderNodeContent(el, d.content, renderer.getBounds(resolvedConfig), api.getEditingNodeId() === d.id);
        });
        return update;
    }, (exit) => exit.remove());
    // We don't need the second .each loop here because we moved the logic into join
    // syncSelectionRings will still call renderPorts
    syncSelectionRings(placedNodesGroup, api, placedNodes);
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
