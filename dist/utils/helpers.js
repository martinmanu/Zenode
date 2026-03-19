export function snapToGrid(x, y, grid) {
    const snappedX = Math.round(x / grid) * grid;
    const snappedY = Math.round(y / grid) * grid;
    return { x: snappedX, y: snappedY };
}
/**
 * Generates a unique shape ID based on type and existing shapes.
 */
export function generateShapeId(baseId, shapeMap) {
    let count = 1;
    while (shapeMap.has(`${baseId}-${count}`)) {
        count++;
    }
    return `${baseId}-${count}`;
}
//# sourceMappingURL=helpers.js.map