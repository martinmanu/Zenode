import { ZenodeEngine } from "./core/engine.js";
import { Config } from "./model/configurationModel.js";
import * as d3 from "d3";

let engineInstance: ZenodeEngine | null = null;

/**
 * Initializes the Zenode engine.
 * @param containerSelector The selector for the container element.
 * @param userConfig Optional custom configuration.
 * @throws Error if container is not found.
 */
export function initializeCanvas(containerSelector: string, userConfig: Partial<Config>) {
  if (!engineInstance) {
    const inputConfig : Partial<Config> = { ...userConfig };
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
 * @param name Optional shape name.
 * @throws Error if engine is not initialized or parameters are invalid.
 */
export function createShape(type: string, id: string) {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initialize() first.");
  }
  
  if (typeof type !== "string" || !["rectangle", "circle", "rhombus"].includes(type)) {
    throw new Error(`Invalid shape type '${type}'. Supported types: rectangle, circle, rhombus.`);
  }
  engineInstance.createShape(type, id)
  // engineInstance.createShape(type, x, y, name);
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

/**
 * Returns the list of placed nodes (for use with createConnection node ids).
 */
export function getPlacedNodes() {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
  }
  return engineInstance.getPlacedNodes();
}

/**
 * Connects the first two placed nodes. Convenience for demos.
 * @returns true if a connection was created, false otherwise
 */
export function connectFirstTwoNodes(): boolean {
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
export function setLassoEnabled(enabled: boolean): void {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
  }
  engineInstance.setLassoEnabled(enabled);
}