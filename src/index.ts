import * as d3 from "d3";
import { ZenodeEngine } from "./core/engine.js";
import { Config, Connection as ConnectionConfig, ContextPadConfig as CPConfig } from "./model/configurationModel.js";
import { Connection as ConnectionInstance, PlacedNode, Node as NodeInstance } from "./model/interface.js";
import { VisualState, ContextPadAction, ContextPadTarget, NodeContent, NodeConfig, NodeData, EdgeConfig, EdgeData } from "./types/index.js";

export { 
  ZenodeEngine, 
  Config, ConnectionConfig, CPConfig,
  ConnectionInstance, PlacedNode, NodeInstance,
  VisualState, ContextPadAction, ContextPadTarget, NodeContent,
  NodeConfig, NodeData,
  EdgeConfig, EdgeData,
  d3
};

let engineInstance: ZenodeEngine | null = null;

/**
 * Initializes the Zenode engine.
 * @param containerSelector The selector for the container element.
 * @param userConfig Optional custom configuration.
 * @throws Error if container is not found.
 */
function initializeCanvas(containerSelector: string, userConfig: Partial<Config>) {
  if (!engineInstance) {
    const inputConfig: Partial<Config> = { ...userConfig };
    const container = document.querySelector(containerSelector) as HTMLElement;

    if (!container) {
      throw new Error(`Container '${containerSelector}' not found in DOM.`);
    }
    engineInstance = new ZenodeEngine(container, inputConfig);
    // Expose for console testing
    (window as any).engine = engineInstance;
  } else {
    console.warn("ZenodeEngine is already initialized!");
  }
}

/**
 * Updates the engine configuration.
 * @param userConfig New configuration object.
 */
function updateConfig(userConfig: Partial<Config>) {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
  }
  engineInstance.updateConfig(userConfig);
}

/**
 * Resizes the canvas dimensions smoothly.
 */
function resizeCanvas(width: number, height: number) {
  if (!engineInstance) return;
  engineInstance.resizeCanvas(width, height);
}

/**
 * Creates a shape dynamically on the canvas.
 * @param type Shape type (e.g., "rectangle", "circle").
 * @param name Optional shape name.
 * @throws Error if engine is not initialized or parameters are invalid.
 */
export function createShape(type: string, id: string) {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initialize() first.");
  }

  const validTypes = [
    "rectangle",
    "circle",
    "rhombus",
    "semicircle",
    "pentagon",
    "octagon",
    "star",
    "oval",
    "triangle",
    "trapezoid",
    "parallelogram",
    "kite",
    "hexagon",
    "heptagon",
    "nonagon",
    "decagon",
  ];

  if (typeof type !== "string" || !validTypes.includes(type)) {
    throw new Error(`Invalid shape type '${type}'. Supported types: ${validTypes.join(", ")}.`);
  }
  engineInstance.createShape(type, id)
  // engineInstance.createShape(type, x, y, name);
}

/**
 * Creates a connection between two shapes.
 * @param from The ID or name of the first shape.
 * @param to The ID or name of the second shape.
 * @throws Error if engine is not initialized or shapes are missing.
 */
export function createConnection(from: string, to: string) {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initialize() first.");
  }

  if (!from || !to) {
    throw new Error("Both 'from' and 'to' shape names are required.");
  }

  engineInstance.createConnection(from, to);
}

/**
 * Returns the list of placed nodes (for use with createConnection node ids).
 */
function getPlacedNodes() {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
  }
  return engineInstance.getPlacedNodes();
}


/** Enable or disable lasso selection tool interaction. */
function setLassoEnabled(enabled: boolean): void {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
  }
  engineInstance.setLassoEnabled(enabled);
}

/**
 * Updates visual state for a placed node (effects/status only).
 */
export function updateNodeVisualState(id: string, patch: Partial<VisualState>): void {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
  }
  engineInstance.updateNodeVisualState(id, patch);
}

/**
 * Updates visual state for a connection/edge (effects/status only).
 */
export function updateEdgeVisualState(id: string, patch: Partial<VisualState>): void {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
  }
  engineInstance.updateEdgeVisualState(id, patch);
}

/**
 * Updates the content (text, icon, layout) of a placed node.
 */
function updateNodeContent(id: string, content: NodeContent): void {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
  }
  engineInstance.updateNodeContent(id, content);
}

/** Sets the current editing node ID to suppress SVG rendering. */
function setEditingNode(id: string | null): void {
  if (engineInstance) engineInstance.setEditingNode(id);
}

/** Gets the current editing node ID. */
function getEditingNodeId(): string | null {
  return engineInstance ? engineInstance.getEditingNodeId() : null;
}

/**
 * Listens to engine events.
 */
function on(event: string, handler: (data: any) => void): void {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
  }
  engineInstance.on(event, handler);
}

/**
 * Removes an event listener.
 */
export function off(event: string, handler: (data: any) => void): void {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
  }
  // @ts-ignore - off might not be in engine yet, adding for completeness
  if (engineInstance.off) engineInstance.off(event, handler);
}

const addNode = (config: NodeConfig) => {
  return engineInstance ? engineInstance.addNode(config) : "";
};

const removeNode = (id: string) => {
  if (engineInstance) engineInstance.removeNode(id);
};

const updateNode = (id: string, patch: Partial<NodeConfig>) => {
  if (engineInstance) engineInstance.updateNode(id, patch);
};

const getNode = (id: string) => {
  return engineInstance ? engineInstance.getNode(id) : null;
};

const getAllNodes = () => {
  return engineInstance ? engineInstance.getAllNodes() : [];
};

const duplicateNode = (id: string) => {
  return engineInstance ? engineInstance.duplicateNode(id) : "";
};

/** Triggers the text editor programmatically. */
const beginLabelEdit = (id: string, kind: 'node' | 'edge') => {
  if (engineInstance) engineInstance.beginLabelEdit(id, kind);
};

const validate = () => {
    return engineInstance ? engineInstance.validate() : { valid: true, errors: [], warnings: [] };
};

const clear = () => {
    if (engineInstance) engineInstance.clear();
};

/** Handles a drop event from the UI to place a shape. */
function handleDrop(event: DragEvent): void {
  if (engineInstance) engineInstance.handleDrop(event);
}

/** Places a shape at a specific canvas coordinate. */
function placeShapeAt(type: string, id: string, x: number, y: number, data?: any): void {
  if (engineInstance) engineInstance.placeShapeAt(type, id, x, y, data);
}

/** Places a shape at a safe, non-overlapping position. */
function placeShapeAtSafePos(type: string, id: string, data?: any): void {
  if (engineInstance) engineInstance.placeShapeAtSafePos(type, id, data);
}


/** Adds a new connection programmatically. */
const addEdge = (config: EdgeConfig) => {
  return engineInstance ? engineInstance.addEdge(config) : "";
};

/** Removes a connection by ID. */
const removeEdge = (id: string) => {
  if (engineInstance) engineInstance.removeEdge(id);
};

/** Returns a connection state by ID. */
const getEdge = (id: string) => {
  return engineInstance ? engineInstance.getEdge(id) : null;
};

/** Returns all connections on the canvas. */
const getAllEdges = () => {
  return engineInstance ? engineInstance.getAllEdges() : [];
};

const focusNode = (id: string, options?: any) => {
  if (engineInstance) engineInstance.focusNode(id, options);
};

const highlight = (id: string, options?: any) => {
  if (engineInstance) engineInstance.highlight(id, options);
};

const getDiagramState = () => {
  return engineInstance ? engineInstance.getDiagramState() : null;
};

const copySelection = () => {
    if (engineInstance) engineInstance.copySelection();
};

const pasteSelection = (offset?: { x: number, y: number }) => {
    if (engineInstance) engineInstance.pasteSelection(offset);
};

export {
  initializeCanvas,
  updateConfig,
  updateNodeContent,
  getPlacedNodes,
  setActiveConnectionType,
  setConnectionModeEnabled,
  setLassoEnabled,
  resizeCanvas,
  on,
  addNode,
  removeNode,
  updateNode,
  getNode,
  getAllNodes,
  getDiagramState,
  duplicateNode,
  beginLabelEdit,
  addEdge,
  removeEdge,
  getEdge,
  getAllEdges,
  setLicense,
  setSmartRoutingEnabled,
  setConnectionLabel,
  getEngine,
  getLicenseTier,
  zoomIn,
  zoomOut,
  focusNode,
  focusOnSelectedNode,
  undo,
  redo,
  clear,
  validate,
  registerContextPadAction,
  registerSmartConnect,
  copySelection,
  pasteSelection,
  setEditingNode,
  getEditingNodeId,
  handleDrop,
  placeShapeAt,
  placeShapeAtSafePos
};

/** Sets the license key for the engine. */
function setLicense(key: string): void {
  if (!engineInstance) {
    throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
  }
  engineInstance.setLicense(key);
}

/** Enables or disables smart routing for connections. */
function setSmartRoutingEnabled(enabled: boolean): void {
  if (!engineInstance) {
    throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
  }
  engineInstance.setSmartRoutingEnabled(enabled);
}

/** Enables or disables the connection drawing mode globally. */
function setConnectionModeEnabled(enabled: boolean): void {
  if (!engineInstance) {
    throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
  }
  engineInstance.setConnectionModeEnabled(enabled);
}

/** Sets the active connection type for newly created connections. */
function setActiveConnectionType(type: string): void {
  if (!engineInstance) {
    throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
  }
  engineInstance.setActiveConnectionType(type);
}

/** Sets the label text and enabled state for all default connection types. */
function setConnectionLabel(text: string, enabled: boolean): void {
  if (!engineInstance) {
    throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
  }
  const types = ['straight', 'curved', 's-shaped', 'l-bent'] as const;
  types.forEach(t => {
    const conn = (engineInstance as any).config.connections.default[t];
    if (conn) {
      conn.lineStyle.innerTextEnabled = enabled;
      conn.lineStyle.innerText = text;
    }
  });
  engineInstance.reRenderConnections();
}

/** Returns the engine instance (advanced use). */
function getEngine() {
  return engineInstance;
}
/** Returns the current license tier. */
function getLicenseTier(): string {
  if (!engineInstance) return 'free';
  return engineInstance.getLicenseTier();
}

/** Zooms the canvas in. */
function zoomIn(): void {
  if (!engineInstance) return;
  engineInstance.zoomIn();
}

/** Zooms the canvas out. */
function zoomOut(): void {
  if (!engineInstance) return;
  engineInstance.zoomOut();
}

/** Focuses (center + zoom) on the first selected node. */
function focusOnSelectedNode(): void {
  if (!engineInstance) return;
  engineInstance.focusOnSelectedNode();
}

/** Undoes the last action. */
function undo(): void {
  if (!engineInstance) return;
  engineInstance.undo();
}

/** Redoes the last undone action. */
function redo(): void {
  if (!engineInstance) return;
  engineInstance.redo();
}

/** Registers a custom action for the context pad. */
function registerContextPadAction(action: any): void {
  if (!engineInstance) return;
  engineInstance.registerContextPadAction(action);
}

/** 
 * Registers a "Smart Connect" action that finds the nearest port on another node
 * and connects using the closest matching source port.
 */
function registerSmartConnect(): void {
  if (!engineInstance) return;

  engineInstance.registerContextPadAction({
    id: 'smart-connect',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
    tooltip: 'Smart Connect to Nearest',
    order: 10,
    targets: ['node'],
    style: {
      color: '#4A90E2',
      hoverColor: 'rgba(74, 144, 226, 0.1)'
    },
    handler: (target, engine) => {
      if (target.kind !== 'node') return;

      const sourceNode = target.data;
      const allNodes = engine.getPlacedNodes();
      const registry = (engine as any).shapeRegistry;
      const config = (engine as any).config;

      // Collect all ports on all OTHER nodes
      let bestDist = Infinity;
      let bestSourcePortId = 'right';
      let bestTargetNodeId: string | null = null;
      let bestTargetPortId: string | null = null;

      // Get source node ports
      const srcStyle = config?.shapes?.default?.[sourceNode.type]?.find((s: any) => s.id === sourceNode.shapeVariantId);
      if (!srcStyle) { alert('No other nodes to connect to!'); return; }
      const srcRenderer = registry?.get(sourceNode.type);
      if (!srcRenderer) { alert('No other nodes to connect to!'); return; }

      const { buildResolvedShapeConfig } = (engine as any).__resolveHelper
        ?? { buildResolvedShapeConfig: null };

      const srcResolved = srcRenderer && srcStyle
        ? (() => {
            // Inline minimal resolved config
            return { ...srcStyle, x: sourceNode.x, y: sourceNode.y, width: sourceNode.width ?? srcStyle.width, height: sourceNode.height ?? srcStyle.height, radius: sourceNode.radius ?? srcStyle.radius };
          })()
        : null;

      const srcPorts = srcResolved ? srcRenderer.getPorts(srcResolved) : { right: { x: sourceNode.x + (sourceNode.width ?? 80), y: sourceNode.y + (sourceNode.height ?? 40) / 2 } };

      for (const otherNode of allNodes) {
        if (otherNode.id === sourceNode.id) continue; // skip self

        const tgtStyle = config?.shapes?.default?.[otherNode.type]?.find((s: any) => s.id === otherNode.shapeVariantId);
        if (!tgtStyle) continue;
        const tgtRenderer = registry?.get(otherNode.type);
        if (!tgtRenderer) continue;

        const tgtResolved = { ...tgtStyle, x: otherNode.x, y: otherNode.y, width: otherNode.width ?? tgtStyle.width, height: otherNode.height ?? tgtStyle.height, radius: otherNode.radius ?? tgtStyle.radius };
        const tgtPorts = tgtRenderer.getPorts(tgtResolved);

        // Find the closest src→tgt port pair
        for (const [srcPortId, srcPos] of Object.entries(srcPorts)) {
          const sp = srcPos as { x: number; y: number };
          const absSrcX = sourceNode.x + sp.x;
          const absSrcY = sourceNode.y + sp.y;

          for (const [tgtPortId, tgtPos] of Object.entries(tgtPorts)) {
            const tp = tgtPos as { x: number; y: number };
            const absTgtX = otherNode.x + tp.x;
            const absTgtY = otherNode.y + tp.y;
            const dist = Math.hypot(absSrcX - absTgtX, absSrcY - absTgtY);
            if (dist < bestDist) {
              bestDist = dist;
              bestSourcePortId = srcPortId;
              bestTargetNodeId = otherNode.id;
              bestTargetPortId = tgtPortId;
            }
          }
        }
      }

      if (bestTargetNodeId && bestTargetPortId) {
        engine.createConnectionFromPorts(sourceNode.id, bestSourcePortId, bestTargetNodeId, bestTargetPortId);
      } else {
        alert('No other nodes found to connect to!');
      }
    }
  });
}
