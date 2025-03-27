import { ZenodeEngine } from "./core/engine.js";
import { Config } from "./model/configurationModel.js";

let engineInstance: ZenodeEngine | null = null;

/**
 * Initializes the Zenode engine.
 * @param containerSelector The selector for the container element.
 * @param userConfig Optional custom configuration.
 * @throws Error if container is not found.
 */
export function initializeCanvas(containerSelector: string, userConfig: Config) {
  if (!engineInstance) {
    const inputConfig : Config = { ...userConfig };
    console.log(inputConfig)
    const container = document.querySelector(containerSelector) as HTMLElement;

    if (!container) {
      throw new Error(`Container '${containerSelector}' not found in DOM.`);
    }
    engineInstance = new ZenodeEngine(container, inputConfig);
  } else {
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
export function createShape(type: string, x: number, y: number, name = "") {
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
export function createConnection(from: string, to: string) {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initialize() first.");
  }

  if (!from || !to) {
    throw new Error("Both 'from' and 'to' shape names are required.");
  }

  engineInstance.createConnection(from, to);
}
