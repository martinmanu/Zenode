import { Config } from "../model/configurationModel.js";
import { ZoomManager } from "./zoom&PanManager.js";
import { CanvasElements, PlacedNode, VisualGroup } from "../model/interface.js";
import { ContextPadAction, ContextPadTarget, ShapeRenderer, BoundingBox, VisualState, NodeConfig, NodeData, EdgeConfig, EdgeData } from "../types/index.js";
import { StoredConnection } from "../connections/render.js";
import { ShapeRegistry } from "../nodes/registry.js";
export declare class ZenodeEngine {
    container: HTMLElement | null;
    private config;
    shapeRegistry: ShapeRegistry;
    svg: any;
    private grid;
    private alignmentLine;
    private elements;
    private zoomBehaviour;
    private shapeMap;
    private shapes;
    private connections;
    /** Placed nodes on the canvas. Source of truth for g.placed-nodes layer. */
    private placedNodes;
    /** Selected node ids (single or multi-select). */
    private selectedNodeIds;
    /** Selected edge ids (single or multi-select). */
    private selectedEdgeIds;
    /** Controls whether lasso interaction is active on canvas background drag. */
    private lassoEnabled;
    /** Prevents background click handler from clearing selection right after lasso mouseup. */
    private suppressNextCanvasClick;
    /** When set, next click will place a node of this type/config (preview → placed). */
    placementContext: {
        type: string;
        variantId?: string;
        ghostId: string;
    } | null;
    /** When set, a connection is being dragged from this port. */
    private connectionDragContext;
    connectionModeEnabled: boolean;
    rotationModeEnabled: boolean;
    resizeModeEnabled: boolean;
    private licenseManager;
    private smartRouter;
    private smartRoutingEnabled;
    private activeConnectionType;
    private eventManager;
    zoomManager: ZoomManager;
    canvasObject: CanvasElements;
    private canvasContainerGroup;
    private contextPadRegistry;
    private contextPadRenderer;
    private activeOperation;
    private undoManager;
    private selectionKeyboardListener;
    private clipboard;
    private editingNodeId;
    private onWindowMouseUp;
    private onWindowMouseMove;
    /** Transient visual groups (for interaction only, no structural parentId). */
    private visualGroups;
    private demoEnabled;
    private validationEngine;
    constructor(container: HTMLElement | null, config: Partial<Config>);
    private initializeContextPad;
    undo(): void;
    clear(): void;
    redo(): void;
    private setupKeyboardShortcuts;
    /**
     * Registers a custom action for the context pad.
     */
    isConnectionModeEnabled(): boolean;
    registerContextPadAction(action: ContextPadAction): void;
    unregisterContextAction(id: string): void;
    /**
     * Listens to engine events (including context pad events).
     */
    on(eventType: string, callback: (event: any) => void): void;
    off(eventType: string, callback: (event: any) => void): void;
    /**
     * Manually shows the context pad for a specific target.
     */
    showContextPad(target: ContextPadTarget): void;
    /**
     * Updates canvas dimensions without a full re-render.
     */
    resizeCanvas(width: number, height: number): void;
    updateConfig(newConfig: Partial<Config>, recordHistory?: boolean): void;
    /**
     * Manually hides the context pad.
     */
    hideContextPad(): void;
    beginOperation(nodeId: string, type: 'drag' | 'rotate' | 'resize'): void;
    endOperation(): void;
    getActiveOperation(): {
        type: string;
        nodeId: string;
        originalData: PlacedNode;
        selectionStates?: Map<string, PlacedNode>;
    } | null;
    emit(eventType: string, event: any): void;
    private initDrag;
    private registerBuiltInShapes;
    /** Public API for custom shape extension. */
    registerShape(name: string, renderer: ShapeRenderer): void;
    initializeCanvas(): void;
    /** SVG root DOM node — passed to DragApi for correct pointer coordinate transform */
    get svgNode(): SVGSVGElement;
    /** Returns current placement context (shape type + config for next click). */
    getPlacementContext(): {
        type: string;
        variantId?: string;
        ghostId: string;
    } | null;
    /** Clears placement context (e.g. after placing or cancel). */
    clearPlacementContext(): void;
    /**
     * Loads a small, pre-built sample workflow to guide new users.
     */
    loadSampleWorkflow(): void;
    /**
     * Programmatically adds a node to the canvas.
     * @param config Partial configuration for the new node.
     * @returns The ID of the created node.
     */
    addNode(config: NodeConfig, recordHistory?: boolean): string;
    /**
     * Removes a node and its associated connections.
     */
    removeNode(id: string, recordHistory?: boolean): void;
    /**
     * Updates an existing node's properties.
     */
    updateNode(id: string, patch: Partial<NodeConfig>, recordHistory?: boolean): void;
    /**
     * Sets the status of a node for live execution feedback.
     * @param id Node ID
     * @param status 'idle' | 'running' | 'success' | 'error' | 'warning'
     */
    setNodeStatus(id: string, status: "idle" | "running" | "success" | "error" | "warning"): void;
    /**
     * Centers the viewport on a specific node with optional zoom and transition settings.
     */
    focusNode(id: string, options?: {
        zoom?: number;
        duration?: number;
        offset?: {
            x: number;
            y: number;
        };
    }): void;
    /**
     * Temporarily highlights a node for visual emphasis using configurable effects.
     */
    highlight(id: string, options?: {
        color?: string;
        duration?: number;
        intensity?: number;
    }): void;
    /**
     * Retrieves a node's full state.
     */
    getNode(id: string): NodeData | null;
    /**
     * Returns all nodes currently on the canvas.
     */
    getAllNodes(): NodeData[];
    /**
     * Clones a node with a slight offset.
     */
    duplicateNode(id: string): string;
    /** Helper to trigger diagram layer re-renders */
    refreshNodes(): void;
    /**
     * Retrieves a node object by ID.
     */
    private getPlacedNode;
    /**
     * Copies currently selected nodes and internal edges to the engine clipboard.
     */
    copySelection(): void;
    /**
     * Pastes items from the engine clipboard onto the canvas with a small offset.
     * Maintains internal connections between pasted nodes.
     */
    pasteSelection(offset?: {
        x: number;
        y: number;
    }): void;
    /**
     * Programmatically creates a connection between two nodes.
     * @returns The ID of the created connection.
     */
    addEdge(config: EdgeConfig, recordHistory?: boolean): string;
    /**
     * Removes a connection by ID.
     */
    removeEdge(id: string, recordHistory?: boolean): void;
    /**
     * Returns a specific connection's state.
     */
    getEdge(id: string): EdgeData | null;
    /**
     * Returns all connections on the canvas.
     */
    getAllEdges(): EdgeData[];
    /**
     * Returns a unified snapshot of the current diagram state.
     * Useful for persistence, syncing, or debugging.
     */
    getDiagramState(): {
        nodes: NodeData[];
        edges: EdgeData[];
        viewport: {
            x: number;
            y: number;
            zoom: number;
        };
    };
    validate(): import("./validation.js").ValidationResult;
    toJSON(): string;
    /**
     * Sets the ID of the node currently being edited in-place.
     * This is used to suppress SVG rendering while the UI editor is active.
     */
    setEditingNode(id: string | null): void;
    /** Gets the current editing node ID. */
    getEditingNodeId(): string | null;
    /**
     * Clears the current canvas and loads state from a Zenode JSON string.
     */
    fromJSON(json: string): void;
    /**
     * Aligns selected nodes in a specific direction.
     */
    alignSelection(direction: "left" | "center" | "right" | "top" | "middle" | "bottom"): void;
    /**
     * Distributes selected nodes uniformly.
     */
    distributeSelection(direction: "horizontal" | "vertical"): void;
    /**
     * Reorders the internal placedNodes array based on a list of IDs.
     * Higher index = rendered on top.
     */
    setNodeOrder(newIds: string[], recordHistory?: boolean): void;
    /**
     * Moves specific nodes to the end of the drawing array so they appear on top.
     */
    bringToFront(ids: string[]): void;
    /**
     * Moves specific nodes to the beginning of the drawing array so they appear behind others.
     */
    sendToBack(ids: string[]): void;
    /**
     * Programmatically triggers the text editor for a node or edge.
     */
    beginLabelEdit(id: string, kind: 'node' | 'edge'): void;
    /** Robust unique ID generator */
    private generateId;
    /** Removes mousemove and click handlers used for placement; stops preview. */
    removePlacementListeners(): void;
    /**
     * Cancels any active placement operation.
     */
    cancelPlacement(): void;
    /** Returns selected node ids. */
    getSelectedNodeIds(): string[];
    /** Placement and Preview APIs */
    setPlacementContext(type: string, variantId?: string, ghostId?: string): void;
    startPlacement(type: string, variantId: string, initialPoint?: {
        x: number;
        y: number;
    }): string;
    updatePlacementPreview(x: number, y: number): void;
    completePlacement(event?: MouseEvent): string;
    private getCanvasPointFromEvent;
    /** Returns whether a connection is currently being drawn. */
    isDrawingConnection(): boolean;
    /** Sets whether connection drawing mode is enabled. */
    setLicense(key: string): void;
    setSmartRoutingEnabled(enabled: boolean): void;
    getLicenseTier(): string;
    isSmartRoutingEnabled(): boolean;
    setConnectionModeEnabled(enabled: boolean): void;
    isRotationModeEnabled(): boolean;
    setRotationModeEnabled(enabled: boolean): void;
    isResizeModeEnabled(): boolean;
    setResizeModeEnabled(enabled: boolean): void;
    /** Sets the active connection type for newly created connections. */
    setActiveConnectionType(type: string): void;
    /** Sets selected node ids and re-renders selection rings. */
    setSelectedNodeIds(ids: string[], primaryId?: string): void;
    groupSelection(recordHistory?: boolean): void;
    ungroupSelection(recordHistory?: boolean): void;
    /** Internal helpers for undo/redo */
    restoreVisualGroup(group: VisualGroup): void;
    removeVisualGroup(groupId: string): void;
    toggleGroupingSelection(): void;
    getVisualGroups(): VisualGroup[];
    getSelectedEdgeIds(): string[];
    setSelectedEdgeIds(ids: string[]): void;
    toggleConnectionStyle(id: string, property: 'dashed' | 'animated'): void;
    getConnections(): StoredConnection[];
    getGroupBounds(groupId: string, overrideNodes?: Map<string, PlacedNode>): BoundingBox | null;
    /** Clears all selections. */
    clearSelection(): void;
    /** Enable/disable lasso selection interaction. */
    setLassoEnabled(enabled: boolean): void;
    isLassoEnabled(): boolean;
    /**
     * Places a node on the canvas: appends to state and re-renders g.placed-nodes.
     * @param node - Node to place (id must be unique; use generatePlacedNodeId() if creating new).
     */
    placeNode(node: PlacedNode, recordHistory?: boolean): void;
    /** Returns a copy of the current placed nodes (immutable). */
    getPlacedNodes(): PlacedNode[];
    /**
     * Updates a placed node's position and triggers sub-renders.
     */
    updateNodePosition(id: string, x: number, y: number, recordHistory?: boolean): void;
    /**
     * Updates a node's rotation.
     */
    rotateNode(id: string, rotation: number, recordHistory?: boolean): void;
    /**
     * Updates a node's dimensions (width/height or radius).
     */
    updateNodeDimensions(id: string, dimensions: {
        width?: number;
        height?: number;
        radius?: number;
    }, recordHistory?: boolean): void;
    zoomIn(): void;
    zoomOut(): void;
    createDragBehavior(): any;
    zoomTo(scale: number): void;
    focusOnNode(id: string): void;
    focusOnSelectedNode(): void;
    panBy(dx: number, dy: number): void;
    deleteSelection(recordHistory?: boolean): void;
    reRenderConnections(): void;
    /**
     * Converts a mouse event to canvas coordinates (with optional grid snap).
     * Used for placement and hit-testing.
     */
    getCanvasPoint(event: MouseEvent): {
        x: number;
        y: number;
    };
    /**
    * Creates a shape on the canvas by starting the placement operation.
    * @param shapeType - Type of shape ('rectangle', 'circle', 'rhombus').
    * @param id - Shape variant id from config (e.g. 'task0').
    * @param data - Optional initial data
    */
    createShape(shapeType: string, id: string, data?: any): void;
    /**
     * Places a shape immediately at the given canvas coordinates.
     * Internal common logic for Drop and DblClick placement.
     */
    placeShapeAt(shapeType: string, variantId: string, x: number, y: number, data?: any): PlacedNode | undefined;
    /**
     * Places a shape at a safe, non-overlapping position within the current viewport.
     * Useful for double-click placement.
     */
    placeShapeAtSafePos(shapeType: string, variantId: string, data?: any): void;
    /**
     * Handles native drag-and-drop events to place shapes on the canvas.
     */
    handleDrop(event: DragEvent): void;
    /**
     * Creates a connection between two placed nodes by their node ids.
     * (Full connector UI is Phase 2; this records the connection in state.)
     * @param sourceNodeId - Placed node id (from getPlacedNodes()[i].id).
     * @param targetNodeId - Placed node id.
     */
    createConnection(sourceNodeId: string, targetNodeId: string): void;
    /**
     * Updates a node's visual state without mutating geometry/state in place.
     */
    updateNodeVisualState(id: string, patch: Partial<VisualState>): void;
    /**
     * Updates an edge/connection visual state immutably and re-renders connections.
     */
    updateEdgeVisualState(id: string, patch: Partial<VisualState>): void;
    /**
     * Updates the content (text, icon, layout) of a placed node.
     * Immutably merges the patch and re-renders.
     */
    updateNodeContent(id: string, content: import("../types/index.js").NodeContent, recordHistory?: boolean): void;
    /**
     * Starts a connection drag from a specific port.
     */
    startConnectionDrag(sourceNodeId: string, sourcePortId: string, startPoint: {
        x: number;
        y: number;
    }): void;
    /**
     * Updates the current drag point for the ghost connection.
     */
    updateConnectionDrag(currentPoint: {
        x: number;
        y: number;
    }): void;
    findClosestPort(point: {
        x: number;
        y: number;
    }, threshold?: number): {
        nodeId: string;
        portId: string;
        point: {
            x: number;
            y: number;
        };
    } | undefined;
    /**
     * Completes the connection drag and creates a new connection if dropped on a port.
     */
    endConnectionDrag(targetNodeId?: string, targetPortId?: string): void;
    private cleanupGhostConnection;
    createConnectionFromPorts(sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string, recordHistory?: boolean): void;
    private renderGhostConnection;
    getGroupPorts(groupId: string, overrideNodes?: Map<string, PlacedNode>): Record<string, {
        x: number;
        y: number;
    }> | null;
    lockedTheCanvas(locked: boolean): void;
    gridToggles(toggle: boolean): void;
    private bindSelectionInteractions;
    private getCanvasPointRaw;
    private intersectsLasso;
    private toCanvasBounds;
    private getShapeStyle;
    private matchesShortcut;
    private isTypingTarget;
}
export declare function initializeCanvas(container: HTMLElement | null, config: Partial<Config>): ZenodeEngine;
export declare function createShape(type: string, id: string, event: MouseEvent, data?: any): void;
export declare function gridToggle(toggle: boolean): void;
export declare function lockCanvas(isLocked: boolean): void;
export declare function alignmentLineToggle(toggle: boolean): void;
export declare function deleteShape(toggle: boolean, shapeid: number): void;
export declare function resetCanvas(config: Config): void;
export declare function activateLassoTool(activate: boolean): void;
export declare function setLassoEnabled(enabled: boolean): void;
export declare function createConnection(from: string, to: string): void;
