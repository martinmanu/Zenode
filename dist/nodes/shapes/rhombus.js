const RhombusRenderer = {
    draw(g, config) {
        var _a, _b;
        g.append("path")
            .attr("d", this.getPath(config))
            .attr("fill", config.color)
            .attr("fill-opacity", (_a = config.transparency) !== null && _a !== void 0 ? _a : 1)
            .attr("stroke", config.stroke.color)
            .attr("stroke-width", config.stroke.width)
            .attr("stroke-dasharray", ((_b = config.stroke.strokeDasharray) === null || _b === void 0 ? void 0 : _b.length)
            ? config.stroke.strokeDasharray.join(" ")
            : null);
    },
    getPath(config) {
        const { x, y, width, height } = config;
        const cx = x + width / 2;
        const cy = y + height / 2;
        return `M ${cx} ${y} L ${x + width} ${cy} L ${cx} ${y + height} L ${x} ${cy} Z`;
    },
    getBounds(config) {
        return { x: config.x, y: config.y, width: config.width, height: config.height };
    },
    getPorts(config) {
        const { x, y, width, height } = config;
        return {
            top: { x: x + width / 2, y },
            bottom: { x: x + width / 2, y: y + height },
            left: { x, y: y + height / 2 },
            right: { x: x + width, y: y + height / 2 },
            center: { x: x + width / 2, y: y + height / 2 },
        };
    },
};

export { RhombusRenderer };
//# sourceMappingURL=rhombus.js.map
