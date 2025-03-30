// src/components/canvas/drawCanvas.ts
import { defaultConfig } from "../../config/defaultConfig.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
export function drawCanvas(containerSelector, canvasConfig) {
    const container = d3.select(containerSelector);
    if (container.empty()) {
        throw new Error(`Container '${containerSelector}' not found in DOM.`);
    }
    let canvasClasses = canvasConfig.canvasClasses
        ? defaultConfig.canvas.canvasClasses
        : canvasConfig.canvasClasses;
    const svg = container
        .append("svg")
        .attr("width", canvasConfig.width || defaultConfig.canvas.width)
        .attr("height", canvasConfig.height || defaultConfig.canvas.height)
        .attr("class", canvasClasses.join(" "))
        .style("background-color", canvasConfig.backgroundColor || defaultConfig.canvas.backgroundColor)
        .attr("viewBox", `0 0 ${canvasConfig.width} ${canvasConfig.height}`)
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
    return {
        grid: gridLayout,
        elements: elementsGroup,
        svg: svg,
        canvasContainer: canvasContainerGroup,
    };
}
export function lockedCanvas(locked, svg, zoomBehaviour) {
    if (locked) {
        svg.on(".zoom", null); // Disable zoom and pan
        svg.style("cursor", "default");
        d3.selectAll(".shape, .connection").style("pointer-events", "none");
    }
    else {
        svg.call(zoomBehaviour); // Enable zoom and pan
        svg.style("cursor", "grab");
        d3.selectAll(".shape, .connection").style("pointer-events", "all");
    }
    console.log(`Canvas ${locked ? "locked (Preview Mode)" : "unlocked (Edit Mode)"}`);
}
//# sourceMappingURL=canvas.js.map