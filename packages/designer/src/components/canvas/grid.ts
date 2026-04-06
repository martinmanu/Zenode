// src/components/canvas/grid.ts
import * as d3 from "d3";
import { Canvas } from "@zenode/core";
import { defaultConfig } from "../../config/defaultConfig.js";

export function drawGrid(
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  canvasConfig: Canvas,
  grid: d3.Selection<SVGGElement, unknown, HTMLElement, any>
): d3.Selection<SVGGElement, unknown, HTMLElement, any> {
  // Clear existing defs/rects in the grid layer to avoid duplicates on re-config
  grid.selectAll("*").remove();

  // Check if the grid is enabled
  if (!canvasConfig?.grid?.gridEnabled) {
    return grid;
  }

  // Create defs if they don't exist
  let defs: d3.Selection<SVGDefsElement, unknown, HTMLElement, any> = svg.select("defs") as any;
  if (defs.empty()) {
    defs = svg.append("defs") as any;
  }

  const gridType = canvasConfig?.grid?.gridType || "dotted";
  const patternId = "zenodeGridPattern";

  // Create the appropriate pattern based on type
  if (gridType === "dotted") {
    createDottedPattern(defs, canvasConfig, patternId);
  } else if (gridType === "line") {
    createLinePattern(defs, canvasConfig, patternId);
  } else if (gridType === "cross") {
    createCrossPattern(defs, canvasConfig, patternId);
  } else if (gridType === "sheet") {
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

export function updateGridTransform(svg: d3.Selection<any, any, any, any>, transform: any) {
  svg.select("#zenodeGridPattern").attr("patternTransform", transform.toString());
}

export function toggleGrid(enable: boolean) {
  d3.select(".grid").style("display", enable ? "block" : "none");
}

function createDottedPattern(defs: d3.Selection<SVGDefsElement, unknown, HTMLElement, any>, config: Canvas, id: string) {
  defs.select(`#${id}`).remove();
  const gridSize = config.grid?.gridSize || defaultConfig.canvas.grid.gridSize;
  const dimension = config.grid?.gridDimension || defaultConfig.canvas.grid.gridDimension;
  const color = config.grid?.gridColor || defaultConfig.canvas.grid.gridColor;

  const pattern = defs.append("pattern")
    .attr("id", id)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", gridSize)
    .attr("height", gridSize);

  if (config.grid?.gridShape === "square") {
    pattern.append("rect")
      .attr("width", dimension)
      .attr("height", dimension)
      .attr("fill", color);
  } else {
    pattern.append("circle")
      .attr("cx", dimension)
      .attr("cy", dimension)
      .attr("r", dimension)
      .attr("fill", color);
  }
}

function createLinePattern(defs: d3.Selection<SVGDefsElement, unknown, HTMLElement, any>, config: Canvas, id: string) {
  defs.select(`#${id}`).remove();
  const gridSize = config.grid?.gridSize || defaultConfig.canvas.grid.gridSize;
  const dimension = config.grid?.gridDimension || defaultConfig.canvas.grid.gridDimension;
  const color = config.grid?.gridColor || defaultConfig.canvas.grid.gridColor;

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

function createCrossPattern(defs: d3.Selection<SVGDefsElement, unknown, HTMLElement, any>, config: Canvas, id: string) {
  defs.select(`#${id}`).remove();
  const gridSize = config.grid?.gridSize || defaultConfig.canvas.grid.gridSize;
  const crossLength = config.grid?.crossLength || (gridSize / 2);
  const dimension = config.grid?.gridDimension || 1;
  const color = config.grid?.gridColor || defaultConfig.canvas.grid.gridColor;

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

function createSquarePattern(defs: d3.Selection<SVGDefsElement, unknown, HTMLElement, any>, config: Canvas, id: string) {
  defs.select(`#${id}`).remove();
  const gridSize = config.grid?.gridSize || defaultConfig.canvas.grid.gridSize;
  const dimension = config.grid?.gridDimension || 1;
  const cellsPerBlock = config.grid?.sheetDimension || defaultConfig.canvas.grid.sheetDimension || 5;
  const color = config.grid?.gridColor || "#ccc";
  
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
