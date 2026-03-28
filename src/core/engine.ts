// src/core/engine.ts
import { drawCanvas, lockedCanvas } from "../components/canvas/canvas.js";
import { drawGrid, toggleGrid } from "../components/canvas/grid.js";
import { Config, Shape } from "../model/configurationModel.js";
import { EventManager } from "./eventManager.js";
import { ZoomManager } from "./zoom&PanManager.js";
import { CanvasElements, PlacedNode, ShapePreviewData } from "../model/interface.js";
import { svgMouseMove } from "../events/mouseMove.js";
import { svgMouseClick } from "../events/mouseClick.js";
import { renderPlacedNodes } from "../nodes/placement.js";
import { renderConnections, StoredConnection } from "../connections/render.js";
import { ShapeRegistry } from "../nodes/registry.js";
import { RectangleRenderer } from "../nodes/shapes/rectangle.js";
import { CircleRenderer } from "../nodes/shapes/circle.js";
import { RhombusRenderer } from "../nodes/shapes/rhombus.js";
import { ShapeRenderer, BoundingBox, VisualState } from "../types/index.js";
import { buildResolvedShapeConfig } from "../nodes/overlay.js";

import { mergeConfig } from "../utils/configMerger.js";
import * as d3 from "d3";
import { snapToGrid } from "../utils/helpers.js";

export class ZenodeEngine {
  public container!: HTMLElement | null;
  private config: Config;
  public shapeRegistry: ShapeRegistry;
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
  /** Selected node ids (single or multi-select). */
  private selectedNodeIds: string[] = [];
  /** Controls whether lasso interaction is active on canvas background drag. */
  private lassoEnabled = true;
  /** Prevents background click handler from clearing selection right after lasso mouseup. */
  private suppressNextCanvasClick = false;
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
    lasso: null,
  };
  private canvasContainerGroup: unknown;

  constructor(container: HTMLElement | null, config: Partial<Config>) {
    this.container = container;
    this.config = mergeConfig(config);
    this.shapeRegistry = new ShapeRegistry();
    this.registerBuiltInShapes();
    this.eventManager = new EventManager();
    this.initializeCanvas();
  }

  private registerBuiltInShapes(): void {
    this.shapeRegistry.register("rectangle", RectangleRenderer);
    this.shapeRegistry.register("circle", CircleRenderer);
    this.shapeRegistry.register("rhombus", RhombusRenderer);
  }

  /** Public API for custom shape extension. */
  registerShape(name: string, renderer: ShapeRenderer): void {
    this.shapeRegistry.register(name, renderer);
  }

  initializeCanvas() {
    this.canvasObject = drawCanvas(
      this.container ? `#${this.container.id}` : "body",
      this.config.canvas
    );
    this.svg = this.canvasObject.svg;
    this.svg.attr("data-lasso-enabled", "false");

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

    this.bindSelectionInteractions();
  }

  on(eventType: string, callback: (event: unknown) => void) {
    this.eventManager.on(eventType, callback);
  }

  /** SVG root DOM node — passed to DragApi for correct pointer coordinate transform */
  get svgNode(): SVGSVGElement {
    return this.svg.node() as SVGSVGElement;
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

  /** Returns selected node ids. */
  getSelectedNodeIds(): string[] {
    return [...this.selectedNodeIds];
  }

  /** Sets selected node ids and re-renders selection rings. */
  setSelectedNodeIds(ids: string[]): void {
    this.selectedNodeIds = [...new Set(ids)];
    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    this.eventManager.trigger("node:selected", { ids: this.getSelectedNodeIds() });
  }

  /** Clears all node selections. */
  clearSelection(): void {
    if (!this.selectedNodeIds.length) return;
    this.setSelectedNodeIds([]);
  }

  /** Enable/disable lasso selection interaction. */
  setLassoEnabled(enabled: boolean): void {
    this.lassoEnabled = enabled;
    const style = this.config.canvasProperties.lassoStyle;
    const cursor = enabled && style.enabled ? style.cursor : "default";
    this.svg.attr("data-lasso-enabled", enabled && style.enabled ? "true" : "false");
    this.svg.style("cursor", cursor);
    if (!enabled) {
      this.canvasObject.lasso?.selectAll("*").remove();
    }
  }

  isLassoEnabled(): boolean {
    return this.lassoEnabled;
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

  /** Deletes all currently selected nodes. */
  deleteSelectedNodes(): void {
    if (!this.selectedNodeIds.length) return;
    const selected = new Set(this.selectedNodeIds);
    this.placedNodes = this.placedNodes.filter((n) => !selected.has(n.id));
    this.connections = this.connections.filter(
      (c) => !selected.has(c.sourceNodeId) && !selected.has(c.targetNodeId)
    );
    this.selectedNodeIds = [];
    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    this.reRenderConnections();
    this.eventManager.trigger("node:deleted", { ids: [...selected] });
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
      visualState: { status: "idle" },
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

  /**
   * Updates a node's visual state without mutating geometry/state in place.
   */
  updateNodeVisualState(id: string, patch: Partial<VisualState>): void {
    this.placedNodes = this.placedNodes.map((n) => {
      if (n.id !== id) return n;
      const mergedEffects = {
        ...(n.visualState?.effects ?? {}),
        ...(patch.effects ?? {}),
      };
      return {
        ...n,
        visualState: {
          ...(n.visualState ?? {}),
          ...patch,
          effects: mergedEffects,
        },
      };
    });

    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    this.eventManager.trigger("node:visualstate", { id, patch });
  }

  /**
   * Updates an edge/connection visual state immutably and re-renders connections.
   */
  updateEdgeVisualState(id: string, patch: Partial<VisualState>): void {
    this.connections = this.connections.map((c) => {
      if (c.id !== id) return c;
      const mergedEffects = {
        ...(c.visualState?.effects ?? {}),
        ...(patch.effects ?? {}),
      };
      return {
        ...c,
        visualState: {
          ...(c.visualState ?? {}),
          ...patch,
          effects: mergedEffects,
        },
      };
    });

    this.reRenderConnections();
    this.eventManager.trigger("edge:visualstate", { id, patch });
  }

  lockedTheCanvas(locked: boolean) {
    lockedCanvas(locked, this.svg, this.zoomBehaviour);
  }

  gridToggles(toggle: boolean) {
    toggleGrid(toggle);
  }

  private bindSelectionInteractions(): void {
    // Canvas click deselect (kept namespaced so placement click can coexist).
    this.svg.on("click.selection", (event: MouseEvent) => {
      if (this.suppressNextCanvasClick) {
        this.suppressNextCanvasClick = false;
        return;
      }
      if (this.placementContext) return;
      const target = event.target as Element | null;
      if (target?.closest("g.placed-node")) return;
      this.clearSelection();
    });

    // Keyboard selection actions.
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      if (this.isTypingTarget(event.target)) return;

      const shortcuts = this.config.canvasProperties.keyboardShortcuts;
      if (!shortcuts?.enabled) return;

      const selectedNodeIds = this.getSelectedNodeIds();
      const keyDownHandled = shortcuts.callbacks?.onKeyDown?.({
        event,
        action: "key:down",
        selectedNodeIds,
        engine: this,
      });
      if (keyDownHandled === false) return;

      if (shortcuts.deleteSelection.some((s) => this.matchesShortcut(event, s))) {
        const handled = shortcuts.callbacks?.onDeleteSelection?.({
          event,
          action: "selection:delete",
          selectedNodeIds,
          engine: this,
        });
        if (handled !== false) {
          event.preventDefault();
          this.deleteSelectedNodes();
        }
        return;
      }

      if (shortcuts.clearSelection.some((s) => this.matchesShortcut(event, s))) {
        const handled = shortcuts.callbacks?.onClearSelection?.({
          event,
          action: "selection:clear",
          selectedNodeIds,
          engine: this,
        });
        if (handled !== false) {
          event.preventDefault();
          this.clearSelection();
        }
        return;
      }

      const customBindings = shortcuts.customBindings ?? {};
      const customAction = Object.keys(customBindings).find((action) =>
        (customBindings[action] ?? []).some((s) => this.matchesShortcut(event, s))
      );
      if (!customAction) return;

      const customHandler = shortcuts.callbacks?.custom?.[customAction];
      if (!customHandler) return;
      const customHandled = customHandler({
        event,
        action: customAction,
        selectedNodeIds,
        engine: this,
      });
      if (customHandled !== false) {
        event.preventDefault();
      }
    });

    // Lasso multi-select.
    this.svg.on("mousedown.lasso", (event: MouseEvent) => {
      if (!this.lassoEnabled) return;
      if (!this.config.canvasProperties.lassoStyle.enabled) return;
      if (this.placementContext) return;
      if (event.button !== 0) return;
      const target = event.target as Element | null;
      if (target?.closest("g.placed-node")) return;

      const start = this.getCanvasPointRaw(event);
      const lassoLayer = this.canvasObject.lasso;
      if (!lassoLayer) return;
      lassoLayer.selectAll("*").remove();
      const lassoStyle = this.config.canvasProperties.lassoStyle;
      this.svg.style("cursor", lassoStyle.activeCursor);

      const rect = lassoLayer.append("rect")
        .attr("class", "lasso-box")
        .attr("x", start.x)
        .attr("y", start.y)
        .attr("width", 0)
        .attr("height", 0)
        .attr("fill", lassoStyle.fillColor)
        .attr("fill-opacity", lassoStyle.fillOpacity)
        .attr("stroke", lassoStyle.strokeColor)
        .attr("stroke-width", lassoStyle.strokeWidth)
        .attr("stroke-dasharray", lassoStyle.dashed ? lassoStyle.dashArray.join(" ") : null);

      this.svg.on("mousemove.lasso", (moveEvent: MouseEvent) => {
        const p = this.getCanvasPointRaw(moveEvent);
        const x = Math.min(start.x, p.x);
        const y = Math.min(start.y, p.y);
        const width = Math.abs(p.x - start.x);
        const height = Math.abs(p.y - start.y);
        rect.attr("x", x).attr("y", y).attr("width", width).attr("height", height);
      });

      this.svg.on("mouseup.lasso", (upEvent: MouseEvent) => {
        const end = this.getCanvasPointRaw(upEvent);
        const lasso = {
          x: Math.min(start.x, end.x),
          y: Math.min(start.y, end.y),
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y),
        };

        if (lasso.width < 3 && lasso.height < 3) {
          this.clearSelection();
        } else {
          const selected = this.placedNodes
            .filter((node) => this.intersectsLasso(node, lasso))
            .map((node) => node.id);
          this.setSelectedNodeIds(selected);
        }

        // Mouseup after lasso is usually followed by a click on canvas.
        // Ignore that one so selection isn't immediately cleared.
        this.suppressNextCanvasClick = true;

        lassoLayer.selectAll("*").remove();
        this.svg.style("cursor", lassoStyle.cursor);
        this.svg.on("mousemove.lasso", null);
        this.svg.on("mouseup.lasso", null);
      });
    });
  }

  private getCanvasPointRaw(event: MouseEvent): { x: number; y: number } {
    const zoomTransform = d3.zoomTransform(this.svg.node() as Element);
    const [cursorX, cursorY] = d3.pointer(event, this.svg.node());
    return {
      x: (cursorX - zoomTransform.x) / zoomTransform.k,
      y: (cursorY - zoomTransform.y) / zoomTransform.k,
    };
  }

  private intersectsLasso(
    node: PlacedNode,
    lasso: { x: number; y: number; width: number; height: number }
  ): boolean {
    const style = this.getShapeStyle(node);
    if (!style) return false;
    const renderer = this.shapeRegistry.get(node.type);
    const resolved = buildResolvedShapeConfig(node, style);
    const localBounds = renderer.getBounds(resolved);
    const bounds = this.toCanvasBounds(node, localBounds);

    return !(
      bounds.x + bounds.width < lasso.x ||
      lasso.x + lasso.width < bounds.x ||
      bounds.y + bounds.height < lasso.y ||
      lasso.y + lasso.height < bounds.y
    );
  }

  private toCanvasBounds(node: PlacedNode, local: BoundingBox): BoundingBox {
    return {
      x: node.x + local.x,
      y: node.y + local.y,
      width: local.width,
      height: local.height,
    };
  }

  private getShapeStyle(node: PlacedNode): Shape | undefined {
    const list = this.config.shapes.default?.[node.type as keyof typeof this.config.shapes.default];
    if (!Array.isArray(list)) return undefined;
    return list.find((s: Shape) => s.id === node.shapeVariantId);
  }

  private matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
    const tokens = shortcut.toLowerCase().split("+").map((t) => t.trim()).filter(Boolean);
    if (!tokens.length) return false;

    const wantsCtrl = tokens.includes("ctrl") || tokens.includes("control");
    const wantsMeta = tokens.includes("meta") || tokens.includes("cmd") || tokens.includes("command");
    const wantsAlt = tokens.includes("alt") || tokens.includes("option");
    const wantsShift = tokens.includes("shift");

    if (event.ctrlKey !== wantsCtrl) return false;
    if (event.metaKey !== wantsMeta) return false;
    if (event.altKey !== wantsAlt) return false;
    if (event.shiftKey !== wantsShift) return false;

    const keyToken = tokens.find(
      (t) => !["ctrl", "control", "meta", "cmd", "command", "alt", "option", "shift"].includes(t)
    );
    if (!keyToken) return false;

    return event.key.toLowerCase() === keyToken;
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    const tag = target.tagName.toLowerCase();
    return tag === "input" || tag === "textarea" || target.hasAttribute("contenteditable");
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

export function alignmentLineToggle(toggle: boolean) { }

export function deleteShape(toggle: boolean, shapeid: number) { }

export function resetCanvas(config: Config) { }

export function activateLassoTool(activate: boolean) { }

export function setLassoEnabled(enabled: boolean) {
  if (!engineInstance) {
    throw new Error("Engine is not initialized. Call initializeCanvas first.");
  }
  engineInstance.setLassoEnabled(enabled);
}

export function createConnection(from: string, to: string) { }
