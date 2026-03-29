import * as d3 from 'd3';
import { applyEffects } from '../effects/engine.js';
import { buildResolvedShapeConfig } from '../nodes/overlay.js';
import { PathCalculators } from './paths/index.js';

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
function getMarkerId(svg, type, color) {
    if (!type || type === "none")
        return "";
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
        }
        else if (type === "circle") {
            marker.append("circle").attr("cx", 5).attr("cy", 5).attr("r", 4).attr("fill", color);
        }
    }
    return id;
}
function ensureStyles() {
    if (typeof document === "undefined")
        return;
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
        g.append("path").attr("class", "connection-hitbox");
        g.append("path").attr("class", "connection-line");
        return g;
    }, (update) => update, (exit) => exit.remove())
        .each(function (d) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const group = d3.select(this);
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
        const isSelected = (_l = (_k = engine === null || engine === void 0 ? void 0 : engine.getSelectedEdgeIds) === null || _k === void 0 ? void 0 : _k.call(engine)) === null || _l === void 0 ? void 0 : _l.includes(d.id);
        const strokeColor = isSelected ? "var(--zenode-selection-color, #4A90E2)" : ((connConfig === null || connConfig === void 0 ? void 0 : connConfig.color) || "#333");
        ensureStyles();
        const markerType = (_m = connConfig === null || connConfig === void 0 ? void 0 : connConfig.lineStyle) === null || _m === void 0 ? void 0 : _m.markerEnd;
        let markerId = "";
        if (markerType && markerType !== "none") {
            const svgNode = (_o = group.node()) === null || _o === void 0 ? void 0 : _o.ownerSVGElement;
            if (svgNode) {
                markerId = getMarkerId(d3.select(svgNode), markerType, strokeColor);
            }
        }
        group
            .select("path.connection-hitbox")
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke", "transparent")
            .attr("stroke-width", 15)
            .style("cursor", "pointer")
            .on("click", (event) => {
            var _a, _b, _c;
            if ((_a = engine === null || engine === void 0 ? void 0 : engine.getPlacementContext) === null || _a === void 0 ? void 0 : _a.call(engine))
                return;
            event.stopPropagation();
            (_b = engine === null || engine === void 0 ? void 0 : engine.clearSelection) === null || _b === void 0 ? void 0 : _b.call(engine);
            (_c = engine === null || engine === void 0 ? void 0 : engine.setSelectedEdgeIds) === null || _c === void 0 ? void 0 : _c.call(engine, [d.id]);
        });
        group
            .select("path.connection-line")
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke", strokeColor)
            .attr("stroke-width", isSelected ? Math.max(((connConfig === null || connConfig === void 0 ? void 0 : connConfig.width) || 2) + 1, 3) : ((connConfig === null || connConfig === void 0 ? void 0 : connConfig.width) || 2))
            .attr("stroke-dasharray", () => {
            var _a, _b;
            if (connConfig === null || connConfig === void 0 ? void 0 : connConfig.dashed) {
                return ((_b = (_a = connConfig === null || connConfig === void 0 ? void 0 : connConfig.lineStyle) === null || _a === void 0 ? void 0 : _a.dashArray) === null || _b === void 0 ? void 0 : _b.join(",")) || "8,8";
            }
            return null;
        })
            .attr("marker-end", markerId ? `url(#${markerId})` : null)
            .style("pointer-events", "none");
        const anim = (_p = connConfig === null || connConfig === void 0 ? void 0 : connConfig.lineStyle) === null || _p === void 0 ? void 0 : _p.animation;
        if ((connConfig === null || connConfig === void 0 ? void 0 : connConfig.animated) && anim && anim.type === "flow") {
            const speed = Math.max(0.1, (_q = anim.speed) !== null && _q !== void 0 ? _q : 1);
            const duration = 1 / Math.max(0.01, speed);
            group.select("path.connection-line")
                .style("animation", `zenode-stroke-flow ${duration.toFixed(3)}s linear infinite`);
        }
        else {
            group.select("path.connection-line").style("animation", "none");
        }
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
