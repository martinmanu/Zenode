import { ZenodeEngine } from "./core/engine";
import defaultConfig from "./config/defaultConfig.json";
let engineInstance = null;
/**
 * Initializes the Zenode engine.
 * @param containerSelector The selector for the container element.
 * @param userConfig Optional custom configuration.
 * @throws Error if container is not found.
 */
export function initialize(containerSelector, userConfig = {}) {
    if (!engineInstance) {
        const config = Object.assign(Object.assign({}, defaultConfig), userConfig);
        const container = document.querySelector(containerSelector);
        if (!container) {
            throw new Error(`Container '${containerSelector}' not found in DOM.`);
        }
        engineInstance = new ZenodeEngine(container, config);
    }
    else {
        console.warn("ZenodeEngine is already initialized!");
    }
}
/**
 * Creates a shape dynamically on the canvas.
 * @param type Shape type (e.g., "rectangle", "circle").
 * @param x X-coordinate.
 * @param y Y-coordinate.
 * @param name Optional shape name.
 * @throws Error if engine is not initialized or parameters are invalid.
 */
export function createShape(type, x, y, name = "") {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initialize() first.");
    }
    if (typeof type !== "string" || !["rectangle", "circle"].includes(type)) {
        throw new Error(`Invalid shape type '${type}'. Supported types: rectangle, circle.`);
    }
    if (typeof x !== "number" || typeof y !== "number") {
        throw new Error("X and Y coordinates must be numbers.");
    }
    engineInstance.createShape(type, x, y, name);
}
/**
 * Creates a connection between two shapes.
 * @param from The ID or name of the first shape.
 * @param to The ID or name of the second shape.
 * @throws Error if engine is not initialized or shapes are missing.
 */
export function createConnection(from, to) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initialize() first.");
    }
    if (!from || !to) {
        throw new Error("Both 'from' and 'to' shape names are required.");
    }
    engineInstance.createConnection(from, to);
}
//# sourceMappingURL=index.js.map