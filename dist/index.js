import { ZenodeEngine } from './core/engine.js';

let engineInstance = null;
/**
 * Initializes the Zenode engine.
 * @param containerSelector The selector for the container element.
 * @param userConfig Optional custom configuration.
 * @throws Error if container is not found.
 */
function initializeCanvas(containerSelector, userConfig) {
    if (!engineInstance) {
        const inputConfig = Object.assign({}, userConfig);
        console.log(inputConfig);
        const container = document.querySelector(containerSelector);
        if (!container) {
            throw new Error(`Container '${containerSelector}' not found in DOM.`);
        }
        engineInstance = new ZenodeEngine(container, inputConfig);
    }
    else {
        console.warn("ZenodeEngine is already initialized!");
    }
}
/**
 * Creates a shape dynamically on the canvas.
 * @param type Shape type (e.g., "rectangle", "circle").
 * @param name Optional shape name.
 * @throws Error if engine is not initialized or parameters are invalid.
 */
function createShape(type, id) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initialize() first.");
    }
    if (typeof type !== "string" || !["rectangle", "circle", "rhombus"].includes(type)) {
        throw new Error(`Invalid shape type '${type}'. Supported types: rectangle, circle, rhombus.`);
    }
    engineInstance.createShape(type, id);
    // engineInstance.createShape(type, x, y, name);
}
/**
 * Creates a connection between two shapes.
 * @param from The ID or name of the first shape.
 * @param to The ID or name of the second shape.
 * @throws Error if engine is not initialized or shapes are missing.
 */
function createConnection(from, to) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initialize() first.");
    }
    if (!from || !to) {
        throw new Error("Both 'from' and 'to' shape names are required.");
    }
    engineInstance.createConnection(from, to);
}
/**
 * Returns the list of placed nodes (for use with createConnection node ids).
 */
function getPlacedNodes() {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
    }
    return engineInstance.getPlacedNodes();
}
/**
 * Connects the first two placed nodes. Convenience for demos.
 * @returns true if a connection was created, false otherwise
 */
function connectFirstTwoNodes() {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
    }
    const nodes = engineInstance.getPlacedNodes();
    if (nodes.length < 2) {
        console.warn("Place at least 2 shapes on the canvas, then click Connect.");
        return false;
    }
    engineInstance.createConnection(nodes[0].id, nodes[1].id);
    return true;
}
/** Enable or disable lasso selection tool interaction. */
function setLassoEnabled(enabled) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
    }
    engineInstance.setLassoEnabled(enabled);
}

export { connectFirstTwoNodes, createConnection, createShape, getPlacedNodes, initializeCanvas, setLassoEnabled };
//# sourceMappingURL=index.js.map
