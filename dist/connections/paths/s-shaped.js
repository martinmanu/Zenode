/**
 * S-Shaped curve that respects port directions for professional flow.
 */
function getSShapedPath(params) {
    const { source, target, sourcePortId, targetPortId } = params;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    // If we have port info, use it to determine the curve direction
    const isHorizontalSource = sourcePortId === "left" || sourcePortId === "right";
    const isHorizontalTarget = targetPortId === "left" || targetPortId === "right";
    if (isHorizontalSource || isHorizontalTarget) {
        // Horizontal-dominant S
        return `M ${source.x} ${source.y} C ${source.x + dx / 2} ${source.y} ${source.x + dx / 2} ${target.y} ${target.x} ${target.y}`;
    }
    else {
        // Vertical-dominant S
        return `M ${source.x} ${source.y} C ${source.x} ${source.y + dy / 2} ${target.x} ${source.y + dy / 2} ${target.x} ${target.y}`;
    }
}

export { getSShapedPath };
//# sourceMappingURL=s-shaped.js.map
