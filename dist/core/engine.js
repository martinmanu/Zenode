import { drawCanvas, lockedCanvas } from '../components/canvas/canvas.js';
import { updateGridTransform, drawGrid, toggleGrid } from '../components/canvas/grid.js';
import { EventManager } from './eventManager.js';
import { ZoomManager } from './zoom_PanManager.js';
import { svgMouseMove } from '../events/mouseMove.js';
import { svgMouseClick } from '../events/mouseClick.js';
import { renderPlacedNodes } from '../nodes/placement.js';
import { renderConnections } from '../connections/render.js';
import { ShapeRegistry } from '../nodes/registry.js';
import { RectangleRenderer } from '../nodes/shapes/rectangle.js';
import { CircleRenderer } from '../nodes/shapes/circle.js';
import { RhombusRenderer } from '../nodes/shapes/rhombus.js';
import { SemicircleRenderer } from '../nodes/shapes/semicircle.js';
import { PentagonRenderer } from '../nodes/shapes/pentagon.js';
import { OctagonRenderer } from '../nodes/shapes/octagon.js';
import { StarRenderer } from '../nodes/shapes/star.js';
import { OvalRenderer } from '../nodes/shapes/oval.js';
import { TriangleRenderer } from '../nodes/shapes/triangle.js';
import { TrapezoidRenderer } from '../nodes/shapes/trapezoid.js';
import { ParallelogramRenderer } from '../nodes/shapes/parallelogram.js';
import { KiteRenderer } from '../nodes/shapes/kite.js';
import { HexagonRenderer } from '../nodes/shapes/hexagon.js';
import { HeptagonRenderer } from '../nodes/shapes/heptagon.js';
import { NonagonRenderer } from '../nodes/shapes/nonagon.js';
import { DecagonRenderer } from '../nodes/shapes/decagon.js';
import { LicenseManager } from './license.js';
import { SmartRouter } from '../connections/routing/smartRouter.js';
import { buildResolvedShapeConfig } from '../nodes/overlay.js';
import { mergeConfig } from '../utils/configMerger.js';
import * as d3 from 'd3';
import { snapToGrid } from '../utils/helpers.js';
import { ContextPadRegistry } from '../contextpad/registry.js';
import { ContextPadRenderer } from '../contextpad/renderer.js';
import { defaultActions } from '../contextpad/defaults.js';

// src/core/engine.ts
class ZenodeEngine {
    constructor(container, config) {
        this.shapeMap = new Map();
        this.shapes = new Map();
        this.connections = [];
        /** Placed nodes on the canvas. Source of truth for g.placed-nodes layer. */
        this.placedNodes = [];
        /** Selected node ids (single or multi-select). */
        this.selectedNodeIds = [];
        /** Selected edge ids (single or multi-select). */
        this.selectedEdgeIds = [];
        /** Controls whether lasso interaction is active on canvas background drag. */
        this.lassoEnabled = true;
        /** Prevents background click handler from clearing selection right after lasso mouseup. */
        this.suppressNextCanvasClick = false;
        /** When set, next click will place a node of this type/config (preview → placed). */
        this.placementContext = null;
        /** When set, a connection is being dragged from this port. */
        this.connectionDragContext = null;
        this.connectionModeEnabled = false;
        this.rotationModeEnabled = false;
        this.resizeModeEnabled = false;
        this.licenseManager = new LicenseManager();
        this.smartRouter = new SmartRouter();
        this.smartRoutingEnabled = false;
        this.activeConnectionType = "straight";
        this.canvasObject = {
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
        this.activeOperation = null;
        this.container = container;
        this.config = mergeConfig(config);
        this.shapeRegistry = new ShapeRegistry();
        this.registerBuiltInShapes();
        this.eventManager = new EventManager();
        this.contextPadRegistry = new ContextPadRegistry();
        this.initializeCanvas();
        this.initializeContextPad();
        this.emit("engine:ready", { version: "1.5.0" });
    }
    initializeContextPad() {
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
    isConnectionModeEnabled() {
        return this.connectionModeEnabled;
    }
    // --- External API for Context Pad ---
    registerContextPadAction(action) {
        this.contextPadRegistry.register(action);
    }
    unregisterContextAction(id) {
        this.contextPadRegistry.unregister(id);
    }
    /**
     * Listens to engine events (including context pad events).
     */
    on(eventType, callback) {
        this.eventManager.on(eventType, callback);
    }
    /**
     * Manually shows the context pad for a specific target.
     */
    showContextPad(target) {
        if (this.contextPadRenderer) {
            const actions = this.contextPadRegistry.getActionsFor(target, this);
            this.contextPadRenderer.render(target, actions, this);
        }
    }
    /**
     * Updates canvas dimensions without a full re-render.
     */
    resizeCanvas(width, height) {
        this.config.canvas.width = width;
        this.config.canvas.height = height;
        if (this.svg) {
            // Fluid infinite layout doesn't need fixed dimensions or viewBox
            // But we re-sync the grid transform to make sure pattern offset is still happy
            const transform = d3.zoomTransform(this.svg.node());
            updateGridTransform(this.svg, transform);
        }
    }
    updateConfig(newConfig) {
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
                renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
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
    hideContextPad() {
        if (this.contextPadRenderer) {
            this.contextPadRenderer.hide(this);
        }
    }
    beginOperation(nodeId, type) {
        const node = this.placedNodes.find(n => n.id === nodeId);
        if (node) {
            this.activeOperation = {
                type,
                nodeId,
                originalData: JSON.parse(JSON.stringify(node))
            };
            this.refreshNodes();
        }
    }
    endOperation() {
        if (this.activeOperation) {
            this.activeOperation = null;
            this.refreshNodes();
        }
    }
    getActiveOperation() {
        return this.activeOperation;
    }
    emit(eventType, event) {
        this.eventManager.trigger(eventType, event);
    }
    initDrag() {
        // Modify existing drag handler to update pad
        // Assuming d3.drag is set up in a way we can hook into
        // I need to see where initDrag or similar is.
    }
    registerBuiltInShapes() {
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
    registerShape(name, renderer) {
        this.shapeRegistry.register(name, renderer);
    }
    initializeCanvas() {
        this.canvasObject = drawCanvas(this.container ? `#${this.container.id}` : "body", this.config.canvas);
        this.svg = this.canvasObject.svg;
        this.svg.attr("data-lasso-enabled", "false");
        this.activeConnectionType = this.config.connections.defaultType || "straight";
        this.grid = drawGrid(this.svg, this.config.canvas, this.canvasObject.grid);
        this.alignmentLine = this.svg.append("g").attr("class", "alignment-line");
        this.canvasContainerGroup = this.canvasObject.canvasContainer;
        this.zoomManager = new ZoomManager(this.canvasContainerGroup, this.svg, this.config, (eventType, event) => {
            var _a;
            if (eventType === "zoom") {
                (_a = this.contextPadRenderer) === null || _a === void 0 ? void 0 : _a.updatePosition(this);
            }
            this.eventManager.trigger(eventType, event);
        });
        this.bindSelectionInteractions();
    }
    /** SVG root DOM node — passed to DragApi for correct pointer coordinate transform */
    get svgNode() {
        return this.svg.node();
    }
    /** Returns current placement context (shape type + config for next click). */
    getPlacementContext() {
        return this.placementContext;
    }
    /** Sets placement context so the next canvas click places a node of this type/config. */
    setPlacementContext(shapeType, shapeConfig) {
        this.placementContext = { shapeType, shapeConfig };
    }
    /** Clears placement context (e.g. after placing or cancel). */
    clearPlacementContext() {
        this.placementContext = null;
    }
    // --- PHASE 3.1: PUBLIC NODE API ---
    /**
     * Programmatically adds a node to the canvas.
     * @param config Partial configuration for the new node.
     * @returns The ID of the created node.
     */
    addNode(config) {
        const id = config.id || this.generateId();
        const newNode = {
            id,
            type: config.type,
            shapeVariantId: config.shapeVariantId,
            x: config.x,
            y: config.y,
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
        this.emit("node:placed", { node: newNode });
        return id;
    }
    /**
     * Removes a node and its associated connections.
     */
    removeNode(id) {
        // 1. Remove associated connections
        this.connections = this.connections.filter(c => c.sourceNodeId !== id && c.targetNodeId !== id);
        this.reRenderConnections();
        // 2. Remove from selection
        this.selectedNodeIds = this.selectedNodeIds.filter(sid => sid !== id);
        // 3. Remove node
        const deletedNode = this.placedNodes.find(n => n.id === id);
        this.placedNodes = this.placedNodes.filter(n => n.id !== id);
        this.refreshNodes();
        this.emit("node:deleted", { id, node: deletedNode });
    }
    /**
     * Updates an existing node's properties.
     */
    updateNode(id, patch) {
        const idx = this.placedNodes.findIndex(n => n.id === id);
        if (idx === -1)
            return;
        this.placedNodes[idx] = Object.assign(Object.assign(Object.assign({}, this.placedNodes[idx]), patch), { id // Ensure ID cannot be changed via update
         });
        this.refreshNodes();
        this.emit("node:updated", { id, patch, node: this.placedNodes[idx] });
    }
    /**
     * Retrieves a node's full state.
     */
    getNode(id) {
        const node = this.placedNodes.find(n => n.id === id);
        return node ? Object.assign({}, node) : null;
    }
    /**
     * Returns all nodes currently on the canvas.
     */
    getAllNodes() {
        return this.placedNodes.map(n => (Object.assign({}, n)));
    }
    /**
     * Clones a node with a slight offset.
     */
    duplicateNode(id) {
        const source = this.getNode(id);
        if (!source)
            return "";
        const offset = 20;
        return this.addNode(Object.assign(Object.assign({}, source), { id: undefined, x: source.x + offset, y: source.y + offset }));
    }
    /** Helper to trigger node layer re-render */
    refreshNodes() {
        if (this.canvasObject.placedNodes) {
            renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
        }
    }
    // --- PHASE 3.2: PUBLIC EDGE/CONNECTION API ---
    /**
     * Programmatically creates a connection between two nodes.
     * @returns The ID of the created connection.
     */
    addEdge(config) {
        const id = config.id || this.generateId();
        const newEdge = {
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
        this.emit("edge:created", { edge: newEdge });
        return id;
    }
    /**
     * Removes a connection by ID.
     */
    removeEdge(id) {
        const deletedEdge = this.connections.find(c => c.id === id);
        this.connections = this.connections.filter(c => c.id !== id);
        this.reRenderConnections();
        this.emit("edge:deleted", { id, edge: deletedEdge });
    }
    /**
     * Returns a specific connection's state.
     */
    getEdge(id) {
        const edge = this.connections.find(c => c.id === id);
        return edge ? Object.assign({}, edge) : null;
    }
    /**
     * Returns all connections on the canvas.
     */
    getAllEdges() {
        return this.connections.map(c => (Object.assign({}, c)));
    }
    /**
     * Programmatically triggers the text editor for a node or edge.
     */
    beginLabelEdit(id, kind) {
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
    generateId() {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'node-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    }
    /** Removes mousemove and click handlers used for placement; stops preview. */
    removePlacementListeners() {
        this.svg.on("mousemove", null);
        this.svg.on("click", null);
    }
    /** Returns selected node ids. */
    getSelectedNodeIds() {
        return [...this.selectedNodeIds];
    }
    /** Returns whether a connection is currently being drawn. */
    isDrawingConnection() {
        return this.connectionDragContext !== null;
    }
    /** Sets whether connection drawing mode is enabled. */
    setLicense(key) {
        this.licenseManager.setLicense(key);
        this.reRenderConnections();
    }
    setSmartRoutingEnabled(enabled) {
        this.smartRoutingEnabled = enabled;
        this.reRenderConnections();
    }
    getLicenseTier() {
        return this.licenseManager.getTier();
    }
    isSmartRoutingEnabled() {
        return this.smartRoutingEnabled && this.licenseManager.isPro();
    }
    setConnectionModeEnabled(enabled) {
        if (enabled) {
            this.rotationModeEnabled = false;
            this.resizeModeEnabled = false;
        }
        this.connectionModeEnabled = enabled;
        if (this.canvasObject.placedNodes) {
            renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
        }
        this.eventManager.trigger("connection:mode:changed", { enabled });
    }
    isRotationModeEnabled() {
        return this.rotationModeEnabled;
    }
    setRotationModeEnabled(enabled) {
        if (enabled) {
            this.connectionModeEnabled = false;
            this.resizeModeEnabled = false;
        }
        this.rotationModeEnabled = enabled;
        if (this.canvasObject.placedNodes) {
            renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
        }
        this.eventManager.trigger("rotation:mode:changed", { enabled });
    }
    isResizeModeEnabled() {
        return this.resizeModeEnabled;
    }
    setResizeModeEnabled(enabled) {
        if (enabled) {
            this.connectionModeEnabled = false;
            this.rotationModeEnabled = false;
        }
        this.resizeModeEnabled = enabled;
        if (this.canvasObject.placedNodes) {
            renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
        }
        this.eventManager.trigger("resize:mode:changed", { enabled });
    }
    /** Sets the active connection type for newly created connections. */
    setActiveConnectionType(type) {
        this.activeConnectionType = type;
    }
    /** Sets selected node ids and re-renders selection rings. */
    setSelectedNodeIds(ids) {
        var _a;
        this.selectedNodeIds = [...new Set(ids)];
        if (this.canvasObject.placedNodes) {
            renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
        }
        // Show context pad if exactly one node is selected
        if (this.selectedNodeIds.length === 1) {
            const node = this.placedNodes.find((n) => n.id === this.selectedNodeIds[0]);
            if (node) {
                const actions = this.contextPadRegistry.getActionsFor({ kind: "node", id: node.id, data: node }, this);
                this.contextPadRenderer.render({ kind: "node", id: node.id, data: node }, actions, this);
            }
        }
        else if (this.selectedEdgeIds.length !== 1) {
            (_a = this.contextPadRenderer) === null || _a === void 0 ? void 0 : _a.hide(this);
        }
        this.eventManager.trigger("node:selected", { ids: this.getSelectedNodeIds() });
    }
    /** Returns selected edge ids. */
    getSelectedEdgeIds() {
        return [...this.selectedEdgeIds];
    }
    /** Sets selected edge ids and re-renders selection state. */
    setSelectedEdgeIds(ids) {
        var _a;
        this.selectedEdgeIds = [...new Set(ids)];
        this.reRenderConnections();
        if (this.selectedEdgeIds.length === 1) {
            const edge = this.connections.find((e) => e.id === this.selectedEdgeIds[0]);
            if (edge) {
                const actions = this.contextPadRegistry.getActionsFor({ kind: "edge", id: edge.id, data: edge }, this);
                this.contextPadRenderer.render({ kind: "edge", id: edge.id, data: edge }, actions, this);
            }
        }
        else if (this.selectedNodeIds.length !== 1) {
            (_a = this.contextPadRenderer) === null || _a === void 0 ? void 0 : _a.hide(this);
        }
        this.eventManager.trigger("edge:selected", { ids: this.getSelectedEdgeIds() });
    }
    /** Clears all selections. */
    clearSelection() {
        if (this.selectedNodeIds.length) {
            this.setSelectedNodeIds([]);
        }
        if (this.selectedEdgeIds.length) {
            this.setSelectedEdgeIds([]);
        }
    }
    /** Enable/disable lasso selection interaction. */
    setLassoEnabled(enabled) {
        var _a;
        this.lassoEnabled = enabled;
        const style = this.config.canvasProperties.lassoStyle;
        const cursor = enabled && style.enabled ? style.cursor : "default";
        this.svg.attr("data-lasso-enabled", enabled && style.enabled ? "true" : "false");
        this.svg.style("cursor", cursor);
        if (!enabled) {
            (_a = this.canvasObject.lasso) === null || _a === void 0 ? void 0 : _a.selectAll("*").remove();
        }
    }
    isLassoEnabled() {
        return this.lassoEnabled;
    }
    /**
     * Places a node on the canvas: appends to state and re-renders g.placed-nodes.
     * @param node - Node to place (id must be unique; use generatePlacedNodeId() if creating new).
     */
    placeNode(node) {
        this.placedNodes = [...this.placedNodes, node];
        if (this.canvasObject.placedNodes) {
            renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
        }
        this.eventManager.trigger("node:placed", { node });
    }
    /** Returns a copy of the current placed nodes (immutable). */
    getPlacedNodes() {
        return [...this.placedNodes];
    }
    /** Returns a single placed node by id. */
    getPlacedNode(id) {
        return this.placedNodes.find((n) => n.id === id);
    }
    /**
     * Updates a placed node's position and triggers sub-renders.
     */
    updateNodePosition(id, x, y) {
        var _a;
        this.placedNodes = this.placedNodes.map((n) => (n.id === id ? Object.assign(Object.assign({}, n), { x, y }) : n));
        // Re-render nodes (this might be handled by the renderer d3 join,
        // but we need to ensure connections follow)
        if (this.canvasObject.connections) {
            this.reRenderConnections();
        }
        // Update context pad position if one of the selected nodes is moved
        if (this.selectedNodeIds.includes(id)) {
            (_a = this.contextPadRenderer) === null || _a === void 0 ? void 0 : _a.updatePosition(this);
        }
        this.refreshNodes();
        this.eventManager.trigger("node:moved", { id, x, y });
    }
    /**
     * Updates a node's rotation.
     */
    rotateNode(id, rotation) {
        this.placedNodes = this.placedNodes.map((n) => (n.id === id ? Object.assign(Object.assign({}, n), { rotation }) : n));
        if (this.canvasObject.placedNodes) {
            renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
        }
        this.reRenderConnections();
        // Update context pad position during rotation
        if (this.contextPadRenderer && this.selectedNodeIds.includes(id)) {
            this.contextPadRenderer.updatePosition(this);
        }
        this.eventManager.trigger("node:rotated", { id, rotation });
    }
    /**
     * Updates a node's dimensions (width/height or radius).
     */
    updateNodeDimensions(id, dimensions) {
        this.placedNodes = this.placedNodes.map((n) => {
            var _a, _b, _c, _d;
            if (n.id !== id)
                return n;
            // Capture original dimensions on first resize
            const baseDimensions = (_a = n.baseDimensions) !== null && _a !== void 0 ? _a : {
                width: n.width,
                height: n.height,
                radius: n.radius,
            };
            return Object.assign(Object.assign({}, n), { baseDimensions, width: (_b = dimensions.width) !== null && _b !== void 0 ? _b : n.width, height: (_c = dimensions.height) !== null && _c !== void 0 ? _c : n.height, radius: (_d = dimensions.radius) !== null && _d !== void 0 ? _d : n.radius });
        });
        if (this.canvasObject.placedNodes) {
            renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
        }
        this.reRenderConnections();
        // Update context pad position during resize
        if (this.contextPadRenderer && this.selectedNodeIds.includes(id)) {
            this.contextPadRenderer.updatePosition(this);
        }
        this.eventManager.trigger("node:resized", { id, dimensions });
    }
    zoomIn() {
        this.zoomManager.zoomBy(this.svg, 1.2);
    }
    zoomOut() {
        this.zoomManager.zoomBy(this.svg, 0.8);
    }
    focusOnNode(id) {
        var _a, _b, _c, _d;
        const node = this.placedNodes.find(n => n.id === id);
        if (node) {
            const style = this.getShapeStyle(node);
            const width = (_b = (_a = node.width) !== null && _a !== void 0 ? _a : style === null || style === void 0 ? void 0 : style.width) !== null && _b !== void 0 ? _b : 100;
            const height = (_d = (_c = node.height) !== null && _c !== void 0 ? _c : style === null || style === void 0 ? void 0 : style.height) !== null && _d !== void 0 ? _d : 100;
            const centerX = node.x + width / 2;
            const centerY = node.y + height / 2;
            this.zoomManager.centerOn(this.svg, { x: centerX, y: centerY });
        }
    }
    focusOnSelectedNode() {
        if (this.selectedNodeIds.length > 0) {
            this.focusOnNode(this.selectedNodeIds[0]);
        }
        else if (this.placedNodes.length > 0) {
            // Focus on the center of all nodes AND zoom to fit if needed
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            this.placedNodes.forEach(n => {
                var _a, _b, _c, _d;
                const style = this.getShapeStyle(n);
                const w = (_b = (_a = n.width) !== null && _a !== void 0 ? _a : style === null || style === void 0 ? void 0 : style.width) !== null && _b !== void 0 ? _b : 100;
                const h = (_d = (_c = n.height) !== null && _c !== void 0 ? _c : style === null || style === void 0 ? void 0 : style.height) !== null && _d !== void 0 ? _d : 100;
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
            const svgEl = this.svg.node();
            const rect = svgEl.getBoundingClientRect();
            const svgWidth = rect.width || 800;
            const svgHeight = rect.height || 500;
            // Calculate the scale to fit everything with padding
            const padding = 60;
            const scaleX = (svgWidth - padding * 2) / diagramWidth;
            const scaleY = (svgHeight - padding * 2) / diagramHeight;
            let fitScale = Math.min(scaleX, scaleY);
            // Cap at current zoom so we don't zoom IN unnecessarily
            const currentScale = d3.zoomTransform(svgEl).k;
            fitScale = Math.min(fitScale, Math.max(currentScale, 1.0));
            // Respect the minimum zoom extent
            const minExtent = this.zoomManager.config.canvasProperties.zoomExtent[0];
            fitScale = Math.max(fitScale, minExtent);
            this.zoomManager.centerOn(this.svg, { x: centerX, y: centerY }, fitScale);
        }
    }
    panBy(dx, dy) {
        if (this.zoomManager) {
            this.zoomManager.panBy(this.svg, dx, dy);
        }
    }
    deleteSelection() {
        let changed = false;
        if (this.selectedNodeIds.length) {
            const selected = new Set(this.selectedNodeIds);
            this.placedNodes = this.placedNodes.filter((n) => !selected.has(n.id));
            this.connections = this.connections.filter((c) => !selected.has(c.sourceNodeId) && !selected.has(c.targetNodeId));
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
                renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
            }
            this.reRenderConnections();
        }
    }
    reRenderConnections() {
        if (this.canvasObject.connections) {
            renderConnections(this.canvasObject.connections, this.connections, this.placedNodes, this);
        }
    }
    /**
     * Converts a mouse event to canvas coordinates (with optional grid snap).
     * Used for placement and hit-testing.
     */
    getCanvasPoint(event) {
        var _a, _b;
        const gridSize = (_b = (_a = this.config.canvas.grid) === null || _a === void 0 ? void 0 : _a.gridSize) !== null && _b !== void 0 ? _b : 20;
        const zoomTransform = d3.zoomTransform(this.svg.node());
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
    createShape(shapeType, id, data) {
        var _a, _b;
        const shapeList = (_b = (_a = this.config.shapes.default) === null || _a === void 0 ? void 0 : _a[shapeType]) !== null && _b !== void 0 ? _b : [];
        if (!shapeList.length) {
            console.error(`No shapes found for type "${shapeType}".`);
            return;
        }
        const shapeToFind = shapeList.find((shape) => shape.id === id);
        if (!shapeToFind) {
            console.error(`Shape ID "${id}" not found in type "${shapeType}".`);
            return;
        }
        this.removePlacementListeners();
        this.setPlacementContext(shapeType, shapeToFind);
        this.svg.on("mousemove", (event) => svgMouseMove(event, shapeType, shapeToFind, this.grid, this.config, this.canvasObject, data, this.shapeRegistry));
        this.svg.on("click", (event) => svgMouseClick(event, this));
    }
    /**
     * Creates a connection between two placed nodes by their node ids.
     * (Full connector UI is Phase 2; this records the connection in state.)
     * @param sourceNodeId - Placed node id (from getPlacedNodes()[i].id).
     * @param targetNodeId - Placed node id.
     */
    createConnection(sourceNodeId, targetNodeId) {
        const fromExists = this.placedNodes.some((n) => n.id === sourceNodeId);
        const toExists = this.placedNodes.some((n) => n.id === targetNodeId);
        if (!fromExists || !toExists) {
            console.warn(`One or both nodes do not exist. Use getPlacedNodes() to get valid node ids.`);
            return;
        }
        const connection = {
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
            renderConnections(this.canvasObject.connections, this.connections, this.placedNodes);
        }
        this.eventManager.trigger("connection:created", { connection });
    }
    /**
     * Updates a node's visual state without mutating geometry/state in place.
     */
    updateNodeVisualState(id, patch) {
        this.placedNodes = this.placedNodes.map((n) => {
            var _a, _b, _c, _d;
            if (n.id !== id)
                return n;
            const mergedEffects = Object.assign(Object.assign({}, ((_b = (_a = n.visualState) === null || _a === void 0 ? void 0 : _a.effects) !== null && _b !== void 0 ? _b : {})), ((_c = patch.effects) !== null && _c !== void 0 ? _c : {}));
            return Object.assign(Object.assign({}, n), { visualState: Object.assign(Object.assign(Object.assign({}, ((_d = n.visualState) !== null && _d !== void 0 ? _d : {})), patch), { effects: mergedEffects }) });
        });
        if (this.canvasObject.placedNodes) {
            renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
        }
        this.eventManager.trigger("node:visualstate", { id, patch });
    }
    /**
     * Updates an edge/connection visual state immutably and re-renders connections.
     */
    updateEdgeVisualState(id, patch) {
        this.connections = this.connections.map((c) => {
            var _a, _b, _c, _d;
            if (c.id !== id)
                return c;
            const mergedEffects = Object.assign(Object.assign({}, ((_b = (_a = c.visualState) === null || _a === void 0 ? void 0 : _a.effects) !== null && _b !== void 0 ? _b : {})), ((_c = patch.effects) !== null && _c !== void 0 ? _c : {}));
            return Object.assign(Object.assign({}, c), { visualState: Object.assign(Object.assign(Object.assign({}, ((_d = c.visualState) !== null && _d !== void 0 ? _d : {})), patch), { effects: mergedEffects }) });
        });
        this.reRenderConnections();
        this.eventManager.trigger("edge:visualstate", { id, patch });
    }
    /**
     * Updates the content (text, icon, layout) of a placed node.
     * Immutably merges the patch and re-renders.
     */
    updateNodeContent(id, content) {
        this.placedNodes = this.placedNodes.map((n) => n.id === id ? Object.assign(Object.assign({}, n), { content }) : n);
        if (this.canvasObject.placedNodes) {
            renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
        }
        this.eventManager.trigger("node:content:changed", { id, content });
    }
    /**
     * Starts a connection drag from a specific port.
     */
    startConnectionDrag(sourceNodeId, sourcePortId, startPoint) {
        if (!this.connectionModeEnabled)
            return;
        this.connectionDragContext = {
            sourceNodeId,
            sourcePortId,
            currentPoint: startPoint,
        };
        if (this.canvasObject.placedNodes) {
            renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
        }
        this.eventManager.trigger("connection:dragstart", { sourceNodeId, sourcePortId, startPoint });
    }
    /**
     * Updates the current drag point for the ghost connection.
     */
    updateConnectionDrag(currentPoint) {
        if (!this.connectionDragContext)
            return;
        this.connectionDragContext.currentPoint = currentPoint;
        // Snap to nearest port
        this.connectionDragContext.snapped = this.findClosestPort(currentPoint);
        this.renderGhostConnection();
    }
    findClosestPort(point, threshold = 30) {
        var _a;
        let bestDist = threshold;
        let result;
        for (const node of this.placedNodes) {
            // Don't snap to source node
            if (node.id === ((_a = this.connectionDragContext) === null || _a === void 0 ? void 0 : _a.sourceNodeId))
                continue;
            const style = this.getShapeStyle(node);
            if (!style)
                continue;
            const renderer = this.shapeRegistry.get(node.type);
            const resolved = buildResolvedShapeConfig(node, style);
            const ports = renderer.getPorts(resolved);
            const rotation = (node.rotation || 0) * (Math.PI / 180);
            const cos = Math.cos(rotation);
            const sin = Math.sin(rotation);
            for (const [portId, pos] of Object.entries(ports)) {
                const p = pos;
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
        return result;
    }
    /**
     * Completes the connection drag and creates a new connection if dropped on a port.
     */
    endConnectionDrag(targetNodeId, targetPortId) {
        var _a, _b;
        if (!this.connectionDragContext)
            return;
        const finalTargetNodeId = targetNodeId || ((_a = this.connectionDragContext.snapped) === null || _a === void 0 ? void 0 : _a.nodeId);
        const finalTargetPortId = targetPortId || ((_b = this.connectionDragContext.snapped) === null || _b === void 0 ? void 0 : _b.portId);
        if (finalTargetNodeId && finalTargetPortId) {
            // Prevent self-connection
            if (finalTargetNodeId === this.connectionDragContext.sourceNodeId) {
                this.connectionDragContext = null;
                if (this.canvasObject.ghostConnection) {
                    this.canvasObject.ghostConnection.selectAll("*").remove();
                }
                return;
            }
            this.createConnectionFromPorts(this.connectionDragContext.sourceNodeId, this.connectionDragContext.sourcePortId, finalTargetNodeId, finalTargetPortId);
        }
        this.connectionDragContext = null;
        if (this.canvasObject.placedNodes) {
            renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
        }
        if (this.canvasObject.ghostConnection) {
            this.canvasObject.ghostConnection.selectAll("*").remove();
        }
        this.eventManager.trigger("connection:dragend", {});
    }
    createConnectionFromPorts(sourceNodeId, sourcePortId, targetNodeId, targetPortId) {
        const allowMultiple = this.config.canvasProperties.allowMultipleConnections;
        if (!allowMultiple) {
            // Check if any connection already exists between these two specific nodes
            const exists = this.connections.some(c => (c.sourceNodeId === sourceNodeId && c.targetNodeId === targetNodeId));
            if (exists)
                return;
        }
        const connection = {
            // Use timestamp to ensure DOM uniqueness even for same ports
            id: `conn-${sourceNodeId}-${targetNodeId}-${Date.now()}`,
            sourceNodeId,
            sourcePortId,
            targetNodeId,
            targetPortId,
            type: this.activeConnectionType,
            visualState: { status: "idle" },
        };
        this.connections = [...this.connections, connection];
        this.reRenderConnections();
        this.eventManager.trigger("connection:created", { connection });
    }
    renderGhostConnection() {
        if (!this.connectionDragContext || !this.canvasObject.ghostConnection)
            return;
        const sourceNode = this.placedNodes.find(n => n.id === this.connectionDragContext.sourceNodeId);
        if (!sourceNode)
            return;
        const style = this.getShapeStyle(sourceNode);
        if (!style)
            return;
        const renderer = this.shapeRegistry.get(sourceNode.type);
        const resolved = buildResolvedShapeConfig(sourceNode, style);
        const ports = renderer.getPorts(resolved);
        const portPos = ports[this.connectionDragContext.sourcePortId];
        if (!portPos)
            return;
        const rotation = (sourceNode.rotation || 0) * (Math.PI / 180);
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const rotatedX = portPos.x * cos - portPos.y * sin;
        const rotatedY = portPos.x * sin + portPos.y * cos;
        const from = { x: sourceNode.x + rotatedX, y: sourceNode.y + rotatedY };
        const to = this.connectionDragContext.snapped
            ? this.connectionDragContext.snapped.point
            : this.connectionDragContext.currentPoint;
        import('../connections/render.js').then(({ renderGhostConnection }) => {
            var _a, _b, _c;
            renderGhostConnection(this.canvasObject.ghostConnection, from, to, this.config.canvasProperties.ghostConnection, this.activeConnectionType, (_a = this.connectionDragContext) === null || _a === void 0 ? void 0 : _a.sourcePortId, (_c = (_b = this.connectionDragContext) === null || _b === void 0 ? void 0 : _b.snapped) === null || _c === void 0 ? void 0 : _c.portId);
        });
    }
    lockedTheCanvas(locked) {
        lockedCanvas(locked, this.svg, this.zoomBehaviour);
    }
    gridToggles(toggle) {
        toggleGrid(toggle);
    }
    bindSelectionInteractions() {
        // Canvas click deselect (kept namespaced so placement click can coexist).
        this.svg.on("click.selection", (event) => {
            if (this.suppressNextCanvasClick) {
                this.suppressNextCanvasClick = false;
                return;
            }
            if (this.placementContext)
                return;
            const target = event.target;
            if (target === null || target === void 0 ? void 0 : target.closest("g.placed-node"))
                return;
            this.clearSelection();
            this.connectionModeEnabled = false;
            this.rotationModeEnabled = false;
            this.resizeModeEnabled = false;
            if (this.canvasObject.ghostConnection) {
                this.canvasObject.ghostConnection.selectAll("*").remove();
            }
            if (this.canvasObject.placedNodes) {
                renderPlacedNodes(this.canvasObject.placedNodes, this.placedNodes, this);
            }
        });
        // Keyboard selection actions.
        window.addEventListener("keydown", (event) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            if (this.isTypingTarget(event.target))
                return;
            const shortcuts = this.config.canvasProperties.keyboardShortcuts;
            if (!(shortcuts === null || shortcuts === void 0 ? void 0 : shortcuts.enabled))
                return;
            const selectedNodeIds = this.getSelectedNodeIds();
            const keyDownHandled = (_b = (_a = shortcuts.callbacks) === null || _a === void 0 ? void 0 : _a.onKeyDown) === null || _b === void 0 ? void 0 : _b.call(_a, {
                event,
                action: "key:down",
                selectedNodeIds,
                engine: this,
            });
            if (keyDownHandled === false)
                return;
            if (shortcuts.deleteSelection.some((s) => this.matchesShortcut(event, s))) {
                const handled = (_d = (_c = shortcuts.callbacks) === null || _c === void 0 ? void 0 : _c.onDeleteSelection) === null || _d === void 0 ? void 0 : _d.call(_c, {
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
                const handled = (_f = (_e = shortcuts.callbacks) === null || _e === void 0 ? void 0 : _e.onClearSelection) === null || _f === void 0 ? void 0 : _f.call(_e, {
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
            const customBindings = (_g = shortcuts.customBindings) !== null && _g !== void 0 ? _g : {};
            const customAction = Object.keys(customBindings).find((action) => { var _a; return ((_a = customBindings[action]) !== null && _a !== void 0 ? _a : []).some((s) => this.matchesShortcut(event, s)); });
            if (!customAction)
                return;
            const customHandler = (_j = (_h = shortcuts.callbacks) === null || _h === void 0 ? void 0 : _h.custom) === null || _j === void 0 ? void 0 : _j[customAction];
            if (!customHandler)
                return;
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
        this.svg.on("mousedown.lasso", (event) => {
            if (!this.lassoEnabled)
                return;
            if (!this.config.canvasProperties.lassoStyle.enabled)
                return;
            if (this.placementContext)
                return;
            if (event.button !== 0)
                return;
            const target = event.target;
            if (target === null || target === void 0 ? void 0 : target.closest("g.placed-node"))
                return;
            const start = this.getCanvasPointRaw(event);
            const lassoLayer = this.canvasObject.lasso;
            if (!lassoLayer)
                return;
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
            this.svg.on("mousemove.lasso", (moveEvent) => {
                const p = this.getCanvasPointRaw(moveEvent);
                const x = Math.min(start.x, p.x);
                const y = Math.min(start.y, p.y);
                const width = Math.abs(p.x - start.x);
                const height = Math.abs(p.y - start.y);
                rect.attr("x", x).attr("y", y).attr("width", width).attr("height", height);
            });
            this.svg.on("mouseup.lasso", (upEvent) => {
                const end = this.getCanvasPointRaw(upEvent);
                const lasso = {
                    x: Math.min(start.x, end.x),
                    y: Math.min(start.y, end.y),
                    width: Math.abs(end.x - start.x),
                    height: Math.abs(end.y - start.y),
                };
                if (lasso.width < 3 && lasso.height < 3) {
                    this.clearSelection();
                }
                else {
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
    getCanvasPointRaw(event) {
        const zoomTransform = d3.zoomTransform(this.svg.node());
        const [cursorX, cursorY] = d3.pointer(event, this.svg.node());
        return {
            x: (cursorX - zoomTransform.x) / zoomTransform.k,
            y: (cursorY - zoomTransform.y) / zoomTransform.k,
        };
    }
    intersectsLasso(node, lasso) {
        const style = this.getShapeStyle(node);
        if (!style)
            return false;
        const renderer = this.shapeRegistry.get(node.type);
        const resolved = buildResolvedShapeConfig(node, style);
        const localBounds = renderer.getBounds(resolved);
        const bounds = this.toCanvasBounds(node, localBounds);
        return !(bounds.x + bounds.width < lasso.x ||
            lasso.x + lasso.width < bounds.x ||
            bounds.y + bounds.height < lasso.y ||
            lasso.y + lasso.height < bounds.y);
    }
    toCanvasBounds(node, local) {
        return {
            x: node.x + local.x,
            y: node.y + local.y,
            width: local.width,
            height: local.height,
        };
    }
    getShapeStyle(node) {
        var _a;
        const list = (_a = this.config.shapes.default) === null || _a === void 0 ? void 0 : _a[node.type];
        if (!Array.isArray(list))
            return undefined;
        return list.find((s) => s.id === node.shapeVariantId);
    }
    matchesShortcut(event, shortcut) {
        const tokens = shortcut.toLowerCase().split("+").map((t) => t.trim()).filter(Boolean);
        if (!tokens.length)
            return false;
        const wantsCtrl = tokens.includes("ctrl") || tokens.includes("control");
        const wantsMeta = tokens.includes("meta") || tokens.includes("cmd") || tokens.includes("command");
        const wantsAlt = tokens.includes("alt") || tokens.includes("option");
        const wantsShift = tokens.includes("shift");
        if (event.ctrlKey !== wantsCtrl)
            return false;
        if (event.metaKey !== wantsMeta)
            return false;
        if (event.altKey !== wantsAlt)
            return false;
        if (event.shiftKey !== wantsShift)
            return false;
        const keyToken = tokens.find((t) => !["ctrl", "control", "meta", "cmd", "command", "alt", "option", "shift"].includes(t));
        if (!keyToken)
            return false;
        return event.key.toLowerCase() === keyToken;
    }
    isTypingTarget(target) {
        if (!(target instanceof Element))
            return false;
        const tag = target.tagName.toLowerCase();
        return tag === "input" || tag === "textarea" || target.hasAttribute("contenteditable");
    }
}

export { ZenodeEngine };
//# sourceMappingURL=engine.js.map
