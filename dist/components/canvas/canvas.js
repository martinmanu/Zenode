import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
export function drawCanvas(containerSelector, canvasConfig) {
    // Select the container using d3
    const container = d3.select(containerSelector);
    if (container.empty()) {
        throw new Error(`Container '${containerSelector}' not found in DOM.`);
    }
    //   Append an SVG element to the container
    console.log(canvasConfig);
    const svg = container
        .append("svg")
        .attr("width", canvasConfig.width || 800)
        .attr("height", canvasConfig.height || 500)
        .style("background-color", canvasConfig.backgroundColor || "red");
    return svg;
}
//# sourceMappingURL=canvas.js.map