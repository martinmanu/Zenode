// src/core/engine.ts
import { drawCanvas, lockedCanvas } from "../components/canvas/canvas.js";
import { drawGrid, toggleGrid, updateGridTransform } from "../components/canvas/grid.js";
import { Config, Shape } from "../model/configurationModel.js";
import { EventManager } from "./eventManager.js";
import { ZoomManager } from "./zoom&PanManager.js";
import { CanvasElements, PlacedNode, ShapePreviewData, VisualGroup } from "../model/interface.js";
import { ContextPadAction, ContextPadTarget, ShapeRenderer, BoundingBox, VisualState, NodeConfig, NodeData, EdgeConfig, EdgeData } from "../types/index.js";
import { svgMouseMove } from "../events/mouseMove.js";
import { svgMouseClick } from "../events/mouseClick.js";
import { renderPlacedNodes } from "../nodes/placement.js";
import { createDragBehavior as initDragBehavior } from "../events/drag.js";
import { renderConnections, renderGhostConnection as renderGhostLine, StoredConnection } from "../connections/render.js";
import { ShapeRegistry } from "../nodes/registry.js";
import { RectangleRenderer } from "../nodes/shapes/rectangle.js";
import { CircleRenderer } from "../nodes/shapes/circle.js";
import { RhombusRenderer } from "../nodes/shapes/rhombus.js";
import { SemicircleRenderer } from "../nodes/shapes/semicircle.js";
import { PentagonRenderer } from "../nodes/shapes/pentagon.js";
import { OctagonRenderer } from "../nodes/shapes/octagon.js";
import { StarRenderer } from "../nodes/shapes/star.js";
import { OvalRenderer } from "../nodes/shapes/oval.js";
import { TriangleRenderer } from "../nodes/shapes/triangle.js";
import { TrapezoidRenderer } from "../nodes/shapes/trapezoid.js";
import { ParallelogramRenderer } from "../nodes/shapes/parallelogram.js";
import { KiteRenderer } from "../nodes/shapes/kite.js";
import { HexagonRenderer } from "../nodes/shapes/hexagon.js";
import { HeptagonRenderer } from "../nodes/shapes/heptagon.js";
import { NonagonRenderer } from "../nodes/shapes/nonagon.js";
import { DecagonRenderer } from "../nodes/shapes/decagon.js";
import { LicenseManager } from "./license.js";
import { SmartRouter } from "../connections/routing/smartRouter.js";
import { buildResolvedShapeConfig } from "../nodes/overlay.js";
import { ValidationEngine } from "./validation.js";
import { loadOnboardingSample } from "./samples.js";

import { mergeConfig } from "../utils/configMerger.js";
import * as d3 from "d3";
import { snapToGrid, generatePlacedNodeId } from "../utils/helpers.js";
import { ContextPadRegistry } from "../contextpad/registry.js";
import { ContextPadRenderer } from "../contextpad/renderer.js";
import { UndoManager } from "./history/undoManager.js";
import {
  AddNodeCommand,
  RemoveNodeCommand,
  AddEdgeCommand,
  RemoveEdgeCommand,
  UpdateNodeCommand,
  UpdateConfigCommand,
  Command,
  BatchCommand,
  AddVisualGroupCommand,
  RemoveVisualGroupCommand
} from "./history/command.js";

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
  public placementContext: { type: string; variantId?: string; ghostId: string } | null = null;
  /** When set, a connection is being dragged from this port. */
  private connectionDragContext: {
    sourceNodeId: string;
    sourcePortId: string;
    currentPoint: { x: number; y: number };
    snapped?: { nodeId: string; portId: string; point: { x: number; y: number } };
  } | null = null;
  public connectionModeEnabled: boolean = false;
  public rotationModeEnabled: boolean = false;
  public resizeModeEnabled: boolean = false;
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
    visualGroups: null,
    guides: null,
    lasso: null,
    ghosts: null,
  };
  private canvasContainerGroup: unknown;
  private contextPadRegistry: ContextPadRegistry;
  private contextPadRenderer!: ContextPadRenderer;
  private activeOperation: {
    type: string,
    nodeId: string,
    originalData: PlacedNode,
    selectionStates?: Map<string, PlacedNode>
  } | null = null;
  private undoManager: UndoManager;
  private selectionKeyboardListener: any;
  private clipboard: { nodes: PlacedNode[], connections: StoredConnection[] } | null = null;
  private editingNodeId: string | null = null;
  private onWindowMouseUp: ((e: MouseEvent) => void) | null = null;
  private onWindowMouseMove: ((e: MouseEvent) => void) | null = null;
  /** Transient visual groups (for interaction only, no structural parentId). */
  private visualGroups: VisualGroup[] = [];
  private demoEnabled = true;

  // Phase 3 Engines
  private validationEngine: ValidationEngine;

  constructor(container: HTMLElement | null, config: Partial<Config>) {
    this.container = container;
    this.config = mergeConfig(config);
    this.shapeRegistry = new ShapeRegistry();
    this.registerBuiltInShapes();
    this.eventManager = new EventManager();
    this.contextPadRegistry = new ContextPadRegistry();
    this.undoManager = new UndoManager(this.config.historyLimit || 20);
    this.validationEngine = new ValidationEngine();

    this.initializeCanvas();
    this.initializeContextPad();
    this.setupKeyboardShortcuts();

    // Set initial class state
    if (this.container) {
      if (this.connectionModeEnabled) {
        this.container.classList.add("zenode-connection-mode");
      } else {
        this.container.classList.remove("zenode-connection-mode");
      }
    }

    // Load sample workflow if canvas is empty
    if (this.placedNodes.length === 0 && this.demoEnabled) {
      this.loadSampleWorkflow();
    }

    this.emit("engine:ready", { version: "3.3.0" });
  }

  private initializeContextPad(): void {
    if (this.container) {
      this.contextPadRenderer = new ContextPadRenderer(this.container);
      import("../contextpad/defaults.js").then(({ defaultActions }) => {
        defaultActions.forEach(action => this.contextPadRegistry.register(action));
      });

      // Auto-disable connection mode when pad closes
      this.on("contextpad:close", () => {
        this.setConnectionModeEnabled(false);
      });
    }
  }

  public undo(): void {
    this.undoManager.undo();
    this.emit("history:undo", this.undoManager.getHistory());
  }

  public clear(): void {
    this.placedNodes = [];
    this.connections = [];
    this.selectedNodeIds = [];
    this.refreshNodes();
    this.reRenderConnections();
    this.emit("workflow:clear", {});
  }

  public redo(): void {
    this.undoManager.redo();
    this.emit("history:redo", this.undoManager.getHistory());
  }

  private setupKeyboardShortcuts(): void {
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      if (this.isTypingTarget(event.target)) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;
      const shortcuts = this.config.canvasProperties.keyboardShortcuts;
      if (!shortcuts?.enabled) return;

      // 1. Core Selection Actions (Delete/Clear) via Config
      if (shortcuts.deleteSelection.some((s) => this.matchesShortcut(event, s))) {
        const handled = shortcuts.callbacks?.onDeleteSelection?.({
          event,
          action: "selection:delete",
          selectedNodeIds: this.selectedNodeIds,
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
          selectedNodeIds: this.selectedNodeIds,
          engine: this,
        });
        if (handled !== false) {
          event.preventDefault();
          this.clearSelection();
        }
        return;
      }

      // 2. Modifier Actions (Z, Y, C, V, A, G)
      if (modifier) {
        const key = event.key.toLowerCase();
        if (key === 'z') {
          event.preventDefault();
          if (event.shiftKey) this.redo();
          else this.undo();
        } else if (key === 'y' && !isMac) {
          event.preventDefault();
          this.redo();
        } else if (key === 'c') {
          this.copySelection();
        } else if (key === 'v') {
          event.preventDefault();
          this.pasteSelection();
        } else if (key === 'd') {
          event.preventDefault();
          if (this.selectedNodeIds.length === 1) {
            this.duplicateNode(this.selectedNodeIds[0]);
          } else if (this.selectedNodeIds.length > 1) {
            this.copySelection();
            this.pasteSelection();
          }
        } else if (key === 'a') {
          event.preventDefault();
          const allIds = this.placedNodes.map(n => n.id);
          this.setSelectedNodeIds(allIds);
        } else if (key === 'g') {
          event.preventDefault();
          if (event.shiftKey) this.ungroupSelection();
          else this.groupSelection();
        } else if (key === '+' || key === '=') {
          event.preventDefault();
          this.zoomIn();
        } else if (key === '-') {
          event.preventDefault();
          this.zoomOut();
        } else if (key === '0') {
          event.preventDefault();
          this.zoomTo(1.0);
        }
      } else if (event.key === 'Escape') {
        this.cancelPlacement();
      } else if (event.key.toLowerCase() === 'l') {
        this.setLassoEnabled(!this.lassoEnabled);
        this.emit("lasso:toggle", { enabled: this.lassoEnabled });
      }
    });
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

  public off(eventType: string, callback: (event: any) => void): void {
    this.eventManager.off(eventType, callback);
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

  public updateConfig(newConfig: Partial<Config>, recordHistory: boolean = true): void {
    const oldConfig = JSON.parse(JSON.stringify(this.config));

    // Check if we only updated contextPad settings
    const keys = Object.keys(newConfig);
    const isContextPadOnly = keys.length === 1 &&
      keys[0] === 'canvasProperties' &&
      newConfig.canvasProperties &&
      Object.keys(newConfig.canvasProperties).length === 1 &&
      newConfig.canvasProperties.contextPad !== undefined;

    this.config = mergeConfig(newConfig);

    if (recordHistory) {
      this.undoManager.push(new UpdateConfigCommand(this, oldConfig, JSON.parse(JSON.stringify(this.config))));
    }

    // Optimization: If only context pad changed, just refresh it if active
    if (isContextPadOnly && this.svg) {
      if (this.selectedNodeIds.length === 1) {
        const node = this.placedNodes.find(n => n.id === this.selectedNodeIds[0]);
        if (node) {
          const actions = this.contextPadRegistry.getActionsFor({ kind: 'node', id: node.id, data: node }, this);
          this.contextPadRenderer.render({ kind: 'node', id: node.id, data: node }, actions, this);
        }
      } else if (this.selectedEdgeIds.length === 1) {
        const edge = this.connections.find(e => e.id === this.selectedEdgeIds[0]);
        if (edge) {
          const actions = this.contextPadRegistry.getActionsFor({ kind: 'edge', id: edge.id, data: edge }, this);
          this.contextPadRenderer.render({ kind: 'edge', id: edge.id, data: edge }, actions, this);
        }
      }
      this.emit("config:updated", { config: this.config, partial: true });
      return;
    }

    // Complete re-render of the playground/canvas (for major config changes)
    if (this.container) {
      const oldNodes = [...this.placedNodes];
      const oldConns = [...this.connections];
      const oldSelectedNodes = [...this.selectedNodeIds];
      const oldSelectedEdges = [...this.selectedEdgeIds];

      // Preserve viewport state
      let currentTransform = d3.zoomIdentity;
      if (this.svg) {
        currentTransform = d3.zoomTransform(this.svg.node());
      }

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
      this.emit("config:updated", { config: this.config, partial: false });
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

  public beginOperation(nodeId: string, type: 'drag' | 'rotate' | 'resize'): void {
    const node = this.placedNodes.find(n => n.id === nodeId);
    const group = !node ? this.visualGroups.find(g => g.id === nodeId) : null;

    // Support either a single node or a visual group as the operation trigger
    if (node || group) {
      const selectionStates = new Map<string, PlacedNode>();
      if (type === 'drag') {
        // 1. Capture all currently selected nodes
        this.selectedNodeIds.forEach(id => {
          const sn = this.placedNodes.find(pn => pn.id === id);
          if (sn) selectionStates.set(id, JSON.parse(JSON.stringify(sn)));
        });

        // 2. Capture the trigger node if not selected
        if (node && !selectionStates.has(nodeId)) {
          selectionStates.set(nodeId, JSON.parse(JSON.stringify(node)));
        }

        // 3. Capture group members if dragging a group boundary specifically
        if (group) {
            group.nodeIds.forEach(nid => {
                if (!selectionStates.has(nid)) {
                    const member = this.placedNodes.find(n => n.id === nid);
                    if (member) selectionStates.set(nid, JSON.parse(JSON.stringify(member)));
                }
            });
        }

        // 4. If any already captured are part of a visual group, capture ALL group members too
        const idsToCapture = new Set([...selectionStates.keys()]);
        this.visualGroups.forEach(g => {
          if (g.nodeIds.some(id => idsToCapture.has(id))) {
            g.nodeIds.forEach(nid => {
              if (!selectionStates.has(nid)) {
                const member = this.placedNodes.find(n => n.id === nid);
                if (member) selectionStates.set(nid, JSON.parse(JSON.stringify(member)));
              }
            });
          }
        });
      }

      const repNode = node || (group ? this.placedNodes.find(n => group.nodeIds.includes(n.id)) : null);

      this.activeOperation = {
        type,
        nodeId,
        originalData: repNode ? JSON.parse(JSON.stringify(repNode)) : ({} as any),
        selectionStates: selectionStates // Always pass the map, even if empty, for robust rendering
      };
      this.refreshNodes();
    }
  }

  public endOperation(): void {
    if (this.activeOperation) {
      if (this.activeOperation.type === 'drag') {
        // Handle potential multi-drag history
        const commands: any[] = [];
        const states = this.activeOperation.selectionStates;

        if (states) {
          states.forEach((oldState, id) => {
            const node = this.placedNodes.find(pn => pn.id === id);
            if (node) {
              const hasMoved = oldState.x !== node.x || oldState.y !== node.y;
              if (hasMoved) {
                commands.push(new UpdateNodeCommand(this, id, oldState, JSON.parse(JSON.stringify(node))));
              }
            }
          });
        }

        if (commands.length > 1) {
          this.undoManager.push(new BatchCommand(commands));
        } else if (commands.length === 1) {
          this.undoManager.push(commands[0]);
        }
      } else {
        // Fallback for rotate/resize (currently single node)
        const node = this.placedNodes.find(n => n.id === this.activeOperation!.nodeId);
        if (node && this.activeOperation.originalData) {
          const oldState = this.activeOperation.originalData;
          const newState = JSON.parse(JSON.stringify(node));

          const hasChanged =
            oldState.rotation !== newState.rotation ||
            oldState.width !== newState.width ||
            oldState.height !== newState.height ||
            oldState.radius !== newState.radius;

          if (hasChanged) {
            this.undoManager.push(new UpdateNodeCommand(this, node.id, oldState, newState));
          }
        }
      }
      this.activeOperation = null;
      this.refreshNodes();
      this.reRenderConnections();
    }
  }

  public getActiveOperation(): { type: string, nodeId: string, originalData: PlacedNode, selectionStates?: Map<string, PlacedNode> } | null {
    return this.activeOperation;
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
    this.shapeRegistry.register("semicircle", SemicircleRenderer);
    this.shapeRegistry.register("pentagon", PentagonRenderer);
    this.shapeRegistry.register("octagon", OctagonRenderer);
    this.shapeRegistry.register("star", StarRenderer);
    this.shapeRegistry.register("oval", OvalRenderer);
    this.shapeRegistry.register("triangle", TriangleRenderer);
    this.shapeRegistry.register("trapezoid", TrapezoidRenderer);
    this.shapeRegistry.register("parallelogram", ParallelogramRenderer);
    this.shapeRegistry.register("kite", KiteRenderer);
    this.shapeRegistry.register("hexagon", HexagonRenderer);
    this.shapeRegistry.register("heptagon", HeptagonRenderer);
    this.shapeRegistry.register("nonagon", NonagonRenderer);
    this.shapeRegistry.register("decagon", DecagonRenderer);
  }

  /** Public API for custom shape extension. */
  registerShape(name: string, renderer: ShapeRenderer): void {
    this.shapeRegistry.register(name, renderer);
  }

  initializeCanvas() {
    this.canvasObject = drawCanvas(
      this.container ? `#${this.container.id}` : "body",
      this.config.canvas
    ) as CanvasElements;
    this.svg = this.canvasObject.svg;
    this.svg.attr("data-lasso-enabled", "false");

    // Ensure ghosts layer is reactive
    if (this.canvasObject.ghosts) {
      this.canvasObject.ghosts.style("pointer-events", "none");
    }

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
  getPlacementContext(): { type: string; variantId?: string; ghostId: string } | null {
    return this.placementContext;
  }

  /** Clears placement context (e.g. after placing or cancel). */
  public clearPlacementContext(): void {
    if (this.placementContext) {
      if (this.canvasObject.elements) {
        this.canvasObject.elements.selectAll(".shape-preview").remove();
      }
      this.placementContext = null;
    }
  }

  /**
   * Loads a small, pre-built sample workflow to guide new users.
   */
  public loadSampleWorkflow(): void {
    loadOnboardingSample(this);
  }

  // --- PHASE 3.1: PUBLIC NODE API ---

  /**
   * Programmatically adds a node to the canvas.
   * @param config Partial configuration for the new node.
   * @returns The ID of the created node.
   */
  public addNode(config: NodeConfig, recordHistory: boolean = true): string {
    const id = config.id || this.generateId();
    const newNode: PlacedNode = {
      id,
      type: config.type,
      shapeVariantId: config.shapeVariantId,
      x: config.x ?? 0,
      y: config.y ?? 0,
      width: config.width,
      height: config.height,
      radius: config.radius,
      rotation: config.rotation || 0,
      visualState: config.visualState || { status: "idle" },
      content: config.content,
      meta: config.meta || {},
    };

    this.placedNodes.push(newNode);
    this.refreshNodes();
    this.reRenderConnections();

    if (recordHistory) {
      this.undoManager.push(new AddNodeCommand(this, { ...newNode }));
    }

    this.emit("node:placed", { node: newNode });
    return id;
  }

  /**
   * Removes a node and its associated connections.
   */
  public removeNode(id: string, recordHistory: boolean = true): void {
    const deletedNode = this.placedNodes.find(n => n.id === id);
    if (!deletedNode) return;

    if (recordHistory) {
      this.undoManager.push(new RemoveNodeCommand(this, id));
    }

    // 1. Remove associated connections
    this.connections = this.connections.filter(c => c.sourceNodeId !== id && c.targetNodeId !== id);
    this.reRenderConnections();

    // 2. Remove from selection
    this.selectedNodeIds = this.selectedNodeIds.filter(sid => sid !== id);

    // 3. Remove node
    this.placedNodes = this.placedNodes.filter(n => n.id !== id);

    this.refreshNodes();
    this.reRenderConnections();
    this.emit("node:deleted", { id, node: deletedNode });
  }

  /**
   * Updates an existing node's properties.
   */
  public updateNode(id: string, patch: Partial<NodeConfig>, recordHistory: boolean = true): void {
    const idx = this.placedNodes.findIndex(n => n.id === id);
    if (idx === -1) return;

    if (recordHistory) {
      const oldState = { ...this.placedNodes[idx] };
      this.undoManager.push(new UpdateNodeCommand(this, id, oldState, patch));
    }

    this.placedNodes[idx] = {
      ...this.placedNodes[idx],
      ...patch,
      id // Ensure ID cannot be changed via update
    };

    this.refreshNodes();
    this.reRenderConnections();
    this.emit("node:updated", { id, patch, node: this.placedNodes[idx] });
  }

  /**
   * Sets the status of a node for live execution feedback.
   * @param id Node ID
   * @param status 'idle' | 'running' | 'success' | 'error' | 'warning'
   */
  public setNodeStatus(id: string, status: "idle" | "running" | "success" | "error" | "warning"): void {
    const node = this.placedNodes.find(n => n.id === id);
    if (!node) return;

    node.visualState = {
      ...node.visualState,
      status
    };

    this.refreshNodes();
    this.reRenderConnections();
    this.emit("node:status:change", { id, status, node: { ...node } });
  }

  /**
   * Centers the viewport on a specific node with optional zoom and transition settings.
   */
  public focusNode(id: string, options: { zoom?: number, duration?: number, offset?: { x: number, y: number } } = {}): void {
    const node = this.placedNodes.find(n => n.id === id);
    const focusDefaults = this.config.canvasProperties.visualEffects?.focus || { padding: 60, duration: 1000, defaultZoom: 1.2 };

    // Zoom behavior reset if no node
    if (!node && this.svg && this.zoomManager) {
      const transform = d3.zoomIdentity;
      this.svg.transition().duration(options.duration || focusDefaults.duration)
        .call(this.zoomManager.getZoomBehaviour().transform as any, transform);
      return;
    }

    if (node && this.svg && this.zoomManager) {
      const width = this.config.canvas.width;
      const height = this.config.canvas.height;
      const zoomLevel = options.zoom !== undefined ? options.zoom : focusDefaults.defaultZoom;
      const offsetX = options.offset?.x || 0;
      const offsetY = options.offset?.y || 0;

      const transform = d3.zoomIdentity
        .translate(width / 2 - node.x + offsetX, height / 2 - node.y + offsetY)
        .scale(zoomLevel);

      this.svg.transition()
        .duration(options.duration || focusDefaults.duration)
        .ease(d3.easeCubicInOut)
        .call(this.zoomManager.getZoomBehaviour().transform as any, transform);
    }
  }

  /**
   * Temporarily highlights a node for visual emphasis using configurable effects.
   */
  public highlight(id: string, options: { color?: string, duration?: number, intensity?: number } = {}): void {
    const node = this.placedNodes.find(n => n.id === id);
    if (!node) return;

    const highlightDefaults = this.config.canvasProperties.visualEffects?.highlight || { color: '#ffdd00', duration: 3000, scale: 1.2, intensity: 2.5 };
    const originalGlow = node.visualState?.effects?.glow;

    // Apply high-intensity glow from config or override
    node.visualState = {
      ...node.visualState,
      effects: {
        ...node.visualState?.effects,
        glow: {
          color: options.color || highlightDefaults.color,
          intensity: options.intensity || highlightDefaults.intensity
        }
      }
    };
    this.refreshNodes();

    setTimeout(() => {
      const currentNode = this.placedNodes.find(n => n.id === id);
      if (currentNode) {
        currentNode.visualState = {
          ...currentNode.visualState,
          effects: {
            ...currentNode.visualState?.effects,
            glow: originalGlow
          }
        };
        this.refreshNodes();
      }
    }, options.duration || highlightDefaults.duration);
  }

  /**
   * Retrieves a node's full state.
   */
  public getNode(id: string): NodeData | null {
    const node = this.placedNodes.find(n => n.id === id);
    return node ? { ...node } as NodeData : null;
  }

  /**
   * Returns all nodes currently on the canvas.
   */
  public getAllNodes(): NodeData[] {
    return this.placedNodes.map(n => ({ ...n } as NodeData));
  }

  /**
   * Clones a node with a slight offset.
   */
  public duplicateNode(id: string): string {
    const source = this.getNode(id);
    if (!source) return "";

    const offset = 20;
    return this.addNode({
      ...source,
      id: undefined, // Force new ID
      x: source.x + offset,
      y: source.y + offset
    });
  }
  /** Helper to trigger diagram layer re-renders */
  public refreshNodes(): void {
    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    this.reRenderConnections();

    // Explicitly update context pad if nodes are selected
    if (this.selectedNodeIds.length > 0 && this.contextPadRenderer) {
      this.contextPadRenderer.updatePosition(this);
    }
  }

  /**
   * Retrieves a node object by ID.
   */
  private getPlacedNode(id: string): PlacedNode | undefined {
    return this.placedNodes.find(n => n.id === id);
  }

  /**
   * Copies currently selected nodes and internal edges to the engine clipboard.
   */
  public copySelection(): void {
    if (this.selectedNodeIds.length === 0) return;

    const nodesToCopy = this.placedNodes.filter(n => this.selectedNodeIds.includes(n.id));
    const nodeIds = nodesToCopy.map(n => n.id);

    // Only copy edges that connect two nodes within the current selection
    const edgesToCopy = this.connections.filter(c =>
      nodeIds.includes(c.sourceNodeId) &&
      nodeIds.includes(c.targetNodeId)
    );

    this.clipboard = {
      nodes: JSON.parse(JSON.stringify(nodesToCopy)),
      connections: JSON.parse(JSON.stringify(edgesToCopy))
    };

    console.log(`[ZENODE] Copied ${nodesToCopy.length} nodes and ${edgesToCopy.length} connections.`);
  }

  /**
   * Pastes items from the engine clipboard onto the canvas with a small offset.
   * Maintains internal connections between pasted nodes.
   */
  public pasteSelection(offset: { x: number, y: number } = { x: 40, y: 40 }): void {
    if (!this.clipboard) return;

    const idMap = new Map<string, string>();
    const newNodesConfigs: NodeConfig[] = [];
    const newEdgesConfigs: EdgeConfig[] = [];

    // 1. Prepare new node configs and map IDs
    this.clipboard.nodes.forEach(n => {
      const newId = this.generateId();
      idMap.set(n.id, newId);

      const config: NodeConfig = {
        ...JSON.parse(JSON.stringify(n)),
        id: newId,
        x: n.x + offset.x,
        y: n.y + offset.y
      };
      newNodesConfigs.push(config);
    });

    // 1.5. Remap parentIds within the new set if both child and parent are being pasted
    newNodesConfigs.forEach(config => {
      if (config.parentId && idMap.has(config.parentId)) {
        config.parentId = idMap.get(config.parentId);
      }
    });

    // 2. Prepare new edge configs using mapped IDs
    this.clipboard.connections.forEach(e => {
      if (idMap.has(e.sourceNodeId) && idMap.has(e.targetNodeId)) {
        const config: EdgeConfig = {
          ...JSON.parse(JSON.stringify(e)),
          id: this.generateId(),
          sourceNodeId: idMap.get(e.sourceNodeId)!,
          targetNodeId: idMap.get(e.targetNodeId)!
        };
        newEdgesConfigs.push(config);
      }
    });

    // 3. Batch apply changes via history
    const commands: Command[] = [];

    newNodesConfigs.forEach(config => {
      const id = this.addNode(config, false); // No individual history
      commands.push(new AddNodeCommand(this, this.getPlacedNode(id)!));
    });

    newEdgesConfigs.forEach(config => {
      const id = this.addEdge(config, false); // No individual history
      commands.push(new AddEdgeCommand(this, this.getEdge(id)! as any));
    });

    if (commands.length > 0) {
      this.undoManager.push(new BatchCommand(commands));
    }

    // 4. Select newly pasted nodes
    this.setSelectedNodeIds(Array.from(idMap.values()));
    this.refreshNodes();
    this.reRenderConnections();

    console.log(`[ZENODE] Pasted ${newNodesConfigs.length} nodes and ${newEdgesConfigs.length} connections.`);
  }

  // --- PHASE 3.2: PUBLIC EDGE/CONNECTION API ---

  /**
   * Programmatically creates a connection between two nodes.
   * @returns The ID of the created connection.
   */
  public addEdge(config: EdgeConfig, recordHistory: boolean = true): string {
    const id = config.id || this.generateId();
    const newEdge: StoredConnection = {
      id,
      sourceNodeId: config.sourceNodeId,
      sourcePortId: config.sourcePortId,
      targetNodeId: config.targetNodeId,
      targetPortId: config.targetPortId,
      type: config.type || this.activeConnectionType,
      visualState: { status: "idle" }
    };

    this.connections.push(newEdge);
    this.reRenderConnections();

    if (recordHistory) {
      this.undoManager.push(new AddEdgeCommand(this, { ...newEdge }));
    }

    this.emit("edge:created", { edge: newEdge });
    return id;
  }

  /**
   * Removes a connection by ID.
   */
  public removeEdge(id: string, recordHistory: boolean = true): void {
    const deletedEdge = this.connections.find(c => c.id === id);
    if (!deletedEdge) return;

    if (recordHistory) {
      this.undoManager.push(new RemoveEdgeCommand(this, { ...deletedEdge }));
    }

    this.connections = this.connections.filter(c => c.id !== id);
    this.reRenderConnections();
    this.emit("edge:deleted", { id, edge: deletedEdge });
  }

  /**
   * Returns a specific connection's state.
   */
  public getEdge(id: string): EdgeData | null {
    const edge = this.connections.find(c => c.id === id);
    return edge ? { ...edge } as EdgeData : null;
  }

  /**
   * Returns all connections on the canvas.
   */
  public getAllEdges(): EdgeData[] {
    return this.connections.map(c => ({ ...c } as EdgeData));
  }

  /**
   * Returns a unified snapshot of the current diagram state.
   * Useful for persistence, syncing, or debugging.
   */
  public getDiagramState() {
    const transform = d3.zoomTransform(this.svg?.node() as any);
    return {
      nodes: this.getAllNodes(),
      edges: this.getAllEdges(),
      viewport: {
        x: transform.x,
        y: transform.y,
        zoom: transform.k
      }
    };
  }

  // --- PHASE 3.3-3.6: EXTENDED API ---

  public validate(): import("./validation.js").ValidationResult {
    return this.validationEngine?.validate(this.getAllNodes(), this.getAllEdges()) || { valid: true, errors: [], warnings: [] };
  }

  public toJSON(): string {
    return JSON.stringify(this.getDiagramState(), null, 2);
  }

  /**
   * Sets the ID of the node currently being edited in-place.
   * This is used to suppress SVG rendering while the UI editor is active.
   */
  public setEditingNode(id: string | null): void {
    this.editingNodeId = id;
    this.refreshNodes();
  }

  /** Gets the current editing node ID. */
  public getEditingNodeId(): string | null {
    return this.editingNodeId;
  }

  /**
   * Clears the current canvas and loads state from a Zenode JSON string.
   */
  public fromJSON(json: string): void {
    try {
      const state = JSON.parse(json);
      const { nodes, edges, viewport } = state;

      this.placedNodes = nodes || [];
      this.connections = edges || [];

      if (viewport && this.zoomManager && this.svg) {
        const transform = d3.zoomIdentity.translate(viewport.x, viewport.y).scale(viewport.zoom);
        this.svg.transition().duration(500)
          .call(this.zoomManager.getZoomBehaviour().transform as any, transform);
      }

      this.refreshNodes();
      this.reRenderConnections();
      this.emit("workflow:load", { nodes: this.placedNodes, edges: this.connections });
    } catch (e) {
      console.error("[ZENODE] Failed to load JSON state", e);
    }
  }

  /**
   * Aligns selected nodes in a specific direction.
   */
  public alignSelection(direction: "left" | "center" | "right" | "top" | "middle" | "bottom"): void {
    if (this.selectedNodeIds.length <= 1) return;

    const nodes = this.placedNodes.filter(n => this.selectedNodeIds.includes(n.id));
    const firstId = this.selectedNodeIds[0];
    const anchor = this.placedNodes.find(n => n.id === firstId);
    if (!anchor) return;

    this.beginOperation(firstId, "drag"); // Dummy start for history grouping if we had a multi-undo

    nodes.forEach(node => {
      if (direction === "left") node.x = anchor.x;
      if (direction === "right") node.x = anchor.x + (anchor.width || 0) - (node.width || 0);
      if (direction === "center") node.x = anchor.x + (anchor.width || 0) / 2 - (node.width || 0) / 2;
      if (direction === "top") node.y = anchor.y;
      if (direction === "bottom") node.y = anchor.y + (anchor.height || 0) - (node.height || 0);
      if (direction === "middle") node.y = anchor.y + (anchor.height || 0) / 2 - (node.height || 0) / 2;
    });

    this.refreshNodes();
    this.reRenderConnections();
    this.emit("node:aligned", { direction, ids: this.selectedNodeIds });
  }

  /**
   * Distributes selected nodes uniformly.
   */
  public distributeSelection(direction: "horizontal" | "vertical"): void {
    if (this.selectedNodeIds.length <= 2) return;
    const nodes = this.placedNodes
      .filter(n => this.selectedNodeIds.includes(n.id))
      .sort((a, b) => direction === "horizontal" ? a.x - b.x : a.y - b.y);

    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const totalDist = direction === "horizontal" ? last.x - first.x : last.y - first.y;
    const step = totalDist / (nodes.length - 1);

    nodes.forEach((n, i) => {
      if (direction === "horizontal") n.x = first.x + i * step;
      else n.y = first.y + i * step;
    });

    this.refreshNodes();
    this.reRenderConnections();
  }

  /**
   * Reorders the internal placedNodes array based on a list of IDs.
   * Higher index = rendered on top.
   */
  public setNodeOrder(newIds: string[], recordHistory: boolean = true): void {
    const oldIds = this.placedNodes.map(n => n.id);

    const nodeMap = new Map<string, PlacedNode>();
    this.placedNodes.forEach(n => nodeMap.set(n.id, n));

    const newOrder: PlacedNode[] = [];
    newIds.forEach(id => {
      const node = nodeMap.get(id);
      if (node) newOrder.push(node);
    });

    // Add any nodes that were missing from the newIds list (safety)
    if (newOrder.length < this.placedNodes.length) {
      this.placedNodes.forEach(n => {
        if (!newIds.includes(n.id)) newOrder.push(n);
      });
    }

    this.placedNodes = newOrder;

    if (recordHistory) {
      import("./history/command.js").then(({ ReorderNodesCommand }) => {
        this.undoManager.push(new ReorderNodesCommand(this, oldIds, newIds));
      });
    }

    this.refreshNodes();
    this.reRenderConnections();
  }

  /**
   * Moves specific nodes to the end of the drawing array so they appear on top.
   */
  public bringToFront(ids: string[]): void {
    const currentIds = this.placedNodes.map(n => n.id);
    const toMove = new Set(ids);
    const remaining = currentIds.filter(id => !toMove.has(id));
    const newOrder = [...remaining, ...ids.filter(id => currentIds.includes(id))];
    this.setNodeOrder(newOrder);
  }

  /**
   * Moves specific nodes to the beginning of the drawing array so they appear behind others.
   */
  public sendToBack(ids: string[]): void {
    const currentIds = this.placedNodes.map(n => n.id);
    const toMove = new Set(ids);
    const remaining = currentIds.filter(id => !toMove.has(id));
    const newOrder = [...ids.filter(id => currentIds.includes(id)), ...remaining];
    this.setNodeOrder(newOrder);
  }

  /**
   * Programmatically triggers the text editor for a node or edge.
   */
  public beginLabelEdit(id: string, kind: 'node' | 'edge'): void {
    const target = kind === 'node'
      ? this.placedNodes.find(n => n.id === id)
      : this.connections.find(c => c.id === id);

    if (target) {
      this.emit("contextpad:edit-content", {
        kind,
        id,
        data: target
      });
    }
  }

  /** Robust unique ID generator */
  private generateId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'node-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }

  /** Removes mousemove and click handlers used for placement; stops preview. */
  removePlacementListeners(): void {
    if (this.svg) {
      this.svg.on("mousemove.placement", null);
      this.svg.on("click.placement", null);
    }
  }

  /**
   * Cancels any active placement operation.
   */
  public cancelPlacement(): void {
    this.connectionModeEnabled = false;
    this.connectionDragContext = null;
    this.cleanupGhostConnection();
    this.refreshNodes();
    this.eventManager.trigger("connection:mode:changed", { enabled: false });
    this.clearPlacementContext();
    this.removePlacementListeners();
    if (this.canvasObject.elements) {
      this.canvasObject.elements.selectAll(".shape-preview").remove();
    }
    this.emit("placement:cancelled", {});
  }

  /** Returns selected node ids. */
  getSelectedNodeIds(): string[] {
    return [...this.selectedNodeIds];
  }

  /** Placement and Preview APIs */
  public setPlacementContext(type: string, variantId?: string, ghostId?: string): void {
    this.placementContext = { type, variantId, ghostId: ghostId || ("ghost-" + Date.now()) };
  }

  public startPlacement(type: string, variantId: string, initialPoint?: { x: number; y: number }): string {
    this.cancelPlacement();
    const ghostId = "ghost-" + Date.now();
    this.placementContext = { type, variantId, ghostId };

    if (initialPoint) {
      this.updatePlacementPreview(initialPoint.x, initialPoint.y);
    }

    // Use setTimeout to avoid the current bubbling click event from triggering completePlacement immediately
    setTimeout(() => {
        if (!this.svg) return;
        this.svg.on("mousemove.placement", (event: MouseEvent) => {
          const point = d3.pointer(event, this.svg.node() as any);
          const canvasPoint = this.getCanvasPointFromEvent(point[0], point[1]);
          this.updatePlacementPreview(canvasPoint.x, canvasPoint.y);
        });

        this.svg.on("click.placement", (event: MouseEvent) => {
          // Prevent bubbling up to the global SVG click listener
          event.stopPropagation();
          this.completePlacement(event);
        });
    }, 0);

    return ghostId;
  }

  public updatePlacementPreview(x: number, y: number): void {
    if (!this.placementContext || !this.canvasObject.elements) return;

    let preview = this.canvasObject.elements.selectAll(".shape-preview");
    if (preview.empty()) {
      preview = this.canvasObject.elements.append("g").attr("class", "shape-preview");
      const renderer = this.shapeRegistry.get(this.placementContext.type);
      const style = this.config.shapes.default?.[this.placementContext.type as keyof typeof this.config.shapes.default]
        ?.find((s: any) => s.id === (this.placementContext?.variantId || "default"));

      if (renderer && style) {
        // Create a mock node to use buildResolvedShapeConfig for consistent centering
        const mockNode: PlacedNode = {
          id: "preview",
          type: this.placementContext.type,
          shapeVariantId: this.placementContext.variantId || "default",
          x: 0,
          y: 0,
          width: style.width,
          height: style.height,
          radius: style.radius,
          meta: {}
        };
        const resolvedConfig = buildResolvedShapeConfig(mockNode, style);
        renderer.draw(preview as any, resolvedConfig, {});
        preview.style("opacity", 0.5).style("pointer-events", "none");
      }
    }
    preview.attr("transform", `translate(${x}, ${y})`);
  }

  public completePlacement(event?: MouseEvent): string {
    if (!this.placementContext) return "";
    const { type, variantId } = this.placementContext;

    // Get mouse position relative to SVG
    const point = d3.pointer(event, this.svg.node() as any) || [0, 0];
    
    // Safety check: D3 pointer can return NaN if no active event on element
    const safeX = isNaN(point[0]) ? 0 : point[0];
    const safeY = isNaN(point[1]) ? 0 : point[1];
    
    const canvasPoint = this.getCanvasPointFromEvent(safeX, safeY);

    const node = this.placeShapeAt(type, variantId || "default", canvasPoint.x, canvasPoint.y, { shapeVariantId: variantId });
    this.cancelPlacement();
    return node ? node.id : "";
  }

  private getCanvasPointFromEvent(screenX: number, screenY: number): { x: number; y: number } {
    const transform = d3.zoomTransform(this.svg.node() as any);
    return {
      x: (screenX - transform.x) / transform.k,
      y: (screenY - transform.y) / transform.k
    };
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
    if (enabled) {
      this.rotationModeEnabled = false;
      this.resizeModeEnabled = false;
    }
    this.connectionModeEnabled = enabled;

    // Toggle container class for conditional CSS (e.g. port animations)
    if (this.container) {
      if (enabled) {
        this.container.classList.add("zenode-connection-mode");
      } else {
        this.container.classList.remove("zenode-connection-mode");
      }
    }

    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    this.eventManager.trigger("connection:mode:changed", { enabled });
  }

  isRotationModeEnabled(): boolean {
    return this.rotationModeEnabled;
  }

  setRotationModeEnabled(enabled: boolean): void {
    if (enabled) {
      this.connectionModeEnabled = false;
      this.resizeModeEnabled = false;
    }
    this.rotationModeEnabled = enabled;
    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    this.eventManager.trigger("rotation:mode:changed", { enabled });
  }

  isResizeModeEnabled(): boolean {
    return this.resizeModeEnabled;
  }

  setResizeModeEnabled(enabled: boolean): void {
    if (enabled) {
      this.connectionModeEnabled = false;
      this.rotationModeEnabled = false;
    }
    this.resizeModeEnabled = enabled;
    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    this.eventManager.trigger("resize:mode:changed", { enabled });
  }

  /** Sets the active connection type for newly created connections. */
  setActiveConnectionType(type: string): void {
    this.activeConnectionType = type;
  }

  /** Sets selected node ids and re-renders selection rings. */
  public setSelectedNodeIds(ids: string[], primaryId?: string): void {
    const nodeIds = Array.isArray(ids) ? ids : [ids];
    this.selectedEdgeIds = []; // Clear edges when nodes selected

    // Only auto-expand selection if explicitly triggered by a collective-group-trigger
    let expandedIds = new Set(nodeIds);
    if (primaryId === 'collective-group-trigger') {
      this.visualGroups.forEach(group => {
        const nodeIdsInGroup = new Set(group.nodeIds);
        if (nodeIds.some(id => nodeIdsInGroup.has(id))) {
          group.nodeIds.forEach(id => expandedIds.add(id));
        }
      });
    }

    this.selectedNodeIds = Array.from(expandedIds);
    this.refreshNodes();

    if (this.selectedNodeIds.length === 1) {
      const node = this.placedNodes.find(n => n.id === this.selectedNodeIds[0]);
      if (node) {
        this.showContextPad({ kind: 'node', id: node.id, data: node });
      }
    } else if (primaryId === 'collective-group-trigger' || this.selectedNodeIds.length > 1) {
      const activeGroups = this.visualGroups.filter(g => {
        const gNodes = new Set(g.nodeIds);
        return this.selectedNodeIds.some(id => gNodes.has(id));
      });

      const group = activeGroups[0];
      // Collective group pad if we have exactly one group and it's either explicitly triggered or fully selected
      const isCollectiveGroup = group && activeGroups.length === 1 &&
        (primaryId === 'collective-group-trigger' || this.selectedNodeIds.length === group.nodeIds.length);

      if (isCollectiveGroup) {
        const bounds = this.getGroupBounds(group.id);
        if (bounds) {
          const target: ContextPadTarget = {
            kind: 'group',
            id: group.id,
            data: group.nodeIds,
            box: {
              x: bounds.x,
              y: bounds.y + 28, // Offset down
              width: bounds.width,
              height: bounds.height - 28
            }
          };
          this.showContextPad(target);
        }
      } else {
        this.contextPadRenderer?.hide(this);
      }
    } else if (this.selectedEdgeIds.length !== 1) {
      this.contextPadRenderer?.hide(this);
    }

    this.eventManager.trigger("node:selected", { ids: this.getSelectedNodeIds(), primaryId });
  }

  public groupSelection(recordHistory: boolean = true): void {
    if (this.selectedNodeIds.length < 2) return;
    const newNodeIds = [...this.selectedNodeIds];

    // Capture removed group IDs
    const removedGroupIds = new Set(this.visualGroups.filter(g => newNodeIds.some(id => g.nodeIds.includes(id))).map(g => g.id));

    // Remove old groups
    this.visualGroups = this.visualGroups.filter(g => !removedGroupIds.has(g.id));

    // Purge connections referencing the removed groups/shapes
    if (removedGroupIds.size > 0) {
      this.connections = this.connections.filter(c =>
        !removedGroupIds.has(c.sourceNodeId) && !removedGroupIds.has(c.targetNodeId)
      );
    }

    const newGroup: VisualGroup = {
      id: `vgroup-${Date.now()}`,
      nodeIds: newNodeIds
    };

    this.visualGroups.push(newGroup);

    if (recordHistory) {
      this.undoManager.push(new AddVisualGroupCommand(this, { ...newGroup }));
    }

    this.refreshNodes();
    this.emit("selection:grouped", { nodeIds: this.selectedNodeIds });
    this.setSelectedNodeIds(this.selectedNodeIds);
  }

  public ungroupSelection(recordHistory: boolean = true): void {
    if (this.selectedNodeIds.length === 0) return;
    const ids = new Set(this.selectedNodeIds);

    const groupsToRemove = this.visualGroups.filter(group => {
      return [...ids].some(id => group.nodeIds.includes(id));
    });

    if (recordHistory) {
      groupsToRemove.forEach(g => {
        this.undoManager.push(new RemoveVisualGroupCommand(this, { ...g }));
      });
    }

    const removedGroupIds = new Set(groupsToRemove.map(g => g.id));
    this.visualGroups = this.visualGroups.filter(g => !removedGroupIds.has(g.id));

    // Purge related connections
    if (removedGroupIds.size > 0) {
      this.connections = this.connections.filter(c =>
        !removedGroupIds.has(c.sourceNodeId) && !removedGroupIds.has(c.targetNodeId)
      );
    }

    this.refreshNodes();
    this.emit("selection:ungrouped", { nodeIds: this.selectedNodeIds });
    this.setSelectedNodeIds(this.selectedNodeIds);
  }

  /** Internal helpers for undo/redo */
  public restoreVisualGroup(group: VisualGroup): void {
    this.visualGroups.push(group);
    this.refreshNodes();
  }

  public removeVisualGroup(groupId: string): void {
    this.visualGroups = this.visualGroups.filter(g => g.id !== groupId);
    this.connections = this.connections.filter(c => c.sourceNodeId !== groupId && c.targetNodeId !== groupId);
    this.refreshNodes();
    this.reRenderConnections();
  }

  public toggleGroupingSelection(): void {
    const selected = this.selectedNodeIds;
    if (selected.length < 2) return;

    // Check if current selection represents an existing group exactly
    const exists = this.visualGroups.some(g => g.nodeIds.length === selected.length && selected.every(id => g.nodeIds.includes(id)));
    if (exists) {
      this.ungroupSelection();
    } else {
      this.groupSelection();
    }
  }

  public getVisualGroups(): VisualGroup[] {
    return [...this.visualGroups];
  }

  public getSelectedEdgeIds(): string[] {
    return [...this.selectedEdgeIds];
  }

  public setSelectedEdgeIds(ids: string[]): void {
    this.selectedEdgeIds = ids;
    this.selectedNodeIds = []; // Clear nodes when edges selected
    this.refreshNodes();
    this.reRenderConnections();
    this.emit("selection:changed", { nodeIds: [], edgeIds: ids });

    if (this.selectedEdgeIds.length === 1) {
      const edge = this.connections.find((e) => e.id === this.selectedEdgeIds[0]);
      if (edge) {
        const actions = this.contextPadRegistry.getActionsFor(
          { kind: "edge", id: edge.id, data: edge },
          this
        );
        this.contextPadRenderer.render({ kind: "edge", id: edge.id, data: edge }, actions, this);
      }
    } else {
      this.contextPadRenderer?.hide(this);
    }
  }

  public toggleConnectionStyle(id: string, property: 'dashed' | 'animated'): void {
    const conn = this.connections.find(c => c.id === id);
    if (conn) {
      if (property === 'dashed') conn.dashed = !conn.dashed;
      if (property === 'animated') conn.animated = !conn.animated;

      this.reRenderConnections();

      // Refresh context pad instantly so the Animation button visibility updates
      if (this.selectedEdgeIds.includes(id)) {
        const actions = this.contextPadRegistry.getActionsFor({ kind: "edge", id: conn.id, data: conn }, this);
        this.contextPadRenderer.render({ kind: "edge", id: conn.id, data: conn }, actions, this);
      }
    }
  }

  public getConnections(): StoredConnection[] {
    return [...this.connections];
  }

  public getGroupBounds(groupId: string, overrideNodes?: Map<string, PlacedNode>): BoundingBox | null {
    const group = this.visualGroups.find(g => g.id === groupId);
    if (!group) return null;

    const padding = 20;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let found = 0;

    group.nodeIds.forEach(nodeId => {
      let node = overrideNodes?.get(nodeId);
      if (!node) {
        node = this.placedNodes.find(n => n.id === nodeId);
      }

      if (!node) return;

      const style = this.getShapeStyle(node);
      if (!style) return;
      const renderer = this.shapeRegistry.get(node.type);
      const resolved = buildResolvedShapeConfig(node, style);
      const localBounds = renderer.getBounds(resolved);

      const absL = node.x + localBounds.x;
      const absR = absL + localBounds.width;
      const absT = node.y + localBounds.y;
      const absB = absT + localBounds.height;

      minX = Math.min(minX, absL);
      minY = Math.min(minY, absT);
      maxX = Math.max(maxX, absR);
      maxY = Math.max(maxY, absB);
      found++;
    });

    if (found === 0) return null;

    // Final bounding box in canvas coordinates with padding
    return {
      x: Math.floor(minX - padding),
      y: Math.floor(minY - padding),
      width: Math.ceil((maxX - minX) + padding * 2),
      height: Math.ceil((maxY - minY) + padding * 2)
    };
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
  public placeNode(node: PlacedNode, recordHistory: boolean = true): void {
    this.placedNodes = [...this.placedNodes, node];

    if (recordHistory) {
      this.undoManager.push(new AddNodeCommand(this, { ...node }));
    }

    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
      this.reRenderConnections();
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
  updateNodePosition(id: string, x: number, y: number, recordHistory: boolean = true, skipVisualRefresh: boolean = false): void {
    const node = this.placedNodes.find(n => n.id === id);
    if (!node) return;

    if (recordHistory) {
      this.undoManager.push(new UpdateNodeCommand(this, id, { ...node }, { ...node, x, y }));
    }

    this.placedNodes = this.placedNodes.map((n) => (n.id === id ? { ...n, x, y } : n));
    if (this.canvasObject.connections) {
      this.reRenderConnections();
    }

    if (this.selectedNodeIds.includes(id)) {
      this.contextPadRenderer?.updatePosition(this);
    }

    if (!skipVisualRefresh) {
      this.refreshNodes();
    }
    
    this.eventManager.trigger("node:moved", { id, x, y });
  }

  /**
   * Updates a node's rotation.
   */
  rotateNode(id: string, rotation: number, recordHistory: boolean = true): void {
    const targets = (recordHistory && this.selectedNodeIds.includes(id))
      ? this.selectedNodeIds
      : [id];

    targets.forEach(nodeId => {
      const n = this.placedNodes.find(pn => pn.id === nodeId);
      if (!n) return;

      if (recordHistory) {
        this.undoManager.push(new UpdateNodeCommand(this, nodeId, { ...n }, { ...n, rotation }));
      }
      this.placedNodes = this.placedNodes.map((pn) => (pn.id === nodeId ? { ...pn, rotation } : pn));
    });

    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    this.reRenderConnections();

    if (this.contextPadRenderer && this.selectedNodeIds.includes(id)) {
      this.contextPadRenderer.updatePosition(this);
    }

    this.eventManager.trigger("node:rotated", { id, rotation });
  }

  /**
   * Updates a node's dimensions (width/height or radius).
   */
  updateNodeDimensions(id: string, dimensions: { width?: number; height?: number; radius?: number }, recordHistory: boolean = true): void {
    const targets = (recordHistory && this.selectedNodeIds.includes(id))
      ? this.selectedNodeIds
      : [id];

    targets.forEach(nodeId => {
      const node = this.placedNodes.find(n => n.id === nodeId);
      if (!node) return;

      if (recordHistory) {
        this.undoManager.push(new UpdateNodeCommand(this, nodeId, { ...node }, { ...node, ...dimensions }));
      }

      this.placedNodes = this.placedNodes.map((n) => {
        if (n.id !== nodeId) return n;
        const baseDimensions = n.baseDimensions ?? {
          width: n.width,
          height: n.height,
          radius: n.radius,
        };
        return {
          ...n,
          baseDimensions,
          width: dimensions.width ?? n.width,
          height: dimensions.height ?? n.height,
          radius: dimensions.radius ?? n.radius,
        };
      });
    });

    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    this.reRenderConnections();

    if (this.contextPadRenderer && this.selectedNodeIds.includes(id)) {
      this.contextPadRenderer.updatePosition(this);
    }

    this.eventManager.trigger("node:resized", { id, dimensions });
  }

  public zoomIn(): void {
    this.zoomManager.zoomBy(this.svg, 1.2);
  }

  public zoomOut(): void {
    this.zoomManager.zoomBy(this.svg, 0.8);
  }

  public createDragBehavior(): any {
    const api = {
      updateNodePosition: (id: string, x: number, y: number, recordHistory?: boolean, skipVisualRefresh?: boolean) => this.updateNodePosition(id, x, y, recordHistory, skipVisualRefresh),
      panBy: (dx: number, dy: number) => {
        const t = d3.zoomTransform(this.svg.node() as Element);
        this.zoomManager.panBy(this.svg, dx / t.k, dy / t.k);
      },
      getPlacedNodes: () => this.placedNodes,
      isConnectionModeEnabled: () => this.isConnectionModeEnabled(),
      config: this.config,
      ghostsLayer: this.canvasObject.ghosts,
      shapeRegistry: this.shapeRegistry,
      canvasObject: this.canvasObject,
      svgNode: this.svgNode,
      setSelectedNodeIds: (ids: string[], primaryId?: string) => this.setSelectedNodeIds(ids, primaryId),
      getSelectedNodeIds: () => this.selectedNodeIds,
      beginOperation: (nodeId: string, type: 'drag' | 'rotate' | 'resize') => this.beginOperation(nodeId, type),
      endOperation: () => this.endOperation(),
      getActiveOperation: () => this.getActiveOperation(),
      getVisualGroups: () => this.visualGroups,
      getGroupBounds: (groupId: string, overrideNodes?: Map<string, PlacedNode>) => this.getGroupBounds(groupId, overrideNodes),
    };
    return initDragBehavior(api as any);
  }

  public zoomTo(scale: number): void {
    this.zoomManager.zoomTo(this.svg, scale);
  }

  public focusOnNode(id: string): void {
    this.focusNode(id);
  }

  public focusOnSelectedNode(): void {
    if (this.selectedNodeIds.length > 0) {
      this.focusNode(this.selectedNodeIds[0]);
    } else if (this.placedNodes.length > 0) {
      // Focus on the center of all nodes AND zoom to fit if needed
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      this.placedNodes.forEach(n => {
        const style = this.getShapeStyle(n);
        const w = n.width ?? style?.width ?? 100;
        const h = n.height ?? style?.height ?? 100;
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + w);
        maxY = Math.max(maxY, n.y + h);
      });

      const diagramWidth = maxX - minX;
      const diagramHeight = maxY - minY;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      // Use the real rendered SVG size, not the SVG attribute (which is null on infinite canvas)
      const svgEl = this.svg.node() as SVGElement;
      const rect = svgEl.getBoundingClientRect();
      const svgWidth = rect.width || 800;
      const svgHeight = rect.height || 500;

      // Calculate the scale to fit everything with padding
      const padding = 60;
      const scaleX = (svgWidth - padding * 2) / diagramWidth;
      const scaleY = (svgHeight - padding * 2) / diagramHeight;
      let fitScale = Math.min(scaleX, scaleY);

      // Cap at current zoom so we don't zoom IN unnecessarily
      const currentScale = (d3 as any).zoomTransform(svgEl).k;
      fitScale = Math.min(fitScale, Math.max(currentScale, 1.0));

      // Respect the minimum zoom extent
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

  public deleteSelection(recordHistory: boolean = true): void {
    let changed = false;
    if (this.selectedNodeIds.length) {
      const selected = new Set(this.selectedNodeIds);

      if (recordHistory) {
        // Create a composite command or multiple commands
        [...selected].forEach(id => {
          this.undoManager.push(new RemoveNodeCommand(this, id));
        });
      }

      this.placedNodes = this.placedNodes.filter((n) => !selected.has(n.id));
      this.connections = this.connections.filter(
        (c) => !selected.has(c.sourceNodeId) && !selected.has(c.targetNodeId)
      );

      // Clean up visual groups containing any of these nodes
      this.visualGroups = this.visualGroups.filter(g => {
        return ![...selected].some(id => g.nodeIds.includes(id));
      });

      this.selectedNodeIds = [];
      changed = true;
      this.eventManager.trigger("node:deleted", { ids: [...selected] });
    }
    if (this.selectedEdgeIds.length) {
      const selectedE = new Set(this.selectedEdgeIds);

      if (recordHistory) {
        [...selectedE].forEach(id => {
          const edge = this.connections.find(e => e.id === id);
          if (edge) {
            this.undoManager.push(new RemoveEdgeCommand(this, { ...edge }));
          }
        });
      }

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
   * Creates a shape on the canvas by starting the placement operation.
   * @param shapeType - Type of shape ('rectangle', 'circle', 'rhombus').
   * @param id - Shape variant id from config (e.g. 'task0').
   * @param data - Optional initial data
   */
  createShape(shapeType: string, id: string, data?: any): void {
    const shapeList = this.config.shapes.default?.[shapeType as keyof typeof this.config.shapes.default] ?? [];
    if (!shapeList.length) {
      console.error(`No shapes found for type "${shapeType}".`);
      return;
    }
    const shapeToFind = shapeList.find((shape: Shape) => shape.id === id);
    if (!shapeToFind) {
      console.error(`Shape ID "${id}" not found in type "${shapeType}".`);
      return;
    }

    // Delegate to the new, namespaced startPlacement
    this.startPlacement(shapeType, shapeToFind.id);
  }

  /**
   * Places a shape immediately at the given canvas coordinates.
   * Internal common logic for Drop and DblClick placement.
   */
  public placeShapeAt(shapeType: string, variantId: string, x: number, y: number, data?: any): PlacedNode | undefined {
    const shapeList = this.config.shapes.default?.[shapeType as keyof typeof this.config.shapes.default] ?? [];
    const shapeToFind = shapeList.find((shape: Shape) => shape.id === variantId);
    if (!shapeToFind) return undefined;

    const newNode: PlacedNode = {
      id: generatePlacedNodeId(),
      type: shapeType,
      shapeVariantId: variantId,
      x: isNaN(x) ? 0 : x,
      y: isNaN(y) ? 0 : y,
      rotation: 0,
      width: shapeToFind.width,
      height: shapeToFind.height,
      radius: shapeToFind.radius,
      content: data?.content ?? { layout: "text-only", items: [] },
      meta: {},
      visualState: { status: "idle" }
    };

    this.placeNode(newNode);
  }

  /**
   * Places a shape at a safe, non-overlapping position within the current viewport.
   * Useful for double-click placement.
   */
  public placeShapeAtSafePos(shapeType: string, variantId: string, data?: any): void {
    const shapeList = this.config.shapes.default?.[shapeType as keyof typeof this.config.shapes.default] ?? [];
    const style = shapeList.find((shape: Shape) => shape.id === variantId);
    if (!style) return;

    // Determine dimensions to check for collision
    const renderer = this.shapeRegistry.get(shapeType);
    const mockNode: PlacedNode = { id: 'temp', type: shapeType, shapeVariantId: variantId, x: 0, y: 0, meta: {} };
    const resolved = buildResolvedShapeConfig(mockNode, style);
    const bounds = renderer.getBounds(resolved);

    // Get current viewport center in canvas coordinates
    const transform = d3.zoomTransform(this.svg.node() as Element);
    const width = this.container?.clientWidth || 800;
    const height = this.container?.clientHeight || 600;

    const centerX = (width / 2 - transform.x) / transform.k;
    const centerY = (height / 2 - transform.y) / transform.k;

    // Search for a safe position in a spiral/grid pattern from center
    const step = 20;
    let found = false;
    let finalX = centerX;
    let finalY = centerY;

    // Spiral search pattern
    let x = 0, y = 0, dx = 0, dy = -1;
    const maxIters = 400; // Search up to 20x20 grid cells
    for (let i = 0; i < maxIters; i++) {
      const candidateX = centerX + x * step;
      const candidateY = centerY + y * step;

      const overlaps = this.placedNodes.some(n => {
        const nStyle = this.getShapeStyle(n);
        if (!nStyle) return false;
        const nResolved = buildResolvedShapeConfig(n, nStyle);
        const nBounds = this.shapeRegistry.get(n.type).getBounds(nResolved);

        const nL = n.x + nBounds.x, nR = nL + nBounds.width;
        const nT = n.y + nBounds.y, nB = nT + nBounds.height;

        const cL = candidateX + bounds.x, cR = cL + bounds.width;
        const cT = candidateY + bounds.y, cB = cT + bounds.height;

        return !(cR < nL || cL > nR || cB < nT || cT > nB);
      });

      if (!overlaps) {
        finalX = candidateX;
        finalY = candidateY;
        found = true;
        break;
      }

      if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
        const tmp = dx;
        dx = -dy;
        dy = tmp;
      }
      x += dx;
      y += dy;
    }

    this.placeShapeAt(shapeType, variantId, finalX, finalY, data);
  }

  /**
   * Handles native drag-and-drop events to place shapes on the canvas.
   */
  public handleDrop(event: DragEvent): void {
    event.preventDefault();
    const dataStr = event.dataTransfer?.getData("application/zenode-shape");
    if (!dataStr) return;

    try {
      const { type, id } = JSON.parse(dataStr);
      const pt = this.getCanvasPoint(event as unknown as MouseEvent);
      this.placeShapeAt(type, id, pt.x, pt.y);
    } catch (e) {
      console.error("Invalid Zenode drop data", e);
    }
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
   * Updates the content (text, icon, layout) of a placed node.
   * Immutably merges the patch and re-renders.
   */
  updateNodeContent(id: string, content: import("../types/index.js").NodeContent, recordHistory: boolean = true): void {
    const node = this.placedNodes.find(n => n.id === id);
    if (!node) return;

    if (recordHistory) {
      this.undoManager.push(new UpdateNodeCommand(this, id, { ...node }, { ...node, content }));
    }

    this.placedNodes = this.placedNodes.map((n) =>
      n.id === id ? { ...n, content } : n
    );
    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
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

    // Attach robust window-level cleanup listener
    if (this.onWindowMouseUp) {
      window.removeEventListener("mouseup", this.onWindowMouseUp);
    }
    this.onWindowMouseUp = () => {
      const snapped = this.connectionDragContext?.snapped;
      this.endConnectionDrag(snapped?.nodeId, snapped?.portId);
    };

    if (this.onWindowMouseMove) {
      window.removeEventListener("mousemove", this.onWindowMouseMove);
    }
    this.onWindowMouseMove = (e: MouseEvent) => {
      const currentPoint = this.getCanvasPoint(e);
      this.updateConnectionDrag(currentPoint);
    };

    window.addEventListener("mouseup", this.onWindowMouseUp);
    window.addEventListener("mousemove", this.onWindowMouseMove);

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
      const sourceId = this.connectionDragContext?.sourceNodeId;
      if (node.id === sourceId) continue;

      // Block internal member snapping if source is a group
      if (sourceId?.startsWith("vgroup-")) {
        const group = this.visualGroups.find(g => g.id === sourceId);
        if (group && group.nodeIds.includes(node.id)) continue;
      }
      // ... and vice versa
      if (!sourceId?.startsWith("vgroup-") && sourceId !== node.id) {
        const group = this.visualGroups.find(g => g.nodeIds.includes(node.id));
        if (group && group.id === sourceId) continue;
      }

      const style = this.getShapeStyle(node);
      if (!style) continue;
      const renderer = this.shapeRegistry.get(node.type);
      const resolved = buildResolvedShapeConfig(node, style);
      const ports = renderer.getPorts(resolved);

      const rotation = (node.rotation || 0) * (Math.PI / 180);
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      for (const [portId, pos] of Object.entries(ports)) {
        const p = pos as { x: number; y: number };
        const rotatedX = p.x * cos - p.y * sin;
        const rotatedY = p.x * sin + p.y * cos;
        const absX = node.x + rotatedX;
        const absY = node.y + rotatedY;
        const dist = Math.hypot(point.x - absX, point.y - absY);
        if (dist < bestDist) {
          bestDist = dist;
          result = { nodeId: node.id, portId, point: { x: absX, y: absY } };
        }
      }
    }

    // Snap to group ports
    for (const group of this.visualGroups) {
      if (group.id === this.connectionDragContext?.sourceNodeId) continue;
      const ports = this.getGroupPorts(group.id);
      if (!ports) continue;

      for (const [portId, pos] of Object.entries(ports)) {
        const dist = Math.hypot(point.x - pos.x, point.y - pos.y);
        if (dist < bestDist) {
          bestDist = dist;
          result = { nodeId: group.id, portId, point: pos };
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
      if (finalTargetNodeId === this.connectionDragContext.sourceNodeId) {
          console.warn("[ZENODE] Blocked self-connection");
      } else {
        this.createConnectionFromPorts(
          this.connectionDragContext.sourceNodeId,
          this.connectionDragContext.sourcePortId,
          finalTargetNodeId,
          finalTargetPortId,
          true
        );
      }
    }

    this.connectionDragContext = null;
    if (this.onWindowMouseUp) {
      window.removeEventListener("mouseup", this.onWindowMouseUp);
      this.onWindowMouseUp = null;
    }
    if (this.onWindowMouseMove) {
      window.removeEventListener("mousemove", this.onWindowMouseMove);
      this.onWindowMouseMove = null;
    }

    if (this.canvasObject.placedNodes) {
      renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
    }
    this.cleanupGhostConnection();
    this.eventManager.trigger("connection:dragend", {});
  }

  private cleanupGhostConnection(): void {
    if (this.canvasObject.ghostConnection) {
      this.canvasObject.ghostConnection.selectAll("*").remove();
    }
  }

  public createConnectionFromPorts(
    sourceNodeId: string,
    sourcePortId: string,
    targetNodeId: string,
    targetPortId: string,
    recordHistory: boolean = true
  ): void {
    const allowMultiple = this.config.canvasProperties.allowMultipleConnections;

    // Block internal group-to-member connections
    const sourceG = sourceNodeId.startsWith("vgroup-");
    const targetG = targetNodeId.startsWith("vgroup-");
    if (sourceG !== targetG) {
      const gid = sourceG ? sourceNodeId : targetNodeId;
      const nid = sourceG ? targetNodeId : sourceNodeId;
      const group = this.visualGroups.find(g => g.id === gid);
      if (group && group.nodeIds.includes(nid)) {
        console.warn("[ZENODE] Blocked internal group connection");
        return;
      }
    }

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

    if (recordHistory) {
      this.undoManager.push(new AddEdgeCommand(this, { ...connection }));
    }

    this.reRenderConnections();
    this.eventManager.trigger("connection:created", { connection });
  }

  private renderGhostConnection(): void {
    if (!this.connectionDragContext || !this.canvasObject.ghostConnection) return;

    const sourceId = this.connectionDragContext!.sourceNodeId;
    let from: { x: number, y: number } | null = null;

    if (sourceId.startsWith("vgroup-")) {
      const ports = this.getGroupPorts(sourceId);
      from = ports?.[this.connectionDragContext!.sourcePortId] || null;
    } else {
      const sourceNode = this.placedNodes.find(n => n.id === sourceId);
      if (sourceNode) {
        const style = this.getShapeStyle(sourceNode);
        if (style) {
          const renderer = this.shapeRegistry.get(sourceNode.type);
          const resolved = buildResolvedShapeConfig(sourceNode, style);
          const ports = renderer.getPorts(resolved);
          const portPos = ports[this.connectionDragContext!.sourcePortId];
          if (portPos) {
            const rotation = (sourceNode.rotation || 0) * (Math.PI / 180);
            const cos = Math.cos(rotation);
            const sin = Math.sin(rotation);
            const rotatedX = portPos.x * cos - portPos.y * sin;
            const rotatedY = portPos.x * sin + portPos.y * cos;
            from = { x: sourceNode.x + rotatedX, y: sourceNode.y + rotatedY };
          }
        }
      }
    }

    if (!from) return;

    const to = this.connectionDragContext.snapped
      ? this.connectionDragContext.snapped.point
      : this.connectionDragContext.currentPoint;

    renderGhostLine(
      this.canvasObject.ghostConnection!,
      from,
      to,
      this.config.canvasProperties.ghostConnection,
      this.activeConnectionType,
      this.connectionDragContext?.sourcePortId,
      this.connectionDragContext?.snapped?.portId
    );
  }

  public getGroupPorts(groupId: string, overrideNodes?: Map<string, PlacedNode>): Record<string, { x: number, y: number }> | null {
    const b = this.getGroupBounds(groupId, overrideNodes);
    if (!b) return null;
    return {
      "nw": { x: b.x, y: b.y },
      "n": { x: b.x + b.width / 2, y: b.y },
      "ne": { x: b.x + b.width, y: b.y },
      "e": { x: b.x + b.width, y: b.y + b.height / 2 },
      "se": { x: b.x + b.width, y: b.y + b.height },
      "s": { x: b.x + b.width / 2, y: b.y + b.height },
      "sw": { x: b.x, y: b.y + b.height },
      "w": { x: b.x, y: b.y + b.height / 2 }
    };
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
      if (
        target?.closest("g.placed-node") ||
        target?.closest("g.visual-group-boundary")
      )
        return;
      this.clearSelection();
      this.connectionModeEnabled = false;
      this.rotationModeEnabled = false;
      this.resizeModeEnabled = false;
      if (this.canvasObject.ghostConnection) {
        this.canvasObject.ghostConnection.selectAll("*").remove();
      }
      if (this.canvasObject.placedNodes) {
        renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this as any);
      }
    });

    // Lasso multi-select.
    this.svg.on("mousedown.lasso", (event: MouseEvent) => {
      if (!this.lassoEnabled) return;
      if (!this.config.canvasProperties.lassoStyle.enabled) return;
      if (this.placementContext) return;
      if (event.button !== 0) return;
      const target = event.target as Element | null;
      if (
        target?.closest("g.placed-node") ||
        target?.closest("g.visual-group-boundary")
      )
        return;

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
  data?: any
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
