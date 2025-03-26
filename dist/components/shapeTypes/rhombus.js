export function drawRhombus(svg, x, y, config) {
    var _a, _b;
    const width = config.width || 100;
    const height = config.height || 50;
    const fillColor = config.color || "#ff6600";
    const strokeColor = ((_a = config.stroke) === null || _a === void 0 ? void 0 : _a.color) || "#333333";
    const strokeWidth = ((_b = config.stroke) === null || _b === void 0 ? void 0 : _b.width) || 2;
    const points = `
    ${x},${y - height / 2} 
    ${x + width / 2},${y} 
    ${x},${y + height / 2} 
    ${x - width / 2},${y}
  `;
    return svg
        .append("polygon")
        .attr("points", points)
        .attr("fill", fillColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth);
}
//# sourceMappingURL=rhombus.js.map