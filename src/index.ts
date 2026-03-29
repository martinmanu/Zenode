import { ZenodeEngine } from "./core/engine.js";
import { Config, Connection as ConnectionConfig, ContextPadConfig as CPConfig } from "./model/configurationModel.js";
import { Connection as ConnectionInstance, PlacedNode, Node as NodeInstance } from "./model/interface.js";
import { VisualState, ContextPadAction, ContextPadTarget } from "./types/index.js";

export { 
  ZenodeEngine, 
  Config, ConnectionConfig, CPConfig,
  ConnectionInstance, PlacedNode, NodeInstance,
  VisualState, ContextPadAction, ContextPadTarget
};

let engineInstance: ZenodeEngine | null = null;

/**
 * Initializes the Zenode engine.
 * @param containerSelector The selector for the container element.
 * @param userConfig Optional custom configuration.
 * @throws Error if container is not found.
 */
export function initializeCanvas(containerSelector: string, userConfig: Partial<Config>) {
  if (!engineInstance) {
    const inputConfig: Partial<Config> = { ...userConfig };
    const container = document.querySelector(containerSelector) as HTMLElement;

    if (!container) {
      throw new Error(`Container '${containerSelector}' not found in DOM.`);
    }
    engineInstance = new ZenodeEngine(container, inputConfig);
  } else {
    console.warn("ZenodeEngine is already initialized!");
  }
}

/**
 * Updates the engine configuration.
 * @param userConfig New configuration object.
 */
export function updateConfig(userConfig: Partial<Config>) {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
  }
  engineInstance.updateConfig(userConfig);
}

/**
 * Resizes the canvas dimensions smoothly.
 */
export function resizeCanvas(width: number, height: number) {
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

  if (typeof type !== "string" || !["rectangle", "circle", "rhombus"].includes(type)) {
    throw new Error(`Invalid shape type '${type}'. Supported types: rectangle, circle, rhombus.`);
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
export function getPlacedNodes() {
  if (!engineInstance) {
    throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
  }
  return engineInstance.getPlacedNodes();
}


/** Enable or disable lasso selection tool interaction. */
export function setLassoEnabled(enabled: boolean): void {
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

/** Sets the license key for the engine. */
export function setLicense(key: string): void {
  if (!engineInstance) {
    throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
  }
  engineInstance.setLicense(key);
}

/** Enables or disables smart routing for connections. */
export function setSmartRoutingEnabled(enabled: boolean): void {
  if (!engineInstance) {
    throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
  }
  engineInstance.setSmartRoutingEnabled(enabled);
}

/** Enables or disables the connection drawing mode globally. */
export function setConnectionModeEnabled(enabled: boolean): void {
  if (!engineInstance) {
    throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
  }
  engineInstance.setConnectionModeEnabled(enabled);
}

/** Sets the active connection type for newly created connections. */
export function setActiveConnectionType(type: string): void {
  if (!engineInstance) {
    throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
  }
  engineInstance.setActiveConnectionType(type);
}

/** Sets the label text and enabled state for all default connection types. */
export function setConnectionLabel(text: string, enabled: boolean): void {
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
export function getEngine() {
  return engineInstance;
}
/** Returns the current license tier. */
export function getLicenseTier(): string {
  if (!engineInstance) return 'free';
  return engineInstance.getLicenseTier();
}

/** Zooms the canvas in. */
export function zoomIn(): void {
  if (!engineInstance) return;
  engineInstance.zoomIn();
}

/** Zooms the canvas out. */
export function zoomOut(): void {
  if (!engineInstance) return;
  engineInstance.zoomOut();
}

/** Focuses (center + zoom) on the first selected node. */
export function focusOnSelectedNode(): void {
  if (!engineInstance) return;
  engineInstance.focusOnSelectedNode();
}

/** Registers a custom action for the context pad. */
export function registerContextPadAction(action: any): void {
  if (!engineInstance) return;
  engineInstance.registerContextPadAction(action);
}

/** 
 * Demo: Registers a "Smart Connect" action that connects to the nearest port of another node.
 */
export function registerSmartConnect(): void {
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
      const sourcePos = { x: sourceNode.x + 50, y: sourceNode.y + 50 }; // approx center
      
      // Find closest port on ANY other node
      const closest = engine.findClosestPort(sourcePos, 1000); // large threshold to find anything
      
      if (closest) {
        engine.createConnectionFromPorts(
          sourceNode.id, 
          'center', // use center for source
          closest.nodeId, 
          closest.portId
        );
      } else {
        alert("No other nodes found to connect to!");
      }
    }
  });
}
