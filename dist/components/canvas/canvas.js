import { defaultConfig } from '../../config/defaultConfig.js';
import '../../node_modules/d3-transition/src/selection/index.js';
import '../../node_modules/d3-zoom/src/transform.js';
import select from '../../node_modules/d3-selection/src/select.js';
import selectAll from '../../node_modules/d3-selection/src/selectAll.js';

// src/components/canvas/drawCanvas.ts
function drawCanvas(containerSelector, canvasConfig) {
    const container = select(containerSelector);
    if (container.empty()) {
        throw new Error(`Container '${containerSelector}' not found in DOM.`);
    }
    let canvasClasses = (canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.canvasClasses) || defaultConfig.canvas.canvasClasses;
    const width = (canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.width) || defaultConfig.canvas.width;
    const height = (canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.height) || defaultConfig.canvas.height;
    const backgroundColor = (canvasConfig === null || canvasConfig === void 0 ? void 0 : canvasConfig.backgroundColor) || defaultConfig.canvas.backgroundColor;
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
    const ghostConnectionGroup = canvasContainerGroup
        .insert("g", ".elements-group")
        .attr("class", "ghost-connection")
        .style("pointer-events", "none");
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
        ghostConnection: ghostConnectionGroup,
        placedNodes: placedNodesGroup,
        guides: guidesGroup,
        lasso: lassoGroup,
    };
}
function lockedCanvas(locked, svg, zoomBehaviour) {
    if (locked) {
        svg.on(".zoom", null); // Disable zoom and pan
        svg.style("cursor", "default");
        selectAll(".shape, .connection").style("pointer-events", "none");
    }
    else {
        svg.call(zoomBehaviour); // Enable zoom and pan
        svg.style("cursor", "grab");
        selectAll(".shape, .connection").style("pointer-events", "all");
    }
    console.log(`Canvas ${locked ? "locked (Preview Mode)" : "unlocked (Edit Mode)"}`);
}

export { drawCanvas, lockedCanvas };
//# sourceMappingURL=canvas.js.map
