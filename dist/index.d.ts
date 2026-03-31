import * as d3 from "d3";
import { ZenodeEngine } from "./core/engine.js";
import { Config, Connection as ConnectionConfig, ContextPadConfig as CPConfig } from "./model/configurationModel.js";
import { Connection as ConnectionInstance, PlacedNode, Node as NodeInstance } from "./model/interface.js";
import { VisualState, ContextPadAction, ContextPadTarget, NodeContent, NodeConfig, NodeData, EdgeConfig, EdgeData } from "./types/index.js";
export { ZenodeEngine, Config, ConnectionConfig, CPConfig, ConnectionInstance, PlacedNode, NodeInstance, VisualState, ContextPadAction, ContextPadTarget, NodeContent, NodeConfig, NodeData, EdgeConfig, EdgeData, d3 };
/**
 * Initializes the Zenode engine.
 * @param containerSelector The selector for the container element.
 * @param userConfig Optional custom configuration.
 * @throws Error if container is not found.
 */
declare function initializeCanvas(containerSelector: string, userConfig: Partial<Config>): void;
/**
 * Updates the engine configuration.
 * @param userConfig New configuration object.
 */
declare function updateConfig(userConfig: Partial<Config>): void;
/**
 * Resizes the canvas dimensions smoothly.
 */
declare function resizeCanvas(width: number, height: number): void;
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
declare function getPlacedNodes(): PlacedNode[];
/** Enable or disable lasso selection tool interaction. */
declare function setLassoEnabled(enabled: boolean): void;
/**
 * Updates visual state for a placed node (effects/status only).
 */
export declare function updateNodeVisualState(id: string, patch: Partial<VisualState>): void;
/**
 * Updates visual state for a connection/edge (effects/status only).
 */
export declare function updateEdgeVisualState(id: string, patch: Partial<VisualState>): void;
/**
 * Updates the content (text, icon, layout) of a placed node.
 */
declare function updateNodeContent(id: string, content: NodeContent): void;
/**
 * Listens to engine events.
 */
declare function on(event: string, handler: (data: any) => void): void;
/**
 * Removes an event listener.
 */
export declare function off(event: string, handler: (data: any) => void): void;
declare const addNode: (config: NodeConfig) => string;
declare const removeNode: (id: string) => void;
declare const updateNode: (id: string, patch: Partial<NodeConfig>) => void;
declare const getNode: (id: string) => NodeData | null;
declare const getAllNodes: () => NodeData[];
declare const duplicateNode: (id: string) => string;
/** Triggers the text editor programmatically. */
declare const beginLabelEdit: (id: string, kind: "node" | "edge") => void;
/** Adds a new connection programmatically. */
declare const addEdge: (config: EdgeConfig) => string;
/** Removes a connection by ID. */
declare const removeEdge: (id: string) => void;
/** Returns a connection state by ID. */
declare const getEdge: (id: string) => EdgeData | null;
/** Returns all connections on the canvas. */
declare const getAllEdges: () => EdgeData[];
export { initializeCanvas, updateConfig, updateNodeContent, getPlacedNodes, setActiveConnectionType, setConnectionModeEnabled, setLassoEnabled, resizeCanvas, on, addNode, removeNode, updateNode, getNode, getAllNodes, duplicateNode, beginLabelEdit, addEdge, removeEdge, getEdge, getAllEdges, setLicense, setSmartRoutingEnabled, setConnectionLabel, getEngine, getLicenseTier, zoomIn, zoomOut, focusOnSelectedNode, registerContextPadAction, registerSmartConnect };
/** Sets the license key for the engine. */
declare function setLicense(key: string): void;
/** Enables or disables smart routing for connections. */
declare function setSmartRoutingEnabled(enabled: boolean): void;
/** Enables or disables the connection drawing mode globally. */
declare function setConnectionModeEnabled(enabled: boolean): void;
/** Sets the active connection type for newly created connections. */
declare function setActiveConnectionType(type: string): void;
/** Sets the label text and enabled state for all default connection types. */
declare function setConnectionLabel(text: string, enabled: boolean): void;
/** Returns the engine instance (advanced use). */
declare function getEngine(): ZenodeEngine | null;
/** Returns the current license tier. */
declare function getLicenseTier(): string;
/** Zooms the canvas in. */
declare function zoomIn(): void;
/** Zooms the canvas out. */
declare function zoomOut(): void;
/** Focuses (center + zoom) on the first selected node. */
declare function focusOnSelectedNode(): void;
/** Registers a custom action for the context pad. */
declare function registerContextPadAction(action: any): void;
/**
 * Registers a "Smart Connect" action that finds the nearest port on another node
 * and connects using the closest matching source port.
 */
declare function registerSmartConnect(): void;
