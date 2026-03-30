// src/core/engine.ts
import { drawCanvas, lockedCanvas } from "../components/canvas/canvas.js";
import { drawGrid, toggleGrid, updateGridTransform } from "../components/canvas/grid.js";
import { Config, Shape } from "../model/configurationModel.js";
import { EventManager } from "./eventManager.js";
import { ZoomManager } from "./zoom&PanManager.js";
import { CanvasElements, PlacedNode, ShapePreviewData } from "../model/interface.js";
import { ContextPadAction, ContextPadTarget, ShapeRenderer, BoundingBox, VisualState } from "../types/index.js";
import { svgMouseMove } from "../events/mouseMove.js";
import { svgMouseClick } from "../events/mouseClick.js";
import { renderPlacedNodes } from "../nodes/placement.js";
import { renderConnections, StoredConnection } from "../connections/render.js";
import { ShapeRegistry } from "../nodes/registry.js";
import { RectangleRenderer } from "../nodes/shapes/rectangle.js";
import { CircleRenderer } from "../nodes/shapes/circle.js";
import { RhombusRenderer } from "../nodes/shapes/rhombus.js";
import { LicenseManager } from "./license.js";
import { SmartRouter } from "../connections/routing/smartRouter.js";
import { buildResolvedShapeConfig } from "../nodes/overlay.js";

import { mergeConfig } from "../utils/configMerger.js";
import * as d3 from "d3";
import { snapToGrid } from "../utils/helpers.js";
import { ContextPadRegistry } from "../contextpad/registry.js";
import { ContextPadRenderer } from "../contextpad/renderer.js";
import { defaultActions } from "../contextpad/defaults.js";

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
  /** Selected edge ids (single or multi-select). */
  private selectedEdgeIds: string[] = [];
  /** Controls whether lasso interaction is active on canvas background drag. */
  private lassoEnabled = true;
  /** Prevents background click handler from clearing selection right after lasso mouseup. */
  private suppressNextCanvasClick = false;
  /** When set, next click will place a node of this type/config (preview → placed). */
  private placementContext: { shapeType: string; shapeConfig: Shape } | null = null;
  /** When set, a connection is being dragged from this port. */
  private connectionDragContext: {
    sourceNodeId: string;
    sourcePortId: string;
    currentPoint: { x: number; y: number };
    snapped?: { nodeId: string; portId: string; point: { x: number; y: number } };
  } | null = null;
  public connectionModeEnabled: boolean = false;
  private licenseManager = new LicenseManager();
  private smartRouter = new SmartRouter();
  private smartRoutingEnabled = false;
  private activeConnectionType: string = "straight";
  private eventManager: EventManager;
  public zoomManager!: ZoomManager;
  public canvasObject: CanvasElements = {
    svg: null,
    grid: null,
    elements: null,
    canvasContainer: null,
    connections: null,
    /** Layer for ghost connection (highest layer, but below guides) */
    ghostConnection: null,
    /** Layer for placed nodes (above grid/connections, below preview) */
    placedNodes: null,
    guides: null,
    lasso: null,
  };
  private canvasContainerGroup: unknown;
  private contextPadRegistry: ContextPadRegistry;
  private contextPadRenderer!: ContextPadRenderer;

  constructor(container: HTMLElement | null, config: Partial<Config>) {
    this.container = container;
    this.config = mergeConfig(config);
    this.shapeRegistry = new ShapeRegistry();
    this.registerBuiltInShapes();
    this.eventManager = new EventManager();
    this.contextPadRegistry = new ContextPadRegistry();
    this.initializeCanvas();
    this.initializeContextPad();
  }

  private initializeContextPad(): void {
      if (this.container) {
          this.contextPadRenderer = new ContextPadRenderer(this.container);
          defaultActions.forEach(action => this.contextPadRegistry.register(action));

          // Auto-disable connection mode when pad closes
          this.on("contextpad:close", () => {
             this.setConnectionModeEnabled(false);
          });
      }
  }

  /**
   * Registers a custom action for the context pad.
   */
  public isConnectionModeEnabled(): boolean {
    return this.connectionModeEnabled;
  }

  // --- External API for Context Pad ---
  public registerContextPadAction(action: ContextPadAction): void {
    this.contextPadRegistry.register(action);
  }

  public unregisterContextAction(id: string): void {
    this.contextPadRegistry.unregister(id);
  }

  /**
   * Listens to engine events (including context pad events).
   */
  public on(eventType: string, callback: (event: any) => void): void {
    this.eventManager.on(eventType, callback);
  }

  /**
   * Manually shows the context pad for a specific target.
   */
  public showContextPad(target: ContextPadTarget): void {
    if (this.contextPadRenderer) {
        const actions = this.contextPadRegistry.getActionsFor(target, this);
        this.contextPadRenderer.render(target, actions, this);
    }
  }

  /**
   * Updates canvas dimensions without a full re-render.
   */
  public resizeCanvas(width: number, height: number): void {
    this.config.canvas.width = width;
    this.config.canvas.height = height;

    if (this.svg) {
        // Fluid infinite layout doesn't need fixed dimensions or viewBox
        // But we re-sync the grid transform to make sure pattern offset is still happy
        const transform = d3.zoomTransform(this.svg.node());
        updateGridTransform(this.svg, transform);
    }
  }

  public updateConfig(newConfig: Partial<Config>): void {
    const oldNodes = [...this.placedNodes];
    const oldConns = [...this.connections];
    const oldSelectedNodes = [...this.selectedNodeIds];
    const oldSelectedEdges = [...this.selectedEdgeIds];

    // Preserve viewport state (zoom and pan)
    let currentTransform = d3.zoomIdentity;
    if (this.svg) {
      currentTransform = d3.zoomTransform(this.svg.node());
    }

    this.config = mergeConfig(newConfig);

    // Complete re-render of the playground/canvas
    if (this.container) {
      this.container.innerHTML = "";
      this.initializeCanvas();
      this.initializeContextPad();

      // Restore and re-render state into new SVG
      this.placedNodes = oldNodes;
      this.connections = oldConns;
      this.selectedNodeIds = oldSelectedNodes;
      this.selectedEdgeIds = oldSelectedEdges;

      if (this.canvasObject.placedNodes) {
        renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
      }
      this.reRenderConnections();

      // Restore viewport state
      if (this.zoomManager && currentTransform) {
        this.svg.call(this.zoomManager.getZoomBehaviour().transform, currentTransform);
      }
    }
  }

  /**
   * Manually hides the context pad.
   */
  public hideContextPad(): void {
    if (this.contextPadRenderer) {
        this.contextPadRenderer.hide(this);
    }
  }

  public emit(eventType: string, event: any): void {
    this.eventManager.trigger(eventType, event);
  }

  private initDrag(): void {
    // Modify existing drag handler to update pad
    // Assuming d3.drag is set up in a way we can hook into
    // I need to see where initDrag or similar is.
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

    this.activeConnectionType = this.config.connections.defaultType || "straight";

    this.grid = drawGrid(this.svg, this.config.canvas, this.canvasObject.grid);
    this.alignmentLine = this.svg.append("g").attr("class", "alignment-line");
    this.canvasContainerGroup = this.canvasObject.canvasContainer;
    this.zoomManager = new ZoomManager(
      this.canvasContainerGroup,
      this.svg,
      this.config,
      (eventType: string, event: any) => {
        if (eventType === "zoom") {
          this.contextPadRenderer?.updatePosition(this);
        }
        this.eventManager.trigger(eventType, event);
      }
    );

    this.bindSelectionInteractions();
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

  /** Returns whether a connection is currently being drawn. */
  isDrawingConnection(): boolean {
    return this.connectionDragContext !== null;
  }

  /** Sets whether connection drawing mode is enabled. */
  setLicense(key: string): void {
    this.licenseManager.setLicense(key);
    this.reRenderConnections();
  }

  setSmartRoutingEnabled(enabled: boolean): void {
    this.smartRoutingEnabled = enabled;
    this.reRenderConnections();
  }

  getLicenseTier(): string {
    return this.licenseManager.getTier();
  }

  isSmartRoutingEnabled(): boolean {
    return this.smartRoutingEnabled && this.licenseManager.isPro();
  }

  setConnectionModeEnabled(enabled: boolean): void {
    this.connectionModeEnabled = enabled;
    // Re-render nodes to update port availability/UI
    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    this.eventManager.trigger("connection:mode:changed", { enabled });
  }

  /** Sets the active connection type for newly created connections. */
  setActiveConnectionType(type: string): void {
    this.activeConnectionType = type;
  }

  /** Sets selected node ids and re-renders selection rings. */
  setSelectedNodeIds(ids: string[]): void {
    this.selectedNodeIds = [...new Set(ids)];
    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }

    // Show context pad if exactly one node is selected
    if (this.selectedNodeIds.length === 1) {
      const node = this.placedNodes.find((n) => n.id === this.selectedNodeIds[0]);
      if (node) {
        const actions = this.contextPadRegistry.getActionsFor(
          { kind: "node", id: node.id, data: node },
          this
        );
        this.contextPadRenderer.render({ kind: "node", id: node.id, data: node }, actions, this);
      }
    } else if (this.selectedEdgeIds.length !== 1) {
      this.contextPadRenderer?.hide(this);
    }

    this.eventManager.trigger("node:selected", { ids: this.getSelectedNodeIds() });
  }

  /** Returns selected edge ids. */
  getSelectedEdgeIds(): string[] {
    return [...this.selectedEdgeIds];
  }

  /** Sets selected edge ids and re-renders selection state. */
  setSelectedEdgeIds(ids: string[]): void {
    this.selectedEdgeIds = [...new Set(ids)];
    this.reRenderConnections();

    if (this.selectedEdgeIds.length === 1) {
      const edge = this.connections.find((e) => e.id === this.selectedEdgeIds[0]);
      if (edge) {
        const actions = this.contextPadRegistry.getActionsFor(
          { kind: "edge", id: edge.id, data: edge },
          this
        );
        this.contextPadRenderer.render({ kind: "edge", id: edge.id, data: edge }, actions, this);
      }
    } else if (this.selectedNodeIds.length !== 1) {
      this.contextPadRenderer?.hide(this);
    }

    this.eventManager.trigger("edge:selected", { ids: this.getSelectedEdgeIds() });
  }

  /** Clears all selections. */
  clearSelection(): void {
    let changed = false;
    if (this.selectedNodeIds.length) {
      this.setSelectedNodeIds([]);
      changed = true;
    }
    if (this.selectedEdgeIds.length) {
      this.setSelectedEdgeIds([]);
      changed = true;
    }
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

  /** Returns a single placed node by id. */
  getPlacedNode(id: string): PlacedNode | undefined {
    return this.placedNodes.find((n) => n.id === id);
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
    
    // Update context pad position if one of the selected nodes is moved
    if (this.selectedNodeIds.includes(id)) {
        this.contextPadRenderer?.updatePosition(this);
    }

    this.eventManager.trigger("node:moved", { id, x, y });
  }

  public zoomIn(): void {
    this.zoomManager.zoomBy(this.svg, 1.2);
  }

  public zoomOut(): void {
    this.zoomManager.zoomBy(this.svg, 0.8);
  }

  public focusOnNode(id: string): void {
    const node = this.placedNodes.find(n => n.id === id);
    if (node) {
      const style = this.getShapeStyle(node);
      const width = style?.width ?? 100;
      const height = style?.height ?? 100;
      const centerX = node.x + width / 2;
      const centerY = node.y + height / 2;
      this.zoomManager.centerOn(this.svg, { x: centerX, y: centerY });
    }
  }

  public focusOnSelectedNode(): void {
    if (this.selectedNodeIds.length > 0) {
      this.focusOnNode(this.selectedNodeIds[0]);
    } else if (this.placedNodes.length > 0) {
      // Focus on the center of all nodes AND zoom to fit if needed
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      this.placedNodes.forEach(n => {
        const style = this.getShapeStyle(n);
        const w = style?.width ?? 100;
        const h = style?.height ?? 100;
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + w);
        maxY = Math.max(maxY, n.y + h);
      });

      const diagramWidth = maxX - minX;
      const diagramHeight = maxY - minY;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      // Calculate the scale to fit everything with some padding
      const padding = 40;
      const svgWidth = parseFloat(this.svg.attr("width") || "800");
      const svgHeight = parseFloat(this.svg.attr("height") || "500");
      
      const scaleX = (svgWidth - padding * 2) / diagramWidth;
      const scaleY = (svgHeight - padding * 2) / diagramHeight;
      let fitScale = Math.min(scaleX, scaleY);
      
      // Don't zoom in too much, keep it at most 1.0 if it's small
      fitScale = Math.min(fitScale, 1.0);
      // But don't go below the minimum zoom extent
      const minExtent = (this.zoomManager as any).config.canvasProperties.zoomExtent[0];
      fitScale = Math.max(fitScale, minExtent);

      this.zoomManager.centerOn(this.svg, { x: centerX, y: centerY }, fitScale);
    }
  }

  public panBy(dx: number, dy: number): void {
    if (this.zoomManager) {
      this.zoomManager.panBy(this.svg, dx, dy);
    }
  }

  deleteSelection(): void {
    let changed = false;
    if (this.selectedNodeIds.length) {
      const selected = new Set(this.selectedNodeIds);
      this.placedNodes = this.placedNodes.filter((n) => !selected.has(n.id));
      this.connections = this.connections.filter(
        (c) => !selected.has(c.sourceNodeId) && !selected.has(c.targetNodeId)
      );
      this.selectedNodeIds = [];
      changed = true;
      this.eventManager.trigger("node:deleted", { ids: [...selected] });
    }
    if (this.selectedEdgeIds.length) {
      const selectedE = new Set(this.selectedEdgeIds);
      this.connections = this.connections.filter((c) => !selectedE.has(c.id));
      this.selectedEdgeIds = [];
      changed = true;
      this.eventManager.trigger("edge:deleted", { ids: [...selectedE] });
    }
    
    if (changed) {
      if (this.contextPadRenderer) {
          this.contextPadRenderer.hide(this);
      }
      if (this.canvasObject.placedNodes) {
        renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
      }
      this.reRenderConnections();
    }
  }

  public reRenderConnections(): void {
    if (this.canvasObject.connections) {
      renderConnections(this.canvasObject.connections, this.connections, this.placedNodes, this);
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
      sourcePortId: "center", // Default for programmatic connections
      targetNodeId,
      targetPortId: "center", // Default
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

  /**
   * Starts a connection drag from a specific port.
   */
  startConnectionDrag(sourceNodeId: string, sourcePortId: string, startPoint: { x: number; y: number }): void {
    if (!this.connectionModeEnabled) return;

    this.connectionDragContext = {
      sourceNodeId,
      sourcePortId,
      currentPoint: startPoint,
    };
    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    this.eventManager.trigger("connection:dragstart", { sourceNodeId, sourcePortId, startPoint });
  }

  /**
   * Updates the current drag point for the ghost connection.
   */
  updateConnectionDrag(currentPoint: { x: number; y: number }): void {
    if (!this.connectionDragContext) return;
    this.connectionDragContext.currentPoint = currentPoint;

    // Snap to nearest port
    this.connectionDragContext.snapped = this.findClosestPort(currentPoint);

    this.renderGhostConnection();
  }

  public findClosestPort(point: { x: number; y: number }, threshold: number = 30): { nodeId: string; portId: string; point: { x: number; y: number } } | undefined {
    let bestDist = threshold;
    let result: { nodeId: string; portId: string; point: { x: number; y: number } } | undefined;

    for (const node of this.placedNodes) {
      // Don't snap to source node
      if (node.id === this.connectionDragContext?.sourceNodeId) continue;

      const style = this.getShapeStyle(node);
      if (!style) continue;
      const renderer = this.shapeRegistry.get(node.type);
      const resolved = buildResolvedShapeConfig(node, style);
      const ports = renderer.getPorts(resolved);

      for (const [portId, pos] of Object.entries(ports)) {
        const absX = node.x + (pos as any).x;
        const absY = node.y + (pos as any).y;
        const dist = Math.hypot(point.x - absX, point.y - absY);
        if (dist < bestDist) {
          bestDist = dist;
          result = { nodeId: node.id, portId, point: { x: absX, y: absY } };
        }
      }
    }
    return result;
  }

  /**
   * Completes the connection drag and creates a new connection if dropped on a port.
   */
  endConnectionDrag(targetNodeId?: string, targetPortId?: string): void {
    if (!this.connectionDragContext) return;

    const finalTargetNodeId = targetNodeId || this.connectionDragContext.snapped?.nodeId;
    const finalTargetPortId = targetPortId || this.connectionDragContext.snapped?.portId;

    if (finalTargetNodeId && finalTargetPortId) {
      this.createConnectionFromPorts(
        this.connectionDragContext.sourceNodeId,
        this.connectionDragContext.sourcePortId,
        finalTargetNodeId,
        finalTargetPortId
      );
    }

    this.connectionDragContext = null;
    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    if (this.canvasObject.ghostConnection) {
      this.canvasObject.ghostConnection.selectAll("*").remove();
    }
    this.eventManager.trigger("connection:dragend", {});
  }

  public createConnectionFromPorts(
    sourceNodeId: string,
    sourcePortId: string,
    targetNodeId: string,
    targetPortId: string
  ): void {
    const allowMultiple = this.config.canvasProperties.allowMultipleConnections;

    if (!allowMultiple) {
      // Check if any connection already exists between these two specific nodes
      const exists = this.connections.some(c =>
        (c.sourceNodeId === sourceNodeId && c.targetNodeId === targetNodeId)
      );
      if (exists) return;
    }

    const connection: StoredConnection = {
      // Use timestamp to ensure DOM uniqueness even for same ports
      id: `conn-${sourceNodeId}-${targetNodeId}-${Date.now()}`,
      sourceNodeId,
      sourcePortId,
      targetNodeId,
      targetPortId,
      type: this.activeConnectionType as any,
      visualState: { status: "idle" },
    };

    this.connections = [...this.connections, connection];
    this.reRenderConnections();
    this.eventManager.trigger("connection:created", { connection });
  }

  private renderGhostConnection(): void {
    if (!this.connectionDragContext || !this.canvasObject.ghostConnection) return;

    const sourceNode = this.placedNodes.find(n => n.id === this.connectionDragContext!.sourceNodeId);
    if (!sourceNode) return;

    const style = this.getShapeStyle(sourceNode);
    if (!style) return;

    const renderer = this.shapeRegistry.get(sourceNode.type);
    const resolved = buildResolvedShapeConfig(sourceNode, style);
    const ports = renderer.getPorts(resolved);
    const portPos = ports[this.connectionDragContext!.sourcePortId];
    if (!portPos) return;

    const from = { x: sourceNode.x + portPos.x, y: sourceNode.y + portPos.y };
    const to = this.connectionDragContext.snapped
      ? this.connectionDragContext.snapped.point
      : this.connectionDragContext.currentPoint;

    import("../connections/render.js").then(({ renderGhostConnection }) => {
      renderGhostConnection(
        this.canvasObject.ghostConnection!,
        from,
        to,
        this.config.canvasProperties.ghostConnection,
        this.activeConnectionType,
        this.connectionDragContext?.sourcePortId,
        this.connectionDragContext?.snapped?.portId
      );
    });
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
          this.deleteSelection();
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
