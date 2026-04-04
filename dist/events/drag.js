import * as d3 from 'd3';
import { snapToGrid } from '../utils/helpers.js';
import { getNodeRect } from '../nodes/overlay.js';

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
        if (!event.sourceEvent)
            return;
        event.sourceEvent.stopPropagation();
        d3.select(this).raise().classed("dragging", true);
        const isGroupBoundary = d3.select(this).classed("visual-group-boundary");
        let selection = api.getSelectedNodeIds();
        // If dragging a group boundary, ensure the whole group is selected and operation is started on group ID
        if (isGroupBoundary) {
            const groupNodesStr = d3.select(this).attr("data-group-nodes");
            // Extract group ID from class: visual-group-boundary vgroup-XXXX
            const classes = d3.select(this).attr("class").split(' ');
            const groupId = classes.find(c => c.startsWith('vgroup-'));
            if (groupNodesStr && groupId) {
                const groupIds = groupNodesStr.split(',');
                api.setSelectedNodeIds(groupIds, 'collective-group-trigger');
                selection = groupIds;
                // Start operation on the GROUP id specifically, not a member node
                api.beginOperation(groupId, 'drag');
            }
        }
        else if (!selection.includes(d.id)) {
            // If dragging a single node that isn't selected, select it.
            api.setSelectedNodeIds([d.id], d.id);
            selection = [d.id];
            api.beginOperation(d.id, 'drag');
        }
        const svgGroupNode = api.canvasObject.elements.node();
        const [px, py] = d3.pointer(event.sourceEvent, svgGroupNode);
        selection.forEach(id => {
            initialPointers.set(id, { x: px, y: py });
            const freshNode = api.getPlacedNodes().find(n => n.id === id);
            if (freshNode) {
                initialPos.set(id, { x: freshNode.x, y: freshNode.y });
            }
        });
    })
        .on("drag", function (event, d) {
        if (!event.sourceEvent)
            return;
        const svgGroupNode = api.canvasObject.elements.node();
        const [px, py] = d3.pointer(event.sourceEvent, svgGroupNode);
        const selection = api.getSelectedNodeIds();
        selection.forEach(nodeId => {
            var _a, _b;
            const startP = initialPointers.get(nodeId);
            const startD = initialPos.get(nodeId);
            if (!startP || !startD)
                return;
            const dx = px - startP.x;
            const dy = py - startP.y;
            let newX = startD.x + dx;
            let newY = startD.y + dy;
            const gridSize = (_b = (_a = api.config.canvas.grid) === null || _a === void 0 ? void 0 : _a.gridSize) !== null && _b !== void 0 ? _b : 20;
            if (api.config.canvasProperties.snapToGrid) {
                const snapped = snapToGrid(newX, newY, gridSize);
                newX = snapped.x;
                newY = snapped.y;
            }
            api.updateNodePosition(nodeId, newX, newY, false);
            // Update visual transform for immediate feedback (only for the dragged selection elements in the DOM)
            const nodeG = d3.select(`g.placed-node[data-node-id="${nodeId}"]`);
            if (!nodeG.empty()) {
                const nodeData = api.getPlacedNodes().find(n => n.id === nodeId);
                nodeG.attr("transform", `translate(${newX},${newY}) rotate(${(nodeData === null || nodeData === void 0 ? void 0 : nodeData.rotation) || 0})`);
            }
        });
        if (guideRaf !== null) {
            cancelAnimationFrame(guideRaf);
        }
        guideRaf = requestAnimationFrame(() => {
            // Alignment guides only for the PRIMARY dragged node to keep it clean
            const currentP = initialPointers.get(d.id);
            const currentD = initialPos.get(d.id);
            if (currentP && currentD) {
                const dx = px - currentP.x;
                const dy = py - currentP.y;
                renderAlignmentGuides(currentD.x + dx, currentD.y + dy, d, api);
            }
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
        const nodesToUpdate = api.getSelectedNodeIds();
        const svgGroupNode = api.canvasObject.elements.node();
        const [px, py] = d3.pointer(event.sourceEvent, svgGroupNode);
        nodesToUpdate.forEach(nodeId => {
            const startP = initialPointers.get(nodeId);
            const startD = initialPos.get(nodeId);
            if (startP && startD) {
                const dx = px - startP.x;
                const dy = py - startP.y;
                let finalX = startD.x + dx;
                let finalY = startD.y + dy;
                if (api.config.canvasProperties.snapToGrid) {
                    const snapped = snapToGrid(finalX, finalY, gridSize);
                    finalX = snapped.x;
                    finalY = snapped.y;
                }
                api.updateNodePosition(nodeId, finalX, finalY, false);
            }
            initialPointers.delete(nodeId);
            initialPos.delete(nodeId);
        });
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
