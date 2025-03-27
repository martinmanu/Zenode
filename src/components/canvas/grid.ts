// src/components/canvas/drawGrid.ts
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { Canvas } from "../../model/configurationModel.js";
import { defaultConfig } from "../../config/defaultConfig.js";

export function drawGrid(
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  canvasConfig: Canvas,
  grid: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
  //Check if the grid is enabled
  if (!canvasConfig.grid.gridEnabled) {
    return grid;
  }

  // Check Grid Type
  if (canvasConfig.grid.gridType === "dotted") {
    let gridPattern = createDottedGrid(canvasConfig, grid);
    return gridPattern;
  } else if (canvasConfig.grid.gridType === "line") {
    let gridPattern = createLineGrid(canvasConfig, grid);
    return gridPattern;
  } else if (canvasConfig.grid.gridType === "cross") {
    let gridPattern = createCrossGrid(canvasConfig, grid);
    return gridPattern;
  } else if (canvasConfig.grid.gridType === "sheet") {
    let gridPattern = createSquareGrid(canvasConfig, grid);
    return gridPattern;
  } else {
    return grid;
  }
}

function createDottedGrid(
  canvasConfig: Canvas,
  grid: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
  const pattern = grid
    .append("defs")
    .append("pattern")
    .attr("id", "dotPattern")
    .attr("patternUnits", "userSpaceOnUse")
    .attr(
      "width",
      canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize
    )
    .attr(
      "height",
      canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize
    );

  if (canvasConfig.grid.gridShape == "square") {
    pattern
      .append("rect")
      .attr(
        "width",
        canvasConfig.grid.gridDimension ||
          defaultConfig.canvas.grid.gridDimension
      )
      .attr(
        "height",
        canvasConfig.grid.gridDimension ||
          defaultConfig.canvas.grid.gridDimension
      )
      .attr(
        "fill",
        canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor
      );
  } else {
    pattern
      .append("circle")
      .attr(
        "cx",
        canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize / 4
      )
      .attr(
        "cy",
        canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize / 4
      )
      .attr(
        "r",
        canvasConfig.grid.gridDimension ||
          defaultConfig.canvas.grid.gridDimension
      )
      .attr(
        "fill",
        canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor
      );
  }

  // Set the Grid
  grid
    .append("rect")
    .attr("x", -(canvasConfig.width * 1000))
    .attr("y", -(canvasConfig.height * 1000))
    .attr("width", canvasConfig.width * 2000)
    .attr("height", canvasConfig.height * 2000)
    .attr("opacity", canvasConfig.grid.gridTransparency || defaultConfig.canvas.grid.gridTransparency)
    .attr("fill", "url(#dotPattern)");
    
  console.log(grid);
  return grid;
}

function createLineGrid(
  canvasConfig: Canvas,
  grid: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
  const pattern = grid
    .append("defs")
    .append("pattern")
    .attr("id", "linePattern")
    .attr("patternUnits", "userSpaceOnUse")
    .attr(
      "width",
      canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize
    )
    .attr(
      "height",
      canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize
    );

  // Draw horizontal and vertical grid lines

  pattern
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr(
      "x2",
      canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize
    )
    .attr("y2", 0)
    .attr(
      "stroke",
      canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor
    )
    .attr(
      "stroke-width",
      canvasConfig.grid.gridDimension || defaultConfig.canvas.grid.gridDimension
    );

  pattern
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr(
      "y2",
      canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize
    )
    .attr(
      "stroke",
      canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor
    )
    .attr(
      "stroke-width",
      canvasConfig.grid.gridDimension || defaultConfig.canvas.grid.gridDimension
    );

  // Set the Grid
  grid
    .append("rect")
    .attr("x", -(canvasConfig.width || defaultConfig.canvas.width * 1000))
    .attr("y", -(canvasConfig.height || defaultConfig.canvas.height * 1000))
    .attr("width", canvasConfig.width || defaultConfig.canvas.width * 2000)
    .attr("height", canvasConfig.height || defaultConfig.canvas.height * 2000)
    .attr("opacity", canvasConfig.grid.gridTransparency || defaultConfig.canvas.grid.gridTransparency)
    .attr("fill", "url(#linePattern)");

  console.log(grid);
  return grid;
}

function createCrossGrid(
  canvasConfig: any,
  grid: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {

  const gridSize = canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize;
  const crossArmLength = canvasConfig.grid.crossLength || (gridSize / 2);
  const strokeWidth = (canvasConfig.grid.gridDimension && canvasConfig.grid.gridDimension > 0)
                        ? canvasConfig.grid.gridDimension
                        : 1;
  const gridColor = canvasConfig.grid.gridColor || defaultConfig.canvas.grid.gridColor;
  const patternSize = gridSize;
  const pattern = grid.append("defs")
    .append("pattern")
    .attr("id", "crossGridPattern")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", patternSize)
    .attr("height", patternSize);

  const cx = patternSize / 2;
  const cy = patternSize / 2;

  pattern.append("line")
    .attr("x1", cx - crossArmLength / 2)
    .attr("y1", cy)
    .attr("x2", cx + crossArmLength / 2)
    .attr("y2", cy)
    .attr("stroke", gridColor)
    .attr("stroke-width", strokeWidth);

  pattern.append("line")
    .attr("x1", cx)
    .attr("y1", cy - crossArmLength / 2)
    .attr("x2", cx)
    .attr("y2", cy + crossArmLength / 2)
    .attr("stroke", gridColor)
    .attr("stroke-width", strokeWidth);

  grid.append("rect")
    .attr("x", -(canvasConfig.width * 1000))
    .attr("y", -(canvasConfig.height * 1000))
    .attr("width", canvasConfig.width * 2000)
    .attr("height", canvasConfig.height * 2000)
    .attr("opacity", canvasConfig.grid.gridTransparency || defaultConfig.canvas.grid.gridTransparency)
    .attr("fill", "url(#crossGridPattern)");

  console.log("Cross Grid created:", grid);
  return grid;
}

function createSquareGrid(
  canvasConfig: any, // Replace 'any' with your actual Canvas type if available
  grid: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {

  const gridSize = canvasConfig.grid.gridSize || defaultConfig.canvas.grid.gridSize;
  const thinStroke = (canvasConfig.grid.gridDimension && canvasConfig.grid.gridDimension > 0)
    ? canvasConfig.grid.gridDimension
    : 1;  
  const cellsPerBlock = canvasConfig.grid.sheetDimension || defaultConfig.canvas.grid.sheetDimension;  
  const thickStroke = thinStroke * cellsPerBlock;
  const blockSize = gridSize * cellsPerBlock;

  const pattern = grid.append("defs")
    .append("pattern")
    .attr("id", "sheetPattern")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", blockSize)
    .attr("height", blockSize);

  for (let i = 1; i < cellsPerBlock; i++) {
    pattern.append("line")
      .attr("x1", i * gridSize)
      .attr("y1", 0)
      .attr("x2", i * gridSize)
      .attr("y2", blockSize)
      .attr("stroke", canvasConfig.grid.gridColor || "#ccc")
      .attr("stroke-width", thinStroke);
  }

  for (let j = 1; j < cellsPerBlock; j++) {
    pattern.append("line")
      .attr("x1", 0)
      .attr("y1", j * gridSize)
      .attr("x2", blockSize)
      .attr("y2", j * gridSize)
      .attr("stroke", canvasConfig.grid.gridColor || "#ccc")
      .attr("stroke-width", thinStroke);
  }

  pattern.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", blockSize)
    .attr("height", blockSize)
    .attr("fill", "none")
    .attr("stroke", canvasConfig.grid.gridColor || "#ccc")
    .attr("stroke-width", thickStroke);

  grid.append("rect")
    .attr("x", -(canvasConfig.width * 1000))
    .attr("y", -(canvasConfig.height * 1000))
    .attr("width", canvasConfig.width * 2000)
    .attr("height", canvasConfig.height * 2000)
    .attr("opacity", canvasConfig.grid.gridTransparency || defaultConfig.canvas.grid.gridTransparency)
    .attr("fill", "url(#sheetPattern)");

  console.log("Grid created:", grid);
  return grid;
}