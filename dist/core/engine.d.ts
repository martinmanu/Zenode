import { Config, Shape } from "../model/configurationModel.js";
import { ZoomManager } from "./zoom&PanManager.js";
import { CanvasElements, PlacedNode, ShapePreviewData } from "../model/interface.js";
import { ShapeRegistry } from "../nodes/registry.js";
import { ShapeRenderer } from "../types/index.js";
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
    /** Controls whether lasso interaction is active on canvas background drag. */
    private lassoEnabled;
    /** Prevents background click handler from clearing selection right after lasso mouseup. */
    private suppressNextCanvasClick;
    /** When set, next click will place a node of this type/config (preview → placed). */
    private placementContext;
    private eventManager;
    zoomManager: ZoomManager;
    canvasObject: CanvasElements;
    private canvasContainerGroup;
    constructor(container: HTMLElement | null, config: Partial<Config>);
    private registerBuiltInShapes;
    /** Public API for custom shape extension. */
    registerShape(name: string, renderer: ShapeRenderer): void;
    initializeCanvas(): void;
    on(eventType: string, callback: (event: unknown) => void): void;
    /** SVG root DOM node — passed to DragApi for correct pointer coordinate transform */
    get svgNode(): SVGSVGElement;
    /** Returns current placement context (shape type + config for next click). */
    getPlacementContext(): {
        shapeType: string;
        shapeConfig: Shape;
    } | null;
    /** Sets placement context so the next canvas click places a node of this type/config. */
    setPlacementContext(shapeType: string, shapeConfig: Shape): void;
    /** Clears placement context (e.g. after placing or cancel). */
    clearPlacementContext(): void;
    /** Removes mousemove and click handlers used for placement; stops preview. */
    removePlacementListeners(): void;
    /** Returns selected node ids. */
    getSelectedNodeIds(): string[];
    /** Sets selected node ids and re-renders selection rings. */
    setSelectedNodeIds(ids: string[]): void;
    /** Clears all node selections. */
    clearSelection(): void;
    /** Enable/disable lasso selection interaction. */
    setLassoEnabled(enabled: boolean): void;
    isLassoEnabled(): boolean;
    /**
     * Places a node on the canvas: appends to state and re-renders g.placed-nodes.
     * @param node - Node to place (id must be unique; use generatePlacedNodeId() if creating new).
     */
    placeNode(node: PlacedNode): void;
    /** Returns a copy of the current placed nodes (immutable). */
    getPlacedNodes(): PlacedNode[];
    /**
     * Updates a placed node's position and triggers sub-renders.
     */
    updateNodePosition(id: string, x: number, y: number): void;
    /** Deletes all currently selected nodes. */
    deleteSelectedNodes(): void;
    private reRenderConnections;
    /**
     * Converts a mouse event to canvas coordinates (with optional grid snap).
     * Used for placement and hit-testing.
     */
    getCanvasPoint(event: MouseEvent): {
        x: number;
        y: number;
    };
    /**
     * Creates a shape on the canvas (preview on move, place on click).
     * @param shapeType - Type of shape ('rectangle', 'circle', 'rhombus').
     * @param id - Shape variant id from config (e.g. 'task0').
     * @param data - Optional inner content for preview
     */
    createShape(shapeType: string, id: string, data?: ShapePreviewData): void;
    /**
     * Creates a connection between two placed nodes by their node ids.
     * (Full connector UI is Phase 2; this records the connection in state.)
     * @param sourceNodeId - Placed node id (from getPlacedNodes()[i].id).
     * @param targetNodeId - Placed node id.
     */
    createConnection(sourceNodeId: string, targetNodeId: string): void;
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
export declare function createShape(type: string, id: string, event: MouseEvent, data?: ShapePreviewData): void;
export declare function gridToggle(toggle: boolean): void;
export declare function lockCanvas(isLocked: boolean): void;
export declare function alignmentLineToggle(toggle: boolean): void;
export declare function deleteShape(toggle: boolean, shapeid: number): void;
export declare function resetCanvas(config: Config): void;
export declare function activateLassoTool(activate: boolean): void;
export declare function setLassoEnabled(enabled: boolean): void;
export declare function createConnection(from: string, to: string): void;
