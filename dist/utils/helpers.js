function snapToGrid(x, y, grid) {
    const snappedX = Math.round(x / grid) * grid;
    const snappedY = Math.round(y / grid) * grid;
    return { x: snappedX, y: snappedY };
}
/**
 * Generates a unique id for a placed node (nanoid-style short id).
 * Uses crypto.randomUUID when available, otherwise a time-based fallback.
 */
function generatePlacedNodeId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export { generatePlacedNodeId, snapToGrid };
//# sourceMappingURL=helpers.js.map
