export function drawCircle(svg, x, y, config) {
    var _a, _b;
    const radius = config.radius || 30;
    const fillColor = config.color || "#008000";
    const strokeColor = ((_a = config.stroke) === null || _a === void 0 ? void 0 : _a.color) || "#000000";
    const strokeWidth = ((_b = config.stroke) === null || _b === void 0 ? void 0 : _b.width) || 2;
    return svg
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", radius)
        .attr("fill", fillColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth);
}
//# sourceMappingURL=circle.js.map