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
        .style("background-color", canvasConfig.backgroundColor || "#ffffff")
        .attr('viewBox', `0 0 ${canvasConfig.width} ${canvasConfig.height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('display', 'block')
        .style('margin', 'auto');
    const gridLayout = svg.append('g').attr('class', 'grid');
    const elementsGroup = svg.append('g').attr('class', 'elements-group');
    return {
        grid: gridLayout,
        elements: elementsGroup,
        svg: svg
    };
}
//# sourceMappingURL=canvas.js.map