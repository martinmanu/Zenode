import * as d3 from 'd3';
export { d3 };
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
/**
 * Updates the content (text, icon, layout) of a placed node.
 */
function updateNodeContent(id, content) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
    }
    engineInstance.updateNodeContent(id, content);
}
/**
 * Listens to engine events.
 */
function on(event, handler) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
    }
    engineInstance.on(event, handler);
}
/**
 * Removes an event listener.
 */
function off(event, handler) {
    if (!engineInstance) {
        throw new Error("ZenodeEngine is not initialized. Call initializeCanvas first.");
    }
    // @ts-ignore - off might not be in engine yet, adding for completeness
    if (engineInstance.off)
        engineInstance.off(event, handler);
}
const addNode = (config) => {
    return engineInstance ? engineInstance.addNode(config) : "";
};
const removeNode = (id) => {
    if (engineInstance)
        engineInstance.removeNode(id);
};
const updateNode = (id, patch) => {
    if (engineInstance)
        engineInstance.updateNode(id, patch);
};
const getNode = (id) => {
    return engineInstance ? engineInstance.getNode(id) : null;
};
const getAllNodes = () => {
    return engineInstance ? engineInstance.getAllNodes() : [];
};
const duplicateNode = (id) => {
    return engineInstance ? engineInstance.duplicateNode(id) : "";
};
/** Triggers the text editor programmatically. */
const beginLabelEdit = (id, kind) => {
    if (engineInstance)
        engineInstance.beginLabelEdit(id, kind);
};
/** Adds a new connection programmatically. */
const addEdge = (config) => {
    return engineInstance ? engineInstance.addEdge(config) : "";
};
/** Removes a connection by ID. */
const removeEdge = (id) => {
    if (engineInstance)
        engineInstance.removeEdge(id);
};
/** Returns a connection state by ID. */
const getEdge = (id) => {
    return engineInstance ? engineInstance.getEdge(id) : null;
};
/** Returns all connections on the canvas. */
const getAllEdges = () => {
    return engineInstance ? engineInstance.getAllEdges() : [];
};
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
/** Undoes the last action. */
function undo() {
    if (!engineInstance)
        return;
    engineInstance.undo();
}
/** Redoes the last undone action. */
function redo() {
    if (!engineInstance)
        return;
    engineInstance.redo();
}
/** Registers a custom action for the context pad. */
function registerContextPadAction(action) {
    if (!engineInstance)
        return;
    engineInstance.registerContextPadAction(action);
}
/**
 * Registers a "Smart Connect" action that finds the nearest port on another node
 * and connects using the closest matching source port.
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            if (target.kind !== 'node')
                return;
            const sourceNode = target.data;
            const allNodes = engine.getPlacedNodes();
            const registry = engine.shapeRegistry;
            const config = engine.config;
            // Collect all ports on all OTHER nodes
            let bestDist = Infinity;
            let bestSourcePortId = 'right';
            let bestTargetNodeId = null;
            let bestTargetPortId = null;
            // Get source node ports
            const srcStyle = (_c = (_b = (_a = config === null || config === void 0 ? void 0 : config.shapes) === null || _a === void 0 ? void 0 : _a.default) === null || _b === void 0 ? void 0 : _b[sourceNode.type]) === null || _c === void 0 ? void 0 : _c.find((s) => s.id === sourceNode.shapeVariantId);
            if (!srcStyle) {
                alert('No other nodes to connect to!');
                return;
            }
            const srcRenderer = registry === null || registry === void 0 ? void 0 : registry.get(sourceNode.type);
            if (!srcRenderer) {
                alert('No other nodes to connect to!');
                return;
            }
            const { buildResolvedShapeConfig } = (_d = engine.__resolveHelper) !== null && _d !== void 0 ? _d : { buildResolvedShapeConfig: null };
            const srcResolved = srcRenderer && srcStyle
                ? (() => {
                    var _a, _b, _c;
                    // Inline minimal resolved config
                    return Object.assign(Object.assign({}, srcStyle), { x: sourceNode.x, y: sourceNode.y, width: (_a = sourceNode.width) !== null && _a !== void 0 ? _a : srcStyle.width, height: (_b = sourceNode.height) !== null && _b !== void 0 ? _b : srcStyle.height, radius: (_c = sourceNode.radius) !== null && _c !== void 0 ? _c : srcStyle.radius });
                })()
                : null;
            const srcPorts = srcResolved ? srcRenderer.getPorts(srcResolved) : { right: { x: sourceNode.x + ((_e = sourceNode.width) !== null && _e !== void 0 ? _e : 80), y: sourceNode.y + ((_f = sourceNode.height) !== null && _f !== void 0 ? _f : 40) / 2 } };
            for (const otherNode of allNodes) {
                if (otherNode.id === sourceNode.id)
                    continue; // skip self
                const tgtStyle = (_j = (_h = (_g = config === null || config === void 0 ? void 0 : config.shapes) === null || _g === void 0 ? void 0 : _g.default) === null || _h === void 0 ? void 0 : _h[otherNode.type]) === null || _j === void 0 ? void 0 : _j.find((s) => s.id === otherNode.shapeVariantId);
                if (!tgtStyle)
                    continue;
                const tgtRenderer = registry === null || registry === void 0 ? void 0 : registry.get(otherNode.type);
                if (!tgtRenderer)
                    continue;
                const tgtResolved = Object.assign(Object.assign({}, tgtStyle), { x: otherNode.x, y: otherNode.y, width: (_k = otherNode.width) !== null && _k !== void 0 ? _k : tgtStyle.width, height: (_l = otherNode.height) !== null && _l !== void 0 ? _l : tgtStyle.height, radius: (_m = otherNode.radius) !== null && _m !== void 0 ? _m : tgtStyle.radius });
                const tgtPorts = tgtRenderer.getPorts(tgtResolved);
                // Find the closest src→tgt port pair
                for (const [srcPortId, srcPos] of Object.entries(srcPorts)) {
                    const sp = srcPos;
                    const absSrcX = sourceNode.x + sp.x;
                    const absSrcY = sourceNode.y + sp.y;
                    for (const [tgtPortId, tgtPos] of Object.entries(tgtPorts)) {
                        const tp = tgtPos;
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
            }
            else {
                alert('No other nodes found to connect to!');
            }
        }
    });
}

export { ZenodeEngine, addEdge, addNode, beginLabelEdit, createConnection, createShape, duplicateNode, focusOnSelectedNode, getAllEdges, getAllNodes, getEdge, getEngine, getLicenseTier, getNode, getPlacedNodes, initializeCanvas, off, on, redo, registerContextPadAction, registerSmartConnect, removeEdge, removeNode, resizeCanvas, setActiveConnectionType, setConnectionLabel, setConnectionModeEnabled, setLassoEnabled, setLicense, setSmartRoutingEnabled, undo, updateConfig, updateEdgeVisualState, updateNode, updateNodeContent, updateNodeVisualState, zoomIn, zoomOut };
//# sourceMappingURL=index.js.map
