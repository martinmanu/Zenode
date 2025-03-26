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
//# sourceMappingURL=rectangle.js.map