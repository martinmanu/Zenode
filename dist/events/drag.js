import * as d3 from 'd3';
import { snapToGrid } from '../utils/helpers.js';

/**
 * Creates and returns a D3 drag behavior for placed nodes.
 */
function createDragBehavior(api) {
    return d3.drag()
        .on("start", function (event, d) {
        event.sourceEvent.stopPropagation();
        d3.select(this).raise().classed("dragging", true);
    })
        .on("drag", function (event, d) {
        var _a, _b;
        const gridSize = (_b = (_a = api.config.canvas.grid) === null || _a === void 0 ? void 0 : _a.gridSize) !== null && _b !== void 0 ? _b : 20;
        const zoomTransform = d3.zoomTransform(api.svgNode);
        const [px, py] = d3.pointer(event.sourceEvent, api.svgNode);
        let newX = (px - zoomTransform.x) / zoomTransform.k;
        let newY = (py - zoomTransform.y) / zoomTransform.k;
        if (api.config.canvasProperties.snapToGrid) {
            const snapped = snapToGrid(newX, newY, gridSize);
            newX = snapped.x;
            newY = snapped.y;
        }
        d3.select(this).attr("transform", `translate(${newX},${newY})`);
        renderAlignmentGuides(newX, newY, d.id, api);
    })
        .on("end", function (event, d) {
        var _a, _b;
        d3.select(this).classed("dragging", false);
        const gridSize = (_b = (_a = api.config.canvas.grid) === null || _a === void 0 ? void 0 : _a.gridSize) !== null && _b !== void 0 ? _b : 20;
        const zoomTransform = d3.zoomTransform(api.svgNode);
        const [px, py] = d3.pointer(event.sourceEvent, api.svgNode);
        let finalX = (px - zoomTransform.x) / zoomTransform.k;
        let finalY = (py - zoomTransform.y) / zoomTransform.k;
        if (api.config.canvasProperties.snapToGrid) {
            const snapped = snapToGrid(finalX, finalY, gridSize);
            finalX = snapped.x;
            finalY = snapped.y;
        }
        api.updateNodePosition(d.id, finalX, finalY);
        if (api.canvasObject.guides) {
            api.canvasObject.guides.selectAll("*").remove();
        }
    });
}
function renderAlignmentGuides(x, y, nodeId, api) {
    var _a, _b, _c, _d;
    if (!api.canvasObject.guides)
        return;
    const alignCfg = api.config.canvasProperties.alignmentLines;
    if (!(alignCfg === null || alignCfg === void 0 ? void 0 : alignCfg.enabled))
        return;
    const nodes = api.getPlacedNodes().filter(n => n.id !== nodeId);
    const guidesLayer = api.canvasObject.guides;
    guidesLayer.selectAll("*").remove();
    const threshold = 5;
    const guideColor = (_a = alignCfg.color) !== null && _a !== void 0 ? _a : "var(--zenode-guide-color, #ffaa00)";
    const strokeWidth = (_b = alignCfg.width) !== null && _b !== void 0 ? _b : 1;
    const dashArray = alignCfg.dashed ? ((_d = (_c = alignCfg.dashArray) === null || _c === void 0 ? void 0 : _c.join(" ")) !== null && _d !== void 0 ? _d : "4 4") : null;
    const isFull = alignCfg.guideLineMode === 'full';
    // For full mode: use a very large value in canvas-space (before zoom transform)
    // The guides layer is inside the zoom group so coordinates are in canvas-space already
    const FULL_EXTENT = 1e6;
    nodes.forEach(other => {
        // Normalize other node center (rectangles store top-left, circles store center)
        const otherCX = other.x;
        const otherCY = other.y;
        // Horizontal alignment (same Y center)
        if (Math.abs(otherCY - y) < threshold) {
            const x1 = isFull ? -1e6 : Math.min(x, otherCX) - 100;
            const x2 = isFull ? FULL_EXTENT : Math.max(x, otherCX) + 100;
            guidesLayer.append("line")
                .attr("x1", x1).attr("x2", x2)
                .attr("y1", otherCY).attr("y2", otherCY)
                .attr("stroke", guideColor)
                .attr("stroke-width", strokeWidth)
                .attr("stroke-dasharray", dashArray);
        }
        // Vertical alignment (same X center)
        if (Math.abs(otherCX - x) < threshold) {
            const y1 = isFull ? -1e6 : Math.min(y, otherCY) - 100;
            const y2 = isFull ? FULL_EXTENT : Math.max(y, otherCY) + 100;
            guidesLayer.append("line")
                .attr("x1", otherCX).attr("x2", otherCX)
                .attr("y1", y1).attr("y2", y2)
                .attr("stroke", guideColor)
                .attr("stroke-width", strokeWidth)
                .attr("stroke-dasharray", dashArray);
        }
    });
}

export { createDragBehavior };
//# sourceMappingURL=drag.js.map
