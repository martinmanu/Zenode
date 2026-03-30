function buildResolvedShapeConfig(node, style) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const width = (_b = (_a = node.width) !== null && _a !== void 0 ? _a : style.width) !== null && _b !== void 0 ? _b : 120;
    const height = (_d = (_c = node.height) !== null && _c !== void 0 ? _c : style.height) !== null && _d !== void 0 ? _d : 60;
    const radius = (_f = (_e = node.radius) !== null && _e !== void 0 ? _e : style.radius) !== null && _f !== void 0 ? _f : 30;
    if (node.type === "circle") {
        return {
            type: node.type,
            x: 0,
            y: 0,
            width: radius * 2,
            height: radius * 2,
            radius,
            color: style.color,
            stroke: style.stroke,
            transparency: (_g = style.transparency) !== null && _g !== void 0 ? _g : 1,
            borderRadius: style.borderRadius,
        };
    }
    return {
        type: node.type,
        x: -width / 2,
        y: -height / 2,
        width,
        height,
        radius,
        color: style.color,
        stroke: style.stroke,
        transparency: (_h = style.transparency) !== null && _h !== void 0 ? _h : 1,
        borderRadius: style.borderRadius,
    };
}
function buildSelectionConfig(config, pad) {
    var _a, _b, _c, _d;
    if (config.type === "circle") {
        return Object.assign(Object.assign({}, config), { radius: config.radius + pad, width: (config.radius + pad) * 2, height: (config.radius + pad) * 2 });
    }
    const expandedBorderRadius = config.borderRadius
        ? {
            leftTop: ((_a = config.borderRadius.leftTop) !== null && _a !== void 0 ? _a : 0) + pad,
            rightTop: ((_b = config.borderRadius.rightTop) !== null && _b !== void 0 ? _b : 0) + pad,
            rightBottom: ((_c = config.borderRadius.rightBottom) !== null && _c !== void 0 ? _c : 0) + pad,
            leftBottom: ((_d = config.borderRadius.leftBottom) !== null && _d !== void 0 ? _d : 0) + pad,
        }
        : undefined;
    return Object.assign(Object.assign({}, config), { x: config.x - pad, y: config.y - pad, width: config.width + pad * 2, height: config.height + pad * 2, borderRadius: expandedBorderRadius });
}
function renderSelectionRing(selection, node, style, shapeRegistry, stroke, pad = 4) {
    const renderer = shapeRegistry.get(node.type);
    const baseConfig = buildResolvedShapeConfig(node, style);
    const ringConfig = buildSelectionConfig(baseConfig, pad);
    selection.append("path")
        .attr("class", "selection-ring")
        .attr("d", renderer.getPath(ringConfig))
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4 2")
        .style("pointer-events", "none");
}

export { buildResolvedShapeConfig, renderSelectionRing };
//# sourceMappingURL=overlay.js.map
