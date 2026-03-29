import { ZenodeEngine } from './core/engine.js';

let engineInstance = null;
/**
 * Initializes the Zenode engine.
 * @param containerSelector The selector for the container element.
 * @param userConfig Optional custom configuration.
 * @throws Error if container is not found.
 */
function initializeCanvas(containerSelector, userConfig) {
    if (!engineInstance) {
        const inputConfig = Object.assign({}, userConfig);
        const container = document.querySelector(containerSelector);
        if (!container) {
            throw new Error(`Container '${containerSelector}' not found in DOM.`);
        }
        engineInstance = new ZenodeEngine(container, inputConfig);
    }
    else {
        console.warn("ZenodeEngine is already initialized!");
    }
}
/**
 * Updates the engine configuration.
 * @param userConfig New configuration object.
 */
function updateConfig(userConfig) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
    }
    engineInstance.updateConfig(userConfig);
}
/**
 * Resizes the canvas dimensions smoothly.
 */
function resizeCanvas(width, height) {
    if (!engineInstance)
        return;
    engineInstance.resizeCanvas(width, height);
}
/**
 * Creates a shape dynamically on the canvas.
 * @param type Shape type (e.g., "rectangle", "circle").
 * @param name Optional shape name.
 * @throws Error if engine is not initialized or parameters are invalid.
 */
function createShape(type, id) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initialize() first.");
    }
    if (typeof type !== "string" || !["rectangle", "circle", "rhombus"].includes(type)) {
        throw new Error(`Invalid shape type '${type}'. Supported types: rectangle, circle, rhombus.`);
    }
    engineInstance.createShape(type, id);
    // engineInstance.createShape(type, x, y, name);
}
/**
 * Creates a connection between two shapes.
 * @param from The ID or name of the first shape.
 * @param to The ID or name of the second shape.
 * @throws Error if engine is not initialized or shapes are missing.
 */
function createConnection(from, to) {
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
function setLassoEnabled(enabled) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
    }
    engineInstance.setLassoEnabled(enabled);
}
/**
 * Updates visual state for a placed node (effects/status only).
 */
function updateNodeVisualState(id, patch) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
    }
    engineInstance.updateNodeVisualState(id, patch);
}
/**
 * Updates visual state for a connection/edge (effects/status only).
 */
function updateEdgeVisualState(id, patch) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
    }
    engineInstance.updateEdgeVisualState(id, patch);
}
/** Sets the license key for the engine. */
function setLicense(key) {
    if (!engineInstance) {
        throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
    }
    engineInstance.setLicense(key);
}
/** Enables or disables smart routing for connections. */
function setSmartRoutingEnabled(enabled) {
    if (!engineInstance) {
        throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
    }
    engineInstance.setSmartRoutingEnabled(enabled);
}
/** Enables or disables the connection drawing mode globally. */
function setConnectionModeEnabled(enabled) {
    if (!engineInstance) {
        throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
    }
    engineInstance.setConnectionModeEnabled(enabled);
}
/** Sets the active connection type for newly created connections. */
function setActiveConnectionType(type) {
    if (!engineInstance) {
        throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
    }
    engineInstance.setActiveConnectionType(type);
}
/** Sets the label text and enabled state for all default connection types. */
function setConnectionLabel(text, enabled) {
    if (!engineInstance) {
        throw new Error('ZenodeEngine is not initialized. Call initializeCanvas first.');
    }
    const types = ['straight', 'curved', 's-shaped', 'l-bent'];
    types.forEach(t => {
        const conn = engineInstance.config.connections.default[t];
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
function getLicenseTier() {
    if (!engineInstance)
        return 'free';
    return engineInstance.getLicenseTier();
}
/** Zooms the canvas in. */
function zoomIn() {
    if (!engineInstance)
        return;
    engineInstance.zoomIn();
}
/** Zooms the canvas out. */
function zoomOut() {
    if (!engineInstance)
        return;
    engineInstance.zoomOut();
}
/** Focuses (center + zoom) on the first selected node. */
function focusOnSelectedNode() {
    if (!engineInstance)
        return;
    engineInstance.focusOnSelectedNode();
}
/** Registers a custom action for the context pad. */
function registerContextPadAction(action) {
    if (!engineInstance)
        return;
    engineInstance.registerContextPadAction(action);
}
/**
 * Demo: Registers a "Smart Connect" action that connects to the nearest port of another node.
 */
function registerSmartConnect() {
    if (!engineInstance)
        return;
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
            if (target.kind !== 'node')
                return;
            const sourceNode = target.data;
            const sourcePos = { x: sourceNode.x + 50, y: sourceNode.y + 50 }; // approx center
            // Find closest port on ANY other node
            const closest = engine.findClosestPort(sourcePos, 1000); // large threshold to find anything
            if (closest) {
                engine.createConnectionFromPorts(sourceNode.id, 'center', // use center for source
                closest.nodeId, closest.portId);
            }
            else {
                alert("No other nodes found to connect to!");
            }
        }
    });
}

export { ZenodeEngine, createConnection, createShape, focusOnSelectedNode, getEngine, getLicenseTier, getPlacedNodes, initializeCanvas, registerContextPadAction, registerSmartConnect, resizeCanvas, setActiveConnectionType, setConnectionLabel, setConnectionModeEnabled, setLassoEnabled, setLicense, setSmartRoutingEnabled, updateConfig, updateEdgeVisualState, updateNodeVisualState, zoomIn, zoomOut };
//# sourceMappingURL=index.js.map
