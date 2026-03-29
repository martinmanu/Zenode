function getCurvedPath(params) {
    const { source, target, sourcePortId, targetPortId } = params;
    // Calculate relative distance
    const dx = Math.abs(target.x - source.x);
    const dy = Math.abs(target.y - source.y);
    // handleLength determined by distance
    const handleLength = Math.max(dx, dy) * 0.4;
    const getHandleOffset = (portId, isSource = true) => {
        // If no port specified, we try to guess based on relative position
        if (!portId || portId === 'center') {
            const factor = isSource ? 1 : -1;
            if (dx > dy)
                return { x: (target.x > source.x ? handleLength : -handleLength) * factor, y: 0 };
            return { x: 0, y: (target.y > source.y ? handleLength : -handleLength) * factor };
        }
        switch (portId) {
            case "top": return { x: 0, y: -handleLength };
            case "bottom": return { x: 0, y: handleLength };
            case "left": return { x: -handleLength, y: 0 };
            case "right": return { x: handleLength, y: 0 };
            default: return { x: 0, y: 0 };
        }
    };
    const sOffset = getHandleOffset(sourcePortId, true);
    const tOffset = getHandleOffset(targetPortId, false);
    const cp1 = { x: source.x + sOffset.x, y: source.y + sOffset.y };
    const cp2 = { x: target.x + tOffset.x, y: target.y + tOffset.y };
    return `M ${source.x} ${source.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${target.x} ${target.y}`;
}

export { getCurvedPath };
//# sourceMappingURL=curved.js.map
