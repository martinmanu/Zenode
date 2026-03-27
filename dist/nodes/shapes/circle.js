const CircleRenderer = {
    draw(g, config) {
        var _a, _b;
        g.append("circle")
            .attr("cx", config.x)
            .attr("cy", config.y)
            .attr("r", config.radius)
            .attr("fill", config.color)
            .attr("fill-opacity", (_a = config.transparency) !== null && _a !== void 0 ? _a : 1)
            .attr("stroke", config.stroke.color)
            .attr("stroke-width", config.stroke.width)
            .attr("stroke-dasharray", ((_b = config.stroke.strokeDasharray) === null || _b === void 0 ? void 0 : _b.length)
            ? config.stroke.strokeDasharray.join(" ")
            : null);
    },
    getPath(config) {
        const cx = config.x;
        const cy = config.y;
        const r = config.radius;
        return [
            `M ${cx - r} ${cy}`,
            `a ${r} ${r} 0 1 0 ${2 * r} 0`,
            `a ${r} ${r} 0 1 0 ${ -2 * r} 0`,
        ].join(" ");
    },
    getBounds(config) {
        const r = config.radius;
        return {
            x: config.x - r,
            y: config.y - r,
            width: r * 2,
            height: r * 2,
        };
    },
    getPorts(config) {
        const { x, y, radius: r } = config;
        return {
            top: { x, y: y - r },
            bottom: { x, y: y + r },
            left: { x: x - r, y },
            right: { x: x + r, y },
            center: { x, y },
        };
    },
};

export { CircleRenderer };
//# sourceMappingURL=circle.js.map
