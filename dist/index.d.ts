import * as d3 from "d3";
import { ZenodeEngine } from "./core/engine.js";
import { Config, Connection as ConnectionConfig, ContextPadConfig as CPConfig } from "./model/configurationModel.js";
import { Connection as ConnectionInstance, PlacedNode, Node as NodeInstance } from "./model/interface.js";
import { VisualState, ContextPadAction, ContextPadTarget, NodeContent, NodeConfig, NodeData, EdgeConfig, EdgeData } from "./types/index.js";
/**
 * Initializes the Zenode engine.
 */
export declare function initializeCanvas(containerSelector: string, userConfig: Partial<Config>): void;
/** Updates the engine configuration. */
export declare function updateConfig(userConfig: Partial<Config>): void;
/** Resizes the canvas smoothly. */
export declare function resizeCanvas(width: number, height: number): void;
/** Creates a shape dynamically. */
export declare function createShape(type: string, id: string): void;
/** Creates a connection. */
export declare function createConnection(from: string, to: string): void;
/** Returns the list of placed nodes. */
export declare function getPlacedNodes(): PlacedNode[];
/** Enable or disable lasso selection tool. */
export declare function setLassoEnabled(enabled: boolean): void;
/** Updates visual state for a node. */
export declare function updateNodeVisualState(id: string, patch: Partial<VisualState>): void;
/** Updates visual state for an edge. */
export declare function updateEdgeVisualState(id: string, patch: Partial<VisualState>): void;
/** Updates the content of a node. */
export declare function updateNodeContent(id: string, content: NodeContent): void;
/** Sets the current editing node ID. */
export declare function setEditingNode(id: string | null): void;
/** Gets the current editing node ID. */
export declare function getEditingNodeId(): string | null;
/** Listens to engine events. */
export declare function on(event: string, handler: (data: any) => void): void;
/** Removes an event listener. */
export declare function off(event: string, handler: (data: any) => void): void;
export declare const addNode: (config: NodeConfig) => string;
export declare const removeNode: (id: string) => void;
export declare const updateNode: (id: string, patch: Partial<NodeConfig>) => void;
export declare const getNode: (id: string) => NodeData | null;
export declare const getAllNodes: () => NodeData[];
export declare const duplicateNode: (id: string) => string;
export declare const beginLabelEdit: (id: string, kind: "node" | "edge") => void;
export declare const validate: () => import("./core/validation.js").ValidationResult;
export declare const clear: () => void;
export declare function handleDrop(event: DragEvent): void;
export declare function placeShapeAt(type: string, id: string, x: number, y: number, data?: any): void;
export declare function placeShapeAtSafePos(type: string, id: string, data?: any): void;
export declare const addEdge: (config: EdgeConfig) => string;
export declare const removeEdge: (id: string) => void;
export declare const getEdge: (id: string) => EdgeData | null;
export declare const getAllEdges: () => EdgeData[];
export declare const focusNode: (id: string, options?: any) => void;
export declare const highlight: (id: string, options?: any) => void;
export declare const getDiagramState: () => {
    nodes: NodeData[];
    edges: EdgeData[];
    viewport: {
        x: number;
        y: number;
        zoom: number;
    };
} | null;
export declare const copySelection: () => void;
export declare const pasteSelection: (offset?: {
    x: number;
    y: number;
}) => void;
export declare function setLicense(key: string): void;
export declare function setSmartRoutingEnabled(enabled: boolean): void;
export declare function setConnectionModeEnabled(enabled: boolean): void;
export declare function setActiveConnectionType(type: string): void;
export declare function setConnectionLabel(text: string, enabled: boolean): void;
export declare function zoomIn(): void;
export declare function zoomOut(): void;
export declare function focusOnSelectedNode(): void;
export declare function undo(): void;
export declare function redo(): void;
export declare function groupSelection(): void;
export declare function ungroupSelection(): void;
export declare function toggleGroupingSelection(): void;
export declare function registerContextPadAction(action: any): void;
/** Placement and Preview APIs */
export declare function startPlacement(type: string, variantId: string, initialPoint?: {
    x: number;
    y: number;
}): string;
export declare function updatePlacementPreview(x: number, y: number): void;
export declare function completePlacement(): string;
export declare function cancelPlacement(): void;
/** Returns the engine instance. */
export declare function getEngine(): ZenodeEngine | null;
export declare function getLicenseTier(): string;
export declare function registerSmartConnect(): void;
declare const Zenode: {
    initializeCanvas: typeof initializeCanvas;
    updateConfig: typeof updateConfig;
    updateNodeContent: typeof updateNodeContent;
    getPlacedNodes: typeof getPlacedNodes;
    setActiveConnectionType: typeof setActiveConnectionType;
    setConnectionModeEnabled: typeof setConnectionModeEnabled;
    setLassoEnabled: typeof setLassoEnabled;
    resizeCanvas: typeof resizeCanvas;
    on: typeof on;
    off: typeof off;
    addNode: (config: NodeConfig) => string;
    removeNode: (id: string) => void;
    updateNode: (id: string, patch: Partial<NodeConfig>) => void;
    getNode: (id: string) => NodeData | null;
    getAllNodes: () => NodeData[];
    getDiagramState: () => {
        nodes: NodeData[];
        edges: EdgeData[];
        viewport: {
            x: number;
            y: number;
            zoom: number;
        };
    } | null;
    duplicateNode: (id: string) => string;
    beginLabelEdit: (id: string, kind: "node" | "edge") => void;
    addEdge: (config: EdgeConfig) => string;
    removeEdge: (id: string) => void;
    getEdge: (id: string) => EdgeData | null;
    getAllEdges: () => EdgeData[];
    setLicense: typeof setLicense;
    setSmartRoutingEnabled: typeof setSmartRoutingEnabled;
    setConnectionLabel: typeof setConnectionLabel;
    getEngine: typeof getEngine;
    getLicenseTier: typeof getLicenseTier;
    zoomIn: typeof zoomIn;
    zoomOut: typeof zoomOut;
    focusNode: (id: string, options?: any) => void;
    focusOnSelectedNode: typeof focusOnSelectedNode;
    undo: typeof undo;
    redo: typeof redo;
    groupSelection: typeof groupSelection;
    ungroupSelection: typeof ungroupSelection;
    toggleGroupingSelection: typeof toggleGroupingSelection;
    clear: () => void;
    validate: () => import("./core/validation.js").ValidationResult;
    registerContextPadAction: typeof registerContextPadAction;
    registerSmartConnect: typeof registerSmartConnect;
    copySelection: () => void;
    pasteSelection: (offset?: {
        x: number;
        y: number;
    }) => void;
    setEditingNode: typeof setEditingNode;
    getEditingNodeId: typeof getEditingNodeId;
    handleDrop: typeof handleDrop;
    placeShapeAt: typeof placeShapeAt;
    placeShapeAtSafePos: typeof placeShapeAtSafePos;
    d3: typeof d3;
    startPlacement: typeof startPlacement;
    updatePlacementPreview: typeof updatePlacementPreview;
    completePlacement: typeof completePlacement;
    cancelPlacement: typeof cancelPlacement;
};
export { ZenodeEngine, Config, ConnectionConfig, CPConfig, ConnectionInstance, PlacedNode, NodeInstance, VisualState, ContextPadAction, ContextPadTarget, NodeContent, NodeConfig, NodeData, EdgeConfig, EdgeData, d3 };
export default Zenode;
