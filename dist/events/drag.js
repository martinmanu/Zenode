import * as d3 from 'd3';
import { snapToGrid } from '../utils/helpers.js';
import { buildResolvedShapeConfig } from '../nodes/overlay.js';

function getShapeStyle(node, config) {
    var _a;
    const list = (_a = config.shapes.default) === null || _a === void 0 ? void 0 : _a[node.type];
    if (!Array.isArray(list))
        return undefined;
    return list.find((s) => s.id === node.shapeVariantId);
}
function getNodeRect(node, api) {
    const style = getShapeStyle(node, api.config);
    if (!style)
        return null;
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
function upsertGuide(map, key, min, max) {
    const roundedKey = Number(key.toFixed(2));
    const existing = map.get(roundedKey);
    if (!existing) {
        map.set(roundedKey, { min, max });
        return;
    }
    existing.min = Math.min(existing.min, min);
    existing.max = Math.max(existing.max, max);
}
function getGuideStyle(alignCfg, kind) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    const fallback = {
        enabled: true,
        color: alignCfg.color,
        width: alignCfg.width,
        dashed: alignCfg.dashed,
        dashArray: alignCfg.dashArray,
    };
    if (kind === "edge") {
        return {
            enabled: (_b = (_a = alignCfg.edgeGuides) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : fallback.enabled,
            color: (_d = (_c = alignCfg.edgeGuides) === null || _c === void 0 ? void 0 : _c.color) !== null && _d !== void 0 ? _d : fallback.color,
            width: (_f = (_e = alignCfg.edgeGuides) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : fallback.width,
            dashed: (_h = (_g = alignCfg.edgeGuides) === null || _g === void 0 ? void 0 : _g.dashed) !== null && _h !== void 0 ? _h : fallback.dashed,
            dashArray: (_k = (_j = alignCfg.edgeGuides) === null || _j === void 0 ? void 0 : _j.dashArray) !== null && _k !== void 0 ? _k : fallback.dashArray,
        };
    }
    return {
        enabled: (_m = (_l = alignCfg.centerGuides) === null || _l === void 0 ? void 0 : _l.enabled) !== null && _m !== void 0 ? _m : fallback.enabled,
        color: (_p = (_o = alignCfg.centerGuides) === null || _o === void 0 ? void 0 : _o.color) !== null && _p !== void 0 ? _p : fallback.color,
        width: (_r = (_q = alignCfg.centerGuides) === null || _q === void 0 ? void 0 : _q.width) !== null && _r !== void 0 ? _r : fallback.width,
        dashed: (_t = (_s = alignCfg.centerGuides) === null || _s === void 0 ? void 0 : _s.dashed) !== null && _t !== void 0 ? _t : fallback.dashed,
        dashArray: (_v = (_u = alignCfg.centerGuides) === null || _u === void 0 ? void 0 : _u.dashArray) !== null && _v !== void 0 ? _v : fallback.dashArray,
    };
}
function createDragBehavior(api) {
    let guideRaf = null;
    const initialPos = new Map();
    const initialPointers = new Map();
    return d3.drag()
        .on("start", function (event, d) {
        var _a;
        (_a = event.sourceEvent) === null || _a === void 0 ? void 0 : _a.stopPropagation();
        d3.select(this).raise().classed("dragging", true);
        api.setSelectedNodeIds([d.id]);
        if (event.sourceEvent) {
            const svgGroupNode = api.canvasObject.elements.node();
            const [px, py] = d3.pointer(event.sourceEvent, svgGroupNode);
            initialPointers.set(d.id, { x: px, y: py });
            // Critically: Fetch the fresh state node instead of parsing the stale DOM datum `d` 
            // to prevent shapes snapping back to origin during rapid chained interactions.
            const freshNode = api.getPlacedNodes().find(n => n.id === d.id) || d;
            initialPos.set(d.id, { x: freshNode.x, y: freshNode.y });
            api.beginOperation(d.id, 'drag');
        }
    })
        .on("drag", function (event, d) {
        var _a, _b;
        if (!event.sourceEvent)
            return;
        const initialP = initialPointers.get(d.id);
        const initialD = initialPos.get(d.id);
        if (!initialP || !initialD)
            return;
        const svgGroupNode = api.canvasObject.elements.node();
        const [px, py] = d3.pointer(event.sourceEvent, svgGroupNode);
        const dx = px - initialP.x;
        const dy = py - initialP.y;
        let newX = initialD.x + dx;
        let newY = initialD.y + dy;
        const gridSize = (_b = (_a = api.config.canvas.grid) === null || _a === void 0 ? void 0 : _a.gridSize) !== null && _b !== void 0 ? _b : 20;
        if (api.config.canvasProperties.snapToGrid) {
            const snapped = snapToGrid(newX, newY, gridSize);
            newX = snapped.x;
            newY = snapped.y;
        }
        // Auto-pan if reaching boundary
        if (api.panBy) {
            const rect = api.svgNode.getBoundingClientRect();
            const margin = 40;
            const moveX = event.sourceEvent.clientX; // screen relative
            const moveY = event.sourceEvent.clientY;
            let panX = 0;
            let panY = 0;
            const speed = 1.5; // Virtual logical step mapped strictly 1:1
            if (moveX < rect.left + margin)
                panX = speed;
            else if (moveX > rect.right - margin)
                panX = -1.5;
            if (moveY < rect.top + margin)
                panY = speed;
            else if (moveY > rect.bottom - margin)
                panY = -1.5;
            if (panX !== 0 || panY !== 0) {
                api.panBy(panX, panY);
            }
        }
        d3.select(this).attr("transform", `translate(${newX},${newY}) rotate(${d.rotation || 0})`);
        // Real-time update for connections
        api.updateNodePosition(d.id, newX, newY);
        if (guideRaf !== null) {
            cancelAnimationFrame(guideRaf);
        }
        guideRaf = requestAnimationFrame(() => {
            renderAlignmentGuides(newX, newY, d, api);
            guideRaf = null;
        });
    })
        .on("end", function (event, d) {
        var _a, _b;
        d3.select(this).classed("dragging", false);
        const gridSize = (_b = (_a = api.config.canvas.grid) === null || _a === void 0 ? void 0 : _a.gridSize) !== null && _b !== void 0 ? _b : 20;
        if (!event.sourceEvent) {
            initialPointers.delete(d.id);
            initialPos.delete(d.id);
            return;
        }
        const initialP = initialPointers.get(d.id);
        const initialD = initialPos.get(d.id);
        if (initialP && initialD) {
            const svgGroupNode = api.canvasObject.elements.node();
            const [px, py] = d3.pointer(event.sourceEvent, svgGroupNode);
            const dx = px - initialP.x;
            const dy = py - initialP.y;
            let finalX = initialD.x + dx;
            let finalY = initialD.y + dy;
            if (api.config.canvasProperties.snapToGrid) {
                const snapped = snapToGrid(finalX, finalY, gridSize);
                finalX = snapped.x;
                finalY = snapped.y;
            }
            api.updateNodePosition(d.id, finalX, finalY);
        }
        initialPointers.delete(d.id);
        initialPos.delete(d.id);
        api.endOperation();
        if (guideRaf !== null) {
            cancelAnimationFrame(guideRaf);
            guideRaf = null;
        }
        if (api.canvasObject.guides) {
            api.canvasObject.guides.selectAll("*").remove();
        }
    });
}
function renderAlignmentGuides(x, y, draggingNode, api) {
    var _a;
    if (!api.canvasObject.guides)
        return;
    const alignCfg = api.config.canvasProperties.alignmentLines;
    if (!(alignCfg === null || alignCfg === void 0 ? void 0 : alignCfg.enabled))
        return;
    const nodes = api.getPlacedNodes().filter(n => n.id !== draggingNode.id);
    const guidesLayer = api.canvasObject.guides;
    guidesLayer.selectAll("*").remove();
    const threshold = (_a = alignCfg.alignmentThreshold) !== null && _a !== void 0 ? _a : 5;
    const edgeStyle = getGuideStyle(alignCfg, "edge");
    const centerStyle = getGuideStyle(alignCfg, "center");
    const isFull = alignCfg.guideLineMode === 'full';
    const dragRect = getNodeRect(Object.assign(Object.assign({}, draggingNode), { x, y }), api);
    if (!dragRect)
        return;
    const verticalEdgeGuides = new Map();
    const horizontalEdgeGuides = new Map();
    const verticalCenterGuides = new Map();
    const horizontalCenterGuides = new Map();
    nodes.forEach((other) => {
        const otherRect = getNodeRect(other, api);
        if (!otherRect)
            return;
        const dragXAnchors = [
            { value: dragRect.left, kind: "edge" },
            { value: dragRect.cx, kind: "center" },
            { value: dragRect.right, kind: "edge" },
        ];
        const otherXAnchors = [
            { value: otherRect.left, kind: "edge" },
            { value: otherRect.cx, kind: "center" },
            { value: otherRect.right, kind: "edge" },
        ];
        dragXAnchors.forEach((dx) => {
            otherXAnchors.forEach((ox) => {
                if (Math.abs(dx.value - ox.value) <= threshold) {
                    const coord = (dx.value + ox.value) / 2;
                    const targetMap = dx.kind === "center" && ox.kind === "center"
                        ? verticalCenterGuides
                        : verticalEdgeGuides;
                    upsertGuide(targetMap, coord, Math.min(dragRect.top, otherRect.top), Math.max(dragRect.bottom, otherRect.bottom));
                }
            });
        });
        const dragYAnchors = [
            { value: dragRect.top, kind: "edge" },
            { value: dragRect.cy, kind: "center" },
            { value: dragRect.bottom, kind: "edge" },
        ];
        const otherYAnchors = [
            { value: otherRect.top, kind: "edge" },
            { value: otherRect.cy, kind: "center" },
            { value: otherRect.bottom, kind: "edge" },
        ];
        dragYAnchors.forEach((dy) => {
            otherYAnchors.forEach((oy) => {
                if (Math.abs(dy.value - oy.value) <= threshold) {
                    const coord = (dy.value + oy.value) / 2;
                    const targetMap = dy.kind === "center" && oy.kind === "center"
                        ? horizontalCenterGuides
                        : horizontalEdgeGuides;
                    upsertGuide(targetMap, coord, Math.min(dragRect.left, otherRect.left), Math.max(dragRect.right, otherRect.right));
                }
            });
        });
    });
    const fullPad = 100000;
    function drawVertical(map, style) {
        var _a, _b;
        if (!style.enabled)
            return;
        const dash = style.dashed ? ((_b = (_a = style.dashArray) === null || _a === void 0 ? void 0 : _a.join(" ")) !== null && _b !== void 0 ? _b : "4 4") : null;
        map.forEach((range, xCoord) => {
            guidesLayer.append("line")
                .attr("x1", xCoord)
                .attr("x2", xCoord)
                .attr("y1", isFull ? -1e5 : range.min - 12)
                .attr("y2", isFull ? fullPad : range.max + 12)
                .attr("stroke", style.color)
                .attr("stroke-width", style.width)
                .attr("stroke-dasharray", dash);
        });
    }
    function drawHorizontal(map, style) {
        var _a, _b;
        if (!style.enabled)
            return;
        const dash = style.dashed ? ((_b = (_a = style.dashArray) === null || _a === void 0 ? void 0 : _a.join(" ")) !== null && _b !== void 0 ? _b : "4 4") : null;
        map.forEach((range, yCoord) => {
            guidesLayer.append("line")
                .attr("x1", isFull ? -1e5 : range.min - 12)
                .attr("x2", isFull ? fullPad : range.max + 12)
                .attr("y1", yCoord)
                .attr("y2", yCoord)
                .attr("stroke", style.color)
                .attr("stroke-width", style.width)
                .attr("stroke-dasharray", dash);
        });
    }
    drawVertical(verticalEdgeGuides, edgeStyle);
    drawHorizontal(horizontalEdgeGuides, edgeStyle);
    drawVertical(verticalCenterGuides, centerStyle);
    drawHorizontal(horizontalCenterGuides, centerStyle);
}

export { createDragBehavior };
//# sourceMappingURL=drag.js.map
