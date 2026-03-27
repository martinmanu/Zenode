// src/components/canvas/drawCanvas.ts
import { defaultConfig } from "../../config/defaultConfig.js";
import { Canvas } from "../../model/configurationModel.js";
import * as d3 from "d3";

export function drawCanvas(
  containerSelector: string,
  canvasConfig: Canvas
): {
  svg: any;
  grid: any;
  elements: any;
  canvasContainer: any;
  connections: any;
  placedNodes: any;
  guides: any;
  lasso: any;
} {
  const container = d3.select(containerSelector);
  if (container.empty()) {
    throw new Error(`Container '${containerSelector}' not found in DOM.`);
  }
  let canvasClasses = canvasConfig?.canvasClasses || defaultConfig.canvas.canvasClasses;
  const width = canvasConfig?.width || defaultConfig.canvas.width;
  const height = canvasConfig?.height || defaultConfig.canvas.height;
  const backgroundColor = canvasConfig?.backgroundColor || defaultConfig.canvas.backgroundColor;
  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", canvasClasses.join(" "))
    .style("background-color", backgroundColor)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("display", "block")
    .style("margin", "auto");
  const canvasContainerGroup = svg
    .append("g")
    .attr("class", "canvas-container");
  const gridLayout = canvasContainerGroup.append("g").attr("class", "grid");
  const elementsGroup = canvasContainerGroup
    .append("g")
    .attr("class", "elements-group");
  // Insert below preview so layer order: grid, connections, placed-nodes, preview
  const connectionsGroup = canvasContainerGroup
    .insert("g", ".elements-group")
    .attr("class", "connections");
  const placedNodesGroup = canvasContainerGroup
    .insert("g", ".elements-group")
    .attr("class", "placed-nodes");
  const guidesGroup = canvasContainerGroup
    .append("g")
    .attr("class", "guides")
    .style("pointer-events", "none");

  const lassoGroup = canvasContainerGroup
    .append("g")
    .attr("class", "lasso")
    .style("pointer-events", "none");

  elementsGroup.style("pointer-events", "none");

  return {
    grid: gridLayout,
    elements: elementsGroup,
    svg: svg,
    canvasContainer: canvasContainerGroup,
    connections: connectionsGroup,
    placedNodes: placedNodesGroup,
    guides: guidesGroup,
    lasso: lassoGroup,
  };
}

export function lockedCanvas(locked: boolean , svg: any, zoomBehaviour: any) {
  
  if (locked) {
    svg.on(".zoom", null); // Disable zoom and pan
    svg.style("cursor", "default");
    d3.selectAll(".shape, .connection").style("pointer-events", "none");
  } else {
    svg.call(zoomBehaviour); // Enable zoom and pan
    svg.style("cursor", "grab");
    d3.selectAll(".shape, .connection").style("pointer-events", "all");
  }

  console.log(`Canvas ${locked ? "locked (Preview Mode)" : "unlocked (Edit Mode)"}`);
}
