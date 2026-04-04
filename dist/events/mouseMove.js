import * as d3 from 'd3';
import { defaultConfig } from '../config/defaultConfig.js';
import { snapToGrid } from '../utils/helpers.js';

function svgMouseMove(event, shapeType, shapeToFind, grid, config, canvasObject, data, registry, manualPoint) {
    const gridSize = config.canvas.grid.gridSize || defaultConfig.canvas.grid.gridSize;
    const zoomTransform = d3.zoomTransform(canvasObject.svg.node());
    let x, y;
    if (event) {
        const [cursorX, cursorY] = d3.pointer(event, canvasObject.svg.node());
        x = cursorX;
        y = cursorY;
    }
    else {
        return { x: 0, y: 0 };
    }
    const adjustedX = (x - zoomTransform.x) / zoomTransform.k;
    const adjustedY = (y - zoomTransform.y) / zoomTransform.k;
    let exactPosition;
    if (config.canvasProperties.snapToGrid) {
        exactPosition = snapToGrid(adjustedX, adjustedY, gridSize);
    }
    else {
        exactPosition = { x: adjustedX, y: adjustedY };
    }
    if (shapeToFind.previewEnabled) {
        createShapePreview(shapeType, exactPosition.x, exactPosition.y, canvasObject, shapeToFind, registry);
    }
    return exactPosition;
}
function createShapePreview(shapeType, x, y, canvasObject, shapeToFind, registry) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    removeAllPreview(canvasObject);
    let elementId = `preview_${shapeType}`;
    let shape;
    if (registry && registry.has(shapeType)) {
        const renderer = registry.get(shapeType);
        const radius = (_a = shapeToFind.radius) !== null && _a !== void 0 ? _a : 30;
        const width = (_b = shapeToFind.width) !== null && _b !== void 0 ? _b : radius * 2;
        const height = (_c = shapeToFind.height) !== null && _c !== void 0 ? _c : radius * 2;
        // All renderers draw with (0,0) as the anchor (center or top-left).
        // We use a <g translate(x,y)> so the path coordinates are always
        // relative to (0,0), then shifted to the cursor position regardless
        // of shape type. This fixes the circle offset bug.
        //
        // Circle renderer uses (cx=x, cy=y) as the CENTER — so pass x:0,y:0.
        // Rect/polygon renderers use the top-left corner — so offset by -w/2,-h/2
        // to keep them visually centered on the cursor too.
        const isCircleLike = shapeType === "circle";
        const tempConfig = {
            type: shapeType,
            x: isCircleLike ? 0 : -width / 2,
            y: isCircleLike ? 0 : -height / 2,
            width,
            height,
            radius,
            color: shapeToFind.color,
            stroke: shapeToFind.stroke,
            transparency: shapeToFind.transparency,
            borderRadius: shapeToFind.borderRadius
        };
        const pathData = renderer.getPath(tempConfig);
        const group = canvasObject.elements.append("g")
            .attr("id", elementId)
            .attr("transform", `translate(${x},${y})`);
        shape = group.append("path")
            .attr("d", pathData)
            .attr("fill", shapeToFind.color)
            .attr("stroke", (_e = (_d = shapeToFind.stroke) === null || _d === void 0 ? void 0 : _d.color) !== null && _e !== void 0 ? _e : "#000")
            .attr("stroke-width", (_g = (_f = shapeToFind.stroke) === null || _f === void 0 ? void 0 : _f.width) !== null && _g !== void 0 ? _g : 1)
            .attr("stroke-dasharray", ((_j = (_h = shapeToFind.stroke) === null || _h === void 0 ? void 0 : _h.strokeDasharray) === null || _j === void 0 ? void 0 : _j.join(" ")) || null)
            .attr("opacity", (_k = shapeToFind.previewTransparency) !== null && _k !== void 0 ? _k : 0.5);
        return group;
    }
    return shape;
}
function removeAllPreview(canvasObject) {
    canvasObject.elements.selectAll("path[id^='preview_'], polygon[id^='preview_'], circle[id^='preview_'], g[id^='preview_']").remove();
}

export { removeAllPreview, svgMouseMove };
//# sourceMappingURL=mouseMove.js.map
