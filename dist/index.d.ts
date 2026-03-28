import { Config } from "./model/configurationModel.js";
import { VisualState } from "./types/index.js";
/**
 * Initializes the Zenode engine.
 * @param containerSelector The selector for the container element.
 * @param userConfig Optional custom configuration.
 * @throws Error if container is not found.
 */
export declare function initializeCanvas(containerSelector: string, userConfig: Partial<Config>): void;
/**
 * Creates a shape dynamically on the canvas.
 * @param type Shape type (e.g., "rectangle", "circle").
 * @param name Optional shape name.
 * @throws Error if engine is not initialized or parameters are invalid.
 */
export declare function createShape(type: string, id: string): void;
/**
 * Creates a connection between two shapes.
 * @param from The ID or name of the first shape.
 * @param to The ID or name of the second shape.
 * @throws Error if engine is not initialized or shapes are missing.
 */
export declare function createConnection(from: string, to: string): void;
/**
 * Returns the list of placed nodes (for use with createConnection node ids).
 */
export declare function getPlacedNodes(): import("./model/interface.js").PlacedNode[];
/**
 * Connects the first two placed nodes. Convenience for demos.
 * @returns true if a connection was created, false otherwise
 */
export declare function connectFirstTwoNodes(): boolean;
/** Enable or disable lasso selection tool interaction. */
export declare function setLassoEnabled(enabled: boolean): void;
/**
 * Updates visual state for a placed node (effects/status only).
 */
export declare function updateNodeVisualState(id: string, patch: Partial<VisualState>): void;
/**
 * Updates visual state for a connection/edge (effects/status only).
 */
export declare function updateEdgeVisualState(id: string, patch: Partial<VisualState>): void;
