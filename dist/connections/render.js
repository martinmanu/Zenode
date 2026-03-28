import '../node_modules/d3-transition/src/selection/index.js';
import '../node_modules/d3-zoom/src/transform.js';
import { applyEffects } from '../effects/engine.js';
import { buildResolvedShapeConfig } from '../nodes/overlay.js';
import { PathCalculators } from './paths/index.js';
import select from '../node_modules/d3-selection/src/select.js';

function getNodePortPos(node, portId, registry, config) {
    var _a, _b;
    const shapeList = (_b = (_a = config.shapes.default) === null || _a === void 0 ? void 0 : _a[node.type]) !== null && _b !== void 0 ? _b : [];
    const style = shapeList.find((s) => s.id === node.shapeVariantId);
    if (!style)
        return { x: node.x, y: node.y };
    const renderer = registry.get(node.type);
    const resolved = buildResolvedShapeConfig(node, style);
    const ports = renderer.getPorts(resolved);
    const port = ports[portId] || ports.center || { x: 0, y: 0 };
    return { x: node.x + port.x, y: node.y + port.y };
}
/**
 * Draws all connections using the specialized path calculators.
 */
function renderConnections(connectionsGroup, connections, placedNodes, engine // Pass engine to get registry and config
) {
    const nodeById = new Map(placedNodes.map((n) => [n.id, n]));
    const valid = connections.filter((c) => nodeById.has(c.sourceNodeId) && nodeById.has(c.targetNodeId));
    const registry = engine === null || engine === void 0 ? void 0 : engine.shapeRegistry;
    const config = engine === null || engine === void 0 ? void 0 : engine.config;
    const binding = connectionsGroup
        .selectAll("g.connection")
        .data(valid, (d) => d.id);
    binding
        .join((enter) => {
        const g = enter
            .append("g")
            .attr("class", "connection")
            .attr("data-connection-id", (d) => d.id);
        g.append("path").attr("class", "connection-line");
        return g;
    }, (update) => update, (exit) => exit.remove())
        .each(function (d) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const group = select(this);
        const sourceNode = nodeById.get(d.sourceNodeId);
        const targetNode = nodeById.get(d.targetNodeId);
        let source = { x: sourceNode.x, y: sourceNode.y };
        let target = { x: targetNode.x, y: targetNode.y };
        if (registry && config) {
            source = getNodePortPos(sourceNode, d.sourcePortId, registry, config);
            target = getNodePortPos(targetNode, d.targetPortId, registry, config);
        }
        else {
            // Fallback to center if engine not provided
            source = { x: sourceNode.x + ((_a = sourceNode.width) !== null && _a !== void 0 ? _a : 0) / 2, y: sourceNode.y + ((_b = sourceNode.height) !== null && _b !== void 0 ? _b : 0) / 2 };
            target = { x: targetNode.x + ((_c = targetNode.width) !== null && _c !== void 0 ? _c : 0) / 2, y: targetNode.y + ((_d = targetNode.height) !== null && _d !== void 0 ? _d : 0) / 2 };
        }
        const params = {
            source,
            target,
            sourcePortId: d.sourcePortId,
            targetPortId: d.targetPortId
        };
        let path;
        if ((_e = engine === null || engine === void 0 ? void 0 : engine.isSmartRoutingEnabled) === null || _e === void 0 ? void 0 : _e.call(engine)) {
            const obstacles = placedNodes.map(n => ({
                id: n.id,
                x: n.x,
                y: n.y,
                width: n.width || 0,
                height: n.height || 0
            }));
            path = engine.smartRouter.calculatePath(params, obstacles);
        }
        else {
            const calculator = PathCalculators[d.type] || PathCalculators.straight;
            path = calculator(params);
        }
        // Style from config
        const connConfig = ((_g = (_f = config === null || config === void 0 ? void 0 : config.connections) === null || _f === void 0 ? void 0 : _f.default) === null || _g === void 0 ? void 0 : _g[d.type]) ||
            ((_j = (_h = config === null || config === void 0 ? void 0 : config.connections) === null || _h === void 0 ? void 0 : _h.default) === null || _j === void 0 ? void 0 : _j.straight);
        group
            .select("path.connection-line")
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke", (connConfig === null || connConfig === void 0 ? void 0 : connConfig.color) || "#333")
            .attr("stroke-width", (connConfig === null || connConfig === void 0 ? void 0 : connConfig.width) || 2)
            .attr("stroke-dasharray", ((_l = (_k = connConfig === null || connConfig === void 0 ? void 0 : connConfig.lineStyle) === null || _k === void 0 ? void 0 : _k.dashArray) === null || _l === void 0 ? void 0 : _l.join(",")) || null)
            .style("pointer-events", "none");
        // Render Label
        renderConnectionLabel(group, path, d, config);
        applyEffects(group, path, d.visualState);
    });
}
/**
 * Renders a pill-style text label at the midpoint of the path.
 */
function renderConnectionLabel(group, pathData, d, config) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    // Find connection config for styles
    const connConfig = ((_b = (_a = config === null || config === void 0 ? void 0 : config.connections) === null || _a === void 0 ? void 0 : _a.default) === null || _b === void 0 ? void 0 : _b[d.type]) ||
        ((_d = (_c = config === null || config === void 0 ? void 0 : config.connections) === null || _c === void 0 ? void 0 : _c.default) === null || _d === void 0 ? void 0 : _d.straight);
    const lineStyle = connConfig === null || connConfig === void 0 ? void 0 : connConfig.lineStyle;
    if (!(lineStyle === null || lineStyle === void 0 ? void 0 : lineStyle.innerTextEnabled)) {
        group.select("g.label-group").remove();
        return;
    }
    const labelText = lineStyle.innerText || "";
    if (!labelText)
        return;
    // Use a temporary path to find the midpoint
    const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempPath.setAttribute("d", pathData);
    // Temporarily append to measure correctly
    const svgNode = (_e = group.node()) === null || _e === void 0 ? void 0 : _e.ownerSVGElement;
    if (svgNode)
        svgNode.appendChild(tempPath);
    const totalLength = tempPath.getTotalLength();
    const midpoint = tempPath.getPointAtLength(totalLength / 2);
    if (svgNode)
        svgNode.removeChild(tempPath);
    let labelGroup = group.select("g.label-group");
    if (labelGroup.empty()) {
        labelGroup = group.append("g").attr("class", "label-group");
        labelGroup.append("rect").attr("class", "label-bg");
        labelGroup.append("text").attr("class", "label-text");
    }
    const padding = (_f = lineStyle.labelPadding) !== null && _f !== void 0 ? _f : 4;
    const fontSize = (_g = lineStyle.innerTextSize) !== null && _g !== void 0 ? _g : 12;
    const text = labelGroup.select("text.label-text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", lineStyle.innerTextColor || "#000")
        .style("font-size", `${fontSize}px`)
        .style("pointer-events", "none")
        .text(labelText);
    // Get text bounds for the background pill
    const bbox = text.node().getBBox();
    labelGroup.select("rect.label-bg")
        .attr("x", midpoint.x - bbox.width / 2 - padding)
        .attr("y", midpoint.y - bbox.height / 2 - padding)
        .attr("width", bbox.width + padding * 2)
        .attr("height", bbox.height + padding * 2)
        .attr("rx", (_h = lineStyle.labelBorderRadius) !== null && _h !== void 0 ? _h : 4)
        .attr("fill", lineStyle.labelBackground || "#ffffff")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 0.5);
    text.attr("x", midpoint.x).attr("y", midpoint.y);
}
/**
 * Renders a ghost connection line from a port to the current mouse position.
 */
function renderGhostConnection(ghostGroup, from, to, style, // GhostConnectionStyle
type = "straight", sourcePortId, targetPortId) {
    var _a, _b;
    const params = {
        source: from,
        target: to,
        sourcePortId,
        targetPortId
    };
    const calculator = PathCalculators[type] || PathCalculators.straight;
    const path = calculator(params);
    const line = ghostGroup.selectAll("path.ghost-line").data([null]);
    const color = (style === null || style === void 0 ? void 0 : style.color) || "var(--zenode-selection-color, #4A90E2)";
    const width = (style === null || style === void 0 ? void 0 : style.strokeWidth) || 2;
    const opacity = (_a = style === null || style === void 0 ? void 0 : style.opacity) !== null && _a !== void 0 ? _a : 1;
    const dash = (style === null || style === void 0 ? void 0 : style.dashed) ? (((_b = style.dashArray) === null || _b === void 0 ? void 0 : _b.join(" ")) || "4 4") : "none";
    line.join((enter) => enter.append("path").attr("class", "ghost-line"), (update) => update)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", width)
        .attr("stroke-dasharray", dash)
        .attr("opacity", opacity)
        .style("pointer-events", "none");
}

export { renderConnections, renderGhostConnection };
//# sourceMappingURL=render.js.map
