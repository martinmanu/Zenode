function getStraightPath(params) {
    const { source, target } = params;
    return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}

export { getStraightPath };
//# sourceMappingURL=straight.js.map
