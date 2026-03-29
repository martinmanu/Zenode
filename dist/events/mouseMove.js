import * as d3 from 'd3';
import { defaultConfig } from '../config/defaultConfig.js';
import { snapToGrid } from '../utils/helpers.js';
import { roundedRectPath } from '../nodes/geometry/rectanglePath.js';

function svgMouseMove(event, shapeType, shapeToFind, grid, config, canvasObject, data) {
    const gridSize = config.canvas.grid.gridSize || defaultConfig.canvas.grid.gridSize;
    const zoomTransform = d3.zoomTransform(canvasObject.svg.node());
    const [cursorX, cursorY] = d3.pointer(event, canvasObject.svg.node());
    const adjustedX = (cursorX - zoomTransform.x) / zoomTransform.k;
    const adjustedY = (cursorY - zoomTransform.y) / zoomTransform.k;
    let exactPosition;
    if (config.canvasProperties.snapToGrid) {
        exactPosition = snapToGrid(adjustedX, adjustedY, gridSize);
    }
    else {
        exactPosition = { x: adjustedX, y: adjustedY };
    }
    if (shapeToFind.previewEnabled) {
        createShapePreview(shapeType, exactPosition.x, exactPosition.y, canvasObject, shapeToFind);
    }
}
function createShapePreview(shapeType, x, y, canvasObject, shapeToFind) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    removeAllPreview(canvasObject);
    let elementId = `preview_${shapeType}`;
    let shape;
    if (shapeType === "rectangle") {
        // Compute top-left corner assuming shape's position is the center.
        const width = (_a = shapeToFind.width) !== null && _a !== void 0 ? _a : 120;
        const height = (_b = shapeToFind.height) !== null && _b !== void 0 ? _b : 60;
        const x0 = x - width / 2;
        const y0 = y - height / 2;
        const r1 = ((_c = shapeToFind.borderRadius) === null || _c === void 0 ? void 0 : _c.leftTop) || 0;
        const r2 = ((_d = shapeToFind.borderRadius) === null || _d === void 0 ? void 0 : _d.rightTop) || 0;
        const r3 = ((_e = shapeToFind.borderRadius) === null || _e === void 0 ? void 0 : _e.rightBottom) || 0;
        const r4 = ((_f = shapeToFind.borderRadius) === null || _f === void 0 ? void 0 : _f.leftBottom) || 0;
        const pathData = roundedRectPath(x0, y0, width, height, r1, r2, r3, r4);
        shape = canvasObject.elements.append("path")
            .attr("id", elementId)
            .attr("d", pathData)
            .attr("fill", shapeToFind.color)
            .attr("stroke", shapeToFind.stroke.color)
            .attr("stroke-width", shapeToFind.stroke.width)
            .attr("stroke-dasharray", ((_g = shapeToFind.stroke.strokeDasharray) === null || _g === void 0 ? void 0 : _g.join(" ")) || null)
            .attr("opacity", (_h = shapeToFind.previewTransparency) !== null && _h !== void 0 ? _h : 0.5);
    }
    else if (shapeType === "circle") {
        shape = canvasObject.elements.append("circle")
            .attr("id", elementId)
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", (_j = shapeToFind.radius) !== null && _j !== void 0 ? _j : 30)
            .attr("fill", shapeToFind.color)
            .attr("stroke", shapeToFind.stroke.color)
            .attr("stroke-width", shapeToFind.stroke.width)
            .attr("opacity", (_k = shapeToFind.previewTransparency) !== null && _k !== void 0 ? _k : 0.5);
    }
    else if (shapeType === "rhombus") {
        shape = canvasObject.elements.append("polygon")
            .attr("id", elementId)
            .attr("points", `${x},${y - 30} ${x + 30},${y} ${x},${y + 30} ${x - 30},${y}`)
            .attr("fill", shapeToFind.color)
            .attr("stroke", shapeToFind.stroke.color)
            .attr("stroke-width", shapeToFind.stroke.width)
            .attr("opacity", (_l = shapeToFind.previewTransparency) !== null && _l !== void 0 ? _l : 0.5);
    }
    else {
        return null;
    }
    return shape;
}
function removeAllPreview(canvasObject) {
    canvasObject.elements.selectAll("path[id^='preview_'], polygon[id^='preview_'], circle[id^='preview_']").remove();
}

export { removeAllPreview, svgMouseMove };
//# sourceMappingURL=mouseMove.js.map
