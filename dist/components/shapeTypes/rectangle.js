export function drawRectangle(svg, x, y, config) {
    var _a, _b;
    const width = config.width || 120;
    const height = config.height || 60;
    const fillColor = config.color || "#0000ff";
    const strokeColor = ((_a = config.stroke) === null || _a === void 0 ? void 0 : _a.color) || "#000000";
    const strokeWidth = ((_b = config.stroke) === null || _b === void 0 ? void 0 : _b.width) || 2;
    return svg
        .append("rect")
        .attr("x", x - width / 2)
        .attr("y", y - height / 2)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", fillColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth);
}
export function roundedRectPath(x, y, width, height, r1, // top-left
r2, // top-right
r3, // bottom-right
r4 // bottom-left
) {
    r1 = Math.min(r1, width / 2, height / 2);
    r2 = Math.min(r2, width / 2, height / 2);
    r3 = Math.min(r3, width / 2, height / 2);
    r4 = Math.min(r4, width / 2, height / 2);
    return `M ${x + r1},${y} 
          H ${x + width - r2} 
          A ${r2},${r2} 0 0 1 ${x + width},${y + r2} 
          V ${y + height - r3} 
          A ${r3},${r3} 0 0 1 ${x + width - r3},${y + height} 
          H ${x + r4} 
          A ${r4},${r4} 0 0 1 ${x},${y + height - r4} 
          V ${y + r1} 
          A ${r1},${r1} 0 0 1 ${x + r1},${y} Z`;
}
//# sourceMappingURL=rectangle.js.map