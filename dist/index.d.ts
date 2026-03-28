import { ZenodeEngine } from "./core/engine.js";
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
/** Sets the license key for the engine. */
export declare function setLicense(key: string): void;
/** Enables or disables smart routing for connections. */
export declare function setSmartRoutingEnabled(enabled: boolean): void;
/** Enables or disables the connection drawing mode globally. */
export declare function setConnectionModeEnabled(enabled: boolean): void;
/** Sets the active connection type for newly created connections. */
export declare function setActiveConnectionType(type: string): void;
/** Sets the label text and enabled state for all default connection types. */
export declare function setConnectionLabel(text: string, enabled: boolean): void;
/** Returns the engine instance (advanced use). */
export declare function getEngine(): ZenodeEngine | null;
/** Returns the current license tier. */
export declare function getLicenseTier(): string;
/** Zooms the canvas in. */
export declare function zoomIn(): void;
/** Zooms the canvas out. */
export declare function zoomOut(): void;
/** Focuses (center + zoom) on the first selected node. */
export declare function focusOnSelectedNode(): void;
/** Registers a custom action for the context pad. */
export declare function registerContextPadAction(action: any): void;
/**
 * Demo: Registers a "Smart Connect" action that connects to the nearest port of another node.
 */
export declare function registerSmartConnect(): void;
