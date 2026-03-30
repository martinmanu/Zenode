import * as d3 from 'd3';
import { defaultConfig } from '../../config/defaultConfig.js';

// src/components/canvas/grid.ts
function drawGrid(svg, canvasConfig, grid) {
    var _a, _b;
    // Clear existing defs/rects in the grid layer to avoid duplicates on re-config
    grid.selectAll("*").remove();
    // Check if the grid is enabled
    if (!((_a = canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.grid) === null || _a === void 0 ? void 0 : _a.gridEnabled)) {
        return grid;
    }
    // Create defs if they don't exist
    let defs = svg.select("defs");
    if (defs.empty()) {
        defs = svg.append("defs");
    }
    const gridType = ((_b = canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.grid) === null || _b === void 0 ? void 0 : _b.gridType) || "dotted";
    const patternId = "zenodeGridPattern";
    // Create the appropriate pattern based on type
    if (gridType === "dotted") {
        createDottedPattern(defs, canvasConfig, patternId);
    }
    else if (gridType === "line") {
        createLinePattern(defs, canvasConfig, patternId);
    }
    else if (gridType === "cross") {
        createCrossPattern(defs, canvasConfig, patternId);
    }
    else if (gridType === "sheet") {
        createSquarePattern(defs, canvasConfig, patternId);
    }
    // Append the infinite background rect
    grid
        .append("rect")
        .attr("class", "grid-background")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", `url(#${patternId})`)
        .attr("opacity", canvasConfig.grid.gridTransparency || defaultConfig.canvas.grid.gridTransparency)
        .style("pointer-events", "none");
    return grid;
}
function updateGridTransform(svg, transform) {
    svg.select("#zenodeGridPattern").attr("patternTransform", transform.toString());
}
function toggleGrid(enable) {
    d3.select(".grid").style("display", enable ? "block" : "none");
}
function createDottedPattern(defs, config, id) {
    var _a, _b, _c, _d;
    defs.select(`#${id}`).remove();
    const gridSize = ((_a = config.grid) === null || _a === void 0 ? void 0 : _a.gridSize) || defaultConfig.canvas.grid.gridSize;
    const dimension = ((_b = config.grid) === null || _b === void 0 ? void 0 : _b.gridDimension) || defaultConfig.canvas.grid.gridDimension;
    const color = ((_c = config.grid) === null || _c === void 0 ? void 0 : _c.gridColor) || defaultConfig.canvas.grid.gridColor;
    const pattern = defs.append("pattern")
        .attr("id", id)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", gridSize)
        .attr("height", gridSize);
    if (((_d = config.grid) === null || _d === void 0 ? void 0 : _d.gridShape) === "square") {
        pattern.append("rect")
            .attr("width", dimension)
            .attr("height", dimension)
            .attr("fill", color);
    }
    else {
        pattern.append("circle")
            .attr("cx", dimension)
            .attr("cy", dimension)
            .attr("r", dimension)
            .attr("fill", color);
    }
}
function createLinePattern(defs, config, id) {
    var _a, _b, _c;
    defs.select(`#${id}`).remove();
    const gridSize = ((_a = config.grid) === null || _a === void 0 ? void 0 : _a.gridSize) || defaultConfig.canvas.grid.gridSize;
    const dimension = ((_b = config.grid) === null || _b === void 0 ? void 0 : _b.gridDimension) || defaultConfig.canvas.grid.gridDimension;
    const color = ((_c = config.grid) === null || _c === void 0 ? void 0 : _c.gridColor) || defaultConfig.canvas.grid.gridColor;
    const pattern = defs.append("pattern")
        .attr("id", id)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", gridSize)
        .attr("height", gridSize);
    pattern.append("line")
        .attr("x1", 0).attr("y1", 0).attr("x2", gridSize).attr("y2", 0)
        .attr("stroke", color).attr("stroke-width", dimension);
    pattern.append("line")
        .attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", gridSize)
        .attr("stroke", color).attr("stroke-width", dimension);
}
function createCrossPattern(defs, config, id) {
    var _a, _b, _c, _d;
    defs.select(`#${id}`).remove();
    const gridSize = ((_a = config.grid) === null || _a === void 0 ? void 0 : _a.gridSize) || defaultConfig.canvas.grid.gridSize;
    const crossLength = ((_b = config.grid) === null || _b === void 0 ? void 0 : _b.crossLength) || (gridSize / 2);
    const dimension = ((_c = config.grid) === null || _c === void 0 ? void 0 : _c.gridDimension) || 1;
    const color = ((_d = config.grid) === null || _d === void 0 ? void 0 : _d.gridColor) || defaultConfig.canvas.grid.gridColor;
    const pattern = defs.append("pattern")
        .attr("id", id)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", gridSize)
        .attr("height", gridSize);
    const mid = gridSize / 2;
    const halfLen = crossLength / 2;
    pattern.append("line")
        .attr("x1", mid - halfLen).attr("y1", mid).attr("x2", mid + halfLen).attr("y2", mid)
        .attr("stroke", color).attr("stroke-width", dimension);
    pattern.append("line")
        .attr("x1", mid).attr("y1", mid - halfLen).attr("x2", mid).attr("y2", mid + halfLen)
        .attr("stroke", color).attr("stroke-width", dimension);
}
function createSquarePattern(defs, config, id) {
    var _a, _b, _c, _d;
    defs.select(`#${id}`).remove();
    const gridSize = ((_a = config.grid) === null || _a === void 0 ? void 0 : _a.gridSize) || defaultConfig.canvas.grid.gridSize;
    const dimension = ((_b = config.grid) === null || _b === void 0 ? void 0 : _b.gridDimension) || 1;
    const cellsPerBlock = ((_c = config.grid) === null || _c === void 0 ? void 0 : _c.sheetDimension) || defaultConfig.canvas.grid.sheetDimension || 5;
    const color = ((_d = config.grid) === null || _d === void 0 ? void 0 : _d.gridColor) || "#ccc";
    const blockSize = gridSize * cellsPerBlock;
    const thickStroke = dimension * 2;
    const pattern = defs.append("pattern")
        .attr("id", id)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", blockSize)
        .attr("height", blockSize);
    // Thin lines
    for (let i = 1; i < cellsPerBlock; i++) {
        pattern.append("line")
            .attr("x1", i * gridSize).attr("y1", 0).attr("x2", i * gridSize).attr("y2", blockSize)
            .attr("stroke", color).attr("stroke-width", dimension).attr("opacity", 0.5);
        pattern.append("line")
            .attr("x1", 0).attr("y1", i * gridSize).attr("x2", blockSize).attr("y2", i * gridSize)
            .attr("stroke", color).attr("stroke-width", dimension).attr("opacity", 0.5);
    }
    // Thick borders
    pattern.append("rect")
        .attr("width", blockSize).attr("height", blockSize)
        .attr("fill", "none").attr("stroke", color).attr("stroke-width", thickStroke);
}

export { drawGrid, toggleGrid, updateGridTransform };
//# sourceMappingURL=grid.js.map
