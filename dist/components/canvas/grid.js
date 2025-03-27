import { defaultConfig } from "../../config/defaultConfig.js";
export function drawGrid(svg, canvasConfig, grid) {
    //Check if the grid is enabled
    if (!canvasConfig.grid.gridEnabled) {
        return grid;
    }
    // Check Grid Type
    if (canvasConfig.grid.gridType === "dotted") {
        let gridPattern = createDottedGrid(canvasConfig, grid);
        return gridPattern;
    }
    else if (canvasConfig.grid.gridType === "line") {
        let gridPattern = createLineGrid(canvasConfig, grid);
        return gridPattern;
    }
    else if (canvasConfig.grid.gridType === "cross") {
        let gridPattern = createCrossGrid(canvasConfig, grid);
        return gridPattern;
    }
    else if (canvasConfig.grid.gridType === "sheet") {
        let gridPattern = createSquareGrid(canvasConfig, grid);
        return gridPattern;
    }
    else {
        return grid;
    }
}
function createDottedGrid(canvasConfig, grid) {
    const pattern = grid
        .append("defs")
        .append("pattern")
        .attr("id", "dotPattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize)
        .attr("height", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize);
    if (canvasConfig.grid.gridShape == "square") {
        pattern
            .append("rect")
            .attr("width", canvasConfig.grid.gridDimension ||
            defaultConfig.canvas.grid.gridDimension)
            .attr("height", canvasConfig.grid.gridDimension ||
            defaultConfig.canvas.grid.gridDimension)
            .attr("fill", canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor);
    }
    else {
        pattern
            .append("circle")
            .attr("cx", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize / 4)
            .attr("cy", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize / 4)
            .attr("r", canvasConfig.grid.gridDimension ||
            defaultConfig.canvas.grid.gridDimension)
            .attr("fill", canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor);
    }
    // Set the Grid
    grid
        .append("rect")
        .attr("x", -(canvasConfig.width * 1000))
        .attr("y", -(canvasConfig.height * 1000))
        .attr("width", canvasConfig.width * 2000)
        .attr("height", canvasConfig.height * 2000)
        .attr("fill", "url(#dotPattern)");
    console.log(grid);
    return grid;
}
function createLineGrid(canvasConfig, grid) {
    const pattern = grid
        .append("defs")
        .append("pattern")
        .attr("id", "linePattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize)
        .attr("height", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize);
    // Draw horizontal and vertical grid lines
    pattern
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize)
        .attr("y2", 0)
        .attr("stroke", canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor)
        .attr("stroke-width", canvasConfig.grid.gridDimension || defaultConfig.canvas.grid.gridDimension);
    pattern
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize)
        .attr("stroke", canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor)
        .attr("stroke-width", canvasConfig.grid.gridDimension || defaultConfig.canvas.grid.gridDimension);
    // Set the Grid
    grid
        .append("rect")
        .attr("x", -(canvasConfig.width || defaultConfig.canvas.width * 1000))
        .attr("y", -(canvasConfig.height || defaultConfig.canvas.height * 1000))
        .attr("width", canvasConfig.width || defaultConfig.canvas.width * 2000)
        .attr("height", canvasConfig.height || defaultConfig.canvas.height * 2000)
        .attr("fill", "url(#linePattern)");
    console.log(grid);
    return grid;
}
function createCrossGrid(canvasConfig, grid) {
    const pattern = grid
        .append("defs")
        .append("pattern")
        .attr("id", "dotPattern gridPattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize)
        .attr("height", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize);
    if (canvasConfig.grid.gridShape == "square") {
        pattern
            .append("rect")
            .attr("width", canvasConfig.grid.gridDimension ||
            defaultConfig.canvas.grid.gridDimension)
            .attr("height", canvasConfig.grid.gridDimension ||
            defaultConfig.canvas.grid.gridDimension)
            .attr("fill", canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor);
    }
    else {
        pattern
            .append("circle")
            .attr("cx", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize / 4)
            .attr("cy", canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize / 4)
            .attr("r", canvasConfig.grid.gridDimension ||
            defaultConfig.canvas.grid.gridDimension)
            .attr("fill", canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor);
    }
    console.log(grid);
    return grid;
}
export function createSquareGrid(canvasConfig, // Replace 'any' with your actual Canvas type if available
grid) {
    // Use gridSize from configuration; fallback to default if needed.
    const gridSize = canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize;
    // Inner grid line thickness.
    const thinStroke = (canvasConfig.grid.gridDimension && canvasConfig.grid.gridDimension > 0)
        ? canvasConfig.grid.gridDimension
        : 1;
    // Number of cells per block (sheet dimension)
    const cellsPerBlock = canvasConfig.grid.sheetDimension || defaultConfig.canvas.grid.sheetDimension;
    // Outer border thickness: set to thinStroke multiplied by the number of cells per block.
    const thickStroke = thinStroke * cellsPerBlock;
    // Block size (in pixels) equals gridSize multiplied by number of cells per block.
    const blockSize = gridSize * cellsPerBlock;
    // Create a pattern for the repeating block.
    const pattern = grid.append("defs")
        .append("pattern")
        .attr("id", "sheetPattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", blockSize)
        .attr("height", blockSize);
    // Draw inner vertical grid lines at each internal cell boundary.
    // With cellsPerBlock cells, there are (cellsPerBlock - 1) inner vertical boundaries.
    for (let i = 1; i < cellsPerBlock; i++) {
        pattern.append("line")
            .attr("x1", i * gridSize)
            .attr("y1", 0)
            .attr("x2", i * gridSize)
            .attr("y2", blockSize)
            .attr("stroke", canvasConfig.grid.gridColor || "#ccc")
            .attr("stroke-width", thinStroke);
    }
    // Draw inner horizontal grid lines at each internal cell boundary.
    for (let j = 1; j < cellsPerBlock; j++) {
        pattern.append("line")
            .attr("x1", 0)
            .attr("y1", j * gridSize)
            .attr("x2", blockSize)
            .attr("y2", j * gridSize)
            .attr("stroke", canvasConfig.grid.gridColor || "#ccc")
            .attr("stroke-width", thinStroke);
    }
    // Draw the outer border around the block with a thicker stroke.
    pattern.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", blockSize)
        .attr("height", blockSize)
        .attr("fill", "none")
        .attr("stroke", canvasConfig.grid.gridColor || "#ccc")
        .attr("stroke-width", thickStroke);
    // Fill a large rectangle (covering the entire canvas) with the repeating pattern.
    grid.append("rect")
        .attr("x", -(canvasConfig.width * 1000))
        .attr("y", -(canvasConfig.height * 1000))
        .attr("width", canvasConfig.width * 2000)
        .attr("height", canvasConfig.height * 2000)
        .attr("fill", "url(#sheetPattern)");
    console.log("Grid created:", grid);
    return grid;
}
//# sourceMappingURL=grid.js.map