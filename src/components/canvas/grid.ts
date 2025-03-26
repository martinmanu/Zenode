// src/components/canvas/drawGrid.ts
// import * as d3 from "d3";

export function drawGrid(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, gridSize: number = 20, lineColor: string = "#ccc", lineWidth: number = 0.5): void {
//   // Get the canvas dimensions
//   const width = +svg.attr("width");
//   const height = +svg.attr("height");

//   // Create a group element for the grid lines
//   const gridGroup = svg.append("g")
//     .attr("class", "grid");

//   // Draw vertical grid lines
//   for (let x = 0; x <= width; x += gridSize) {
//     gridGroup.append("line")
//       .attr("x1", x)
//       .attr("y1", 0)
//       .attr("x2", x)
//       .attr("y2", height)
//       .attr("stroke", lineColor)
//       .attr("stroke-width", lineWidth);
//   }

//   // Draw horizontal grid lines
//   for (let y = 0; y <= height; y += gridSize) {
//     gridGroup.append("line")
//       .attr("x1", 0)
//       .attr("y1", y)
//       .attr("x2", width)
//       .attr("y2", y)
//       .attr("stroke", lineColor)
//       .attr("stroke-width", lineWidth);
//   }
}
