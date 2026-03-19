// src/core/engine.ts
import { drawCanvas, lockedCanvas } from "../components/canvas/canvas.js";
import { drawGrid, toggleGrid } from "../components/canvas/grid.js";
import { Config, Shape } from "../model/configurationModel.js";
import { EventManager } from "./eventManager.js";
import { ZoomManager } from "./zoom&PanManager.js";
import { CanvasElements, PlacedNode, ShapePreviewData } from "../model/interface.js";
import { svgMouseMove } from "../events/mouseMove.js";
import { svgMouseClick } from "../events/mouseClick.js";
import { generatePlacedNodeId } from "../utils/helpers.js";
import { renderPlacedNodes } from "../nodes/placement.js";
import { renderConnections, StoredConnection } from "../connections/render.js";

import { mergeConfig } from "../utils/configMerger.js";
import * as d3 from "d3";
import { snapToGrid } from "../utils/helpers.js";

export class ZenodeEngine {
  public container!: HTMLElement | null;
  private config: Config;
  public svg: any;
  private grid: any;
  private alignmentLine: any;
  private elements: any;
  private zoomBehaviour: any;
  private shapeMap: Map<
    string,
    { x: number; y: number; shapeType: string; extraData?: ShapePreviewData }
  > = new Map();
  private shapes: Map<string, unknown> = new Map();
  private connections: StoredConnection[] = [];
  /** Placed nodes on the canvas. Source of truth for g.placed-nodes layer. */
  private placedNodes: PlacedNode[] = [];
  /** When set, next click will place a node of this type/config (preview → placed). */
  private placementContext: { shapeType: string; shapeConfig: Shape } | null = null;
  private eventManager: EventManager;
  public zoomManager!: ZoomManager;
  public canvasObject: CanvasElements = {
    svg: null,
    grid: null,
    elements: null,
    canvasContainer: null,
    connections: null,
    placedNodes: null,
    guides: null,
  };
  private canvasContainerGroup: unknown;

  constructor(container: HTMLElement | null, config: Partial<Config>) {
    this.container = container;
    this.config = mergeConfig(config);
    this.eventManager = new EventManager();
    this.initializeCanvas();
  }

  initializeCanvas() {
    this.canvasObject = drawCanvas(
      this.container ? `#${this.container.id}` : "body",
      this.config.canvas
    );
    this.svg = this.canvasObject.svg;

    this.grid = drawGrid(this.svg, this.config.canvas, this.canvasObject.grid);
    this.alignmentLine = this.svg.append("g").attr("class", "alignment-line");
    this.canvasContainerGroup = this.canvasObject.canvasContainer;
    this.zoomManager = new ZoomManager(
      this.canvasContainerGroup,
      this.svg,
      this.config,
      (eventType: any, event: any) => {
        this.eventManager.trigger(eventType, event);
      }
    );

    console.log("SVG canvas and grid created.");
  }

  on(eventType: string, callback: (event: unknown) => void) {
    this.eventManager.on(eventType, callback);
  }

  /** Returns current placement context (shape type + config for next click). */
  getPlacementContext(): { shapeType: string; shapeConfig: Shape } | null {
    return this.placementContext;
  }

  /** Sets placement context so the next canvas click places a node of this type/config. */
  setPlacementContext(shapeType: string, shapeConfig: Shape): void {
    this.placementContext = { shapeType, shapeConfig };
  }

  /** Clears placement context (e.g. after placing or cancel). */
  clearPlacementContext(): void {
    this.placementContext = null;
  }

  /** Removes mousemove and click handlers used for placement; stops preview. */
  removePlacementListeners(): void {
    this.svg.on("mousemove", null);
    this.svg.on("click", null);
  }

  /**
   * Places a node on the canvas: appends to state and re-renders g.placed-nodes.
   * @param node - Node to place (id must be unique; use generatePlacedNodeId() if creating new).
   */
  placeNode(node: PlacedNode): void {
    this.placedNodes = [...this.placedNodes, node];
    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    this.eventManager.trigger("node:placed", { node });
  }

  /** Returns a copy of the current placed nodes (immutable). */
  getPlacedNodes(): PlacedNode[] {
    return [...this.placedNodes];
  }

  /**
   * Updates a placed node's position and triggers sub-renders.
   */
  updateNodePosition(id: string, x: number, y: number): void {
    this.placedNodes = this.placedNodes.map((n) => (n.id === id ? { ...n, x, y } : n));
    // Re-render nodes (this might be handled by the renderer d3 join,
    // but we need to ensure connections follow)
    if (this.canvasObject.connections) {
      this.reRenderConnections();
    }
    this.eventManager.trigger("node:moved", { id, x, y });
  }

  private reRenderConnections(): void {
    if (this.canvasObject.connections) {
      renderConnections(this.canvasObject.connections, this.connections, this.placedNodes);
    }
  }

  /**
   * Converts a mouse event to canvas coordinates (with optional grid snap).
   * Used for placement and hit-testing.
   */
  getCanvasPoint(event: MouseEvent): { x: number; y: number } {
    const gridSize = this.config.canvas.grid?.gridSize ?? 20;
    const zoomTransform = d3.zoomTransform(this.svg.node() as Element);
    const [cursorX, cursorY] = d3.pointer(event, this.svg.node());
    const adjustedX = (cursorX - zoomTransform.x) / zoomTransform.k;
    const adjustedY = (cursorY - zoomTransform.y) / zoomTransform.k;
    if (this.config.canvasProperties.snapToGrid) {
      return snapToGrid(adjustedX, adjustedY, gridSize);
    }
    return { x: adjustedX, y: adjustedY };
  }

  /**
   * Creates a shape on the canvas (preview on move, place on click).
   * @param shapeType - Type of shape ('rectangle', 'circle', 'rhombus').
   * @param id - Shape variant id from config (e.g. 'task0').
   * @param data - Optional inner content for preview
   */
  createShape(shapeType: string, id: string, data?: ShapePreviewData): void {
    const shapeList =
      this.config.shapes.default?.[shapeType as keyof typeof this.config.shapes.default] ?? [];
    if (!shapeList.length) {
      console.error(`No shapes found for type "${shapeType}".`);
      return;
    }
    const shapeToFind = shapeList.find((shape: Shape) => shape.id === id);
    if (!shapeToFind) {
      console.error(`Shape ID "${id}" not found in type "${shapeType}".`);
      return;
    }
    this.removePlacementListeners();
    this.setPlacementContext(shapeType, shapeToFind);
    this.svg.on("mousemove", (event: MouseEvent) =>
      svgMouseMove(event, shapeType, shapeToFind, this.grid, this.config, this.canvasObject, data)
    );
    this.svg.on("click", (event: MouseEvent) => svgMouseClick(event, this));
  }

  /**
   * Creates a connection between two placed nodes by their node ids.
   * (Full connector UI is Phase 2; this records the connection in state.)
   * @param sourceNodeId - Placed node id (from getPlacedNodes()[i].id).
   * @param targetNodeId - Placed node id.
   */
  createConnection(sourceNodeId: string, targetNodeId: string): void {
    const fromExists = this.placedNodes.some((n) => n.id === sourceNodeId);
    const toExists = this.placedNodes.some((n) => n.id === targetNodeId);
    if (!fromExists || !toExists) {
      console.warn(
        `One or both nodes do not exist. Use getPlacedNodes() to get valid node ids.`
      );
      return;
    }
    const connection: StoredConnection = {
      id: `conn-${sourceNodeId}-${targetNodeId}`,
      sourceNodeId,
      targetNodeId,
      type: "straight",
    };
    this.connections = [...this.connections, connection];
    if (this.canvasObject.connections) {
      renderConnections(
        this.canvasObject.connections,
        this.connections,
        this.placedNodes
      );
    }
    this.eventManager.trigger("connection:created", { connection });
  }

  lockedTheCanvas(locked: boolean) {
    lockedCanvas(locked, this.svg, this.zoomBehaviour);
  }

  gridToggles(toggle: boolean) {
    toggleGrid(toggle);
  }
}

let engineInstance: ZenodeEngine | null = null;

export function initializeCanvas(
  container: HTMLElement | null,
  config: Partial<Config> 
) {
  if (!engineInstance) {
    engineInstance = new ZenodeEngine(container, config);
    console.log("Canvas initialized");
  } else {
    console.log("Canvas already initialized");
  }
  return engineInstance;
}

export function createShape(
  type: string,
  id: string,
  event: MouseEvent,
  data?: ShapePreviewData
) {
  if (!engineInstance) {
    throw new Error("Engine is not initialized. Call initializeCanvas first.");
  }
  return engineInstance.createShape(type, id, data);
}

export function gridToggle(toggle: boolean) {
  if (!engineInstance) {
    throw new Error("Engine is not initialized. Call initializeCanvas first.");
  }
  return engineInstance.gridToggles(toggle);
}

export function lockCanvas(isLocked: boolean) {
  if (!engineInstance) {
    throw new Error("Engine is not initialized. Call initializeCanvas first.");
  }
  engineInstance.lockedTheCanvas(isLocked);
}

export function alignmentLineToggle(toggle: boolean) {}

export function deleteShape(toggle: boolean, shapeid: number) {}

export function resetCanvas(config: Config) {}

export function activateLassoTool(activate: boolean) {}

export function createConnection(from: string, to: string) {}
