import { roundedRectPath } from '../geometry/rectanglePath.js';

const RectangleRenderer = {
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
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const { x, y, width, height } = config;
        const tl = (_b = (_a = config.borderRadius) === null || _a === void 0 ? void 0 : _a.leftTop) !== null && _b !== void 0 ? _b : 0;
        const tr = (_d = (_c = config.borderRadius) === null || _c === void 0 ? void 0 : _c.rightTop) !== null && _d !== void 0 ? _d : 0;
        const br = (_f = (_e = config.borderRadius) === null || _e === void 0 ? void 0 : _e.rightBottom) !== null && _f !== void 0 ? _f : 0;
        const bl = (_h = (_g = config.borderRadius) === null || _g === void 0 ? void 0 : _g.leftBottom) !== null && _h !== void 0 ? _h : 0;
        return roundedRectPath(x, y, width, height, tl, tr, br, bl);
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

export { RectangleRenderer };
//# sourceMappingURL=rectangle.js.map
