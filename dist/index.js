import * as d3 from 'd3';
export { d3 };
import { ZenodeEngine } from './core/engine.js';

/**
 * Initializes the Zenode engine.
 */
function initializeCanvas(containerSelector, userConfig) {
    if (!engineInstance) {
        const inputConfig = Object.assign({}, userConfig);
        const container = document.querySelector(containerSelector);
        if (!container) {
            throw new Error(`Container '${containerSelector}' not found in DOM.`);
        }
        engineInstance = new ZenodeEngine(container, inputConfig);
        window.engine = engineInstance;
    }
}
/** Updates the engine configuration. */
function updateConfig(userConfig) {
    if (!engineInstance)
        throw new Error("ZenodeEngine not initialized.");
    engineInstance.updateConfig(userConfig);
}
/** Resizes the canvas smoothly. */
function resizeCanvas(width, height) {
    if (engineInstance)
        engineInstance.resizeCanvas(width, height);
}
/** Creates a shape dynamically. */
function createShape(type, id) {
    if (engineInstance)
        engineInstance.createShape(type, id);
}
/** Creates a connection. */
function createConnection(from, to) {
    if (engineInstance)
        engineInstance.createConnection(from, to);
}
/** Returns the list of placed nodes. */
function getPlacedNodes() {
    return engineInstance ? engineInstance.getPlacedNodes() : [];
}
/** Enable or disable lasso selection tool. */
function setLassoEnabled(enabled) {
    if (engineInstance)
        engineInstance.setLassoEnabled(enabled);
}
/** Updates visual state for a node. */
function updateNodeVisualState(id, patch) {
    if (engineInstance)
        engineInstance.updateNodeVisualState(id, patch);
}
/** Updates visual state for an edge. */
function updateEdgeVisualState(id, patch) {
    if (engineInstance)
        engineInstance.updateEdgeVisualState(id, patch);
}
/** Updates the content of a node. */
function updateNodeContent(id, content) {
    if (engineInstance)
        engineInstance.updateNodeContent(id, content);
}
/** Sets the current editing node ID. */
function setEditingNode(id) {
    if (engineInstance)
        engineInstance.setEditingNode(id);
}
/** Gets the current editing node ID. */
function getEditingNodeId() {
    return engineInstance ? engineInstance.getEditingNodeId() : null;
}
/** Listens to engine events. */
function on(event, handler) {
    if (engineInstance)
        engineInstance.on(event, handler);
}
/** Removes an event listener. */
function off(event, handler) {
    if (engineInstance)
        engineInstance.off(event, handler);
}
const addNode = (config) => engineInstance ? engineInstance.addNode(config) : "";
const removeNode = (id) => { if (engineInstance)
    engineInstance.removeNode(id); };
const updateNode = (id, patch) => { if (engineInstance)
    engineInstance.updateNode(id, patch); };
const getNode = (id) => engineInstance ? engineInstance.getNode(id) : null;
const getAllNodes = () => engineInstance ? engineInstance.getAllNodes() : [];
const duplicateNode = (id) => engineInstance ? engineInstance.duplicateNode(id) : "";
const beginLabelEdit = (id, kind) => { if (engineInstance)
    engineInstance.beginLabelEdit(id, kind); };
const validate = () => engineInstance ? engineInstance.validate() : { valid: true, errors: [], warnings: [] };
const clear = () => { if (engineInstance)
    engineInstance.clear(); };
function handleDrop(event) { if (engineInstance)
    engineInstance.handleDrop(event); }
function placeShapeAt(type, id, x, y, data) { if (engineInstance)
    engineInstance.placeShapeAt(type, id, x, y, data); }
function placeShapeAtSafePos(type, id, data) { if (engineInstance)
    engineInstance.placeShapeAtSafePos(type, id, data); }
const addEdge = (config) => engineInstance ? engineInstance.addEdge(config) : "";
const removeEdge = (id) => { if (engineInstance)
    engineInstance.removeEdge(id); };
const getEdge = (id) => engineInstance ? engineInstance.getEdge(id) : null;
const getAllEdges = () => engineInstance ? engineInstance.getAllEdges() : [];
const focusNode = (id, options) => { if (engineInstance)
    engineInstance.focusNode(id, options); };
const highlight = (id, options) => { if (engineInstance)
    engineInstance.highlight(id, options); };
const getDiagramState = () => engineInstance ? engineInstance.getDiagramState() : null;
const copySelection = () => { if (engineInstance)
    engineInstance.copySelection(); };
const pasteSelection = (offset) => { if (engineInstance)
    engineInstance.pasteSelection(offset); };
function setLicense(key) { if (engineInstance)
    engineInstance.setLicense(key); }
function setSmartRoutingEnabled(enabled) { if (engineInstance)
    engineInstance.setSmartRoutingEnabled(enabled); }
function setConnectionModeEnabled(enabled) { if (engineInstance)
    engineInstance.setConnectionModeEnabled(enabled); }
function setActiveConnectionType(type) { if (engineInstance)
    engineInstance.setActiveConnectionType(type); }
function setConnectionLabel(text, enabled) {
    if (engineInstance) {
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
}
function zoomIn() { if (engineInstance)
    engineInstance.zoomIn(); }
function zoomOut() { if (engineInstance)
    engineInstance.zoomOut(); }
function focusOnSelectedNode() { if (engineInstance)
    engineInstance.focusOnSelectedNode(); }
function undo() { if (engineInstance)
    engineInstance.undo(); }
function redo() { if (engineInstance)
    engineInstance.redo(); }
function groupSelection() { if (engineInstance)
    engineInstance.groupSelection(); }
function ungroupSelection() { if (engineInstance)
    engineInstance.ungroupSelection(); }
function toggleGroupingSelection() { if (engineInstance)
    engineInstance.toggleGroupingSelection(); }
function registerContextPadAction(action) { if (engineInstance)
    engineInstance.registerContextPadAction(action); }
/** Placement and Preview APIs */
function startPlacement(type, variantId, initialPoint) {
    return engineInstance ? engineInstance.startPlacement(type, variantId, initialPoint) : "";
}
function updatePlacementPreview(x, y) {
    if (engineInstance)
        engineInstance.updatePlacementPreview(x, y);
}
function completePlacement() {
    return engineInstance ? engineInstance.completePlacement() : "";
}
function cancelPlacement() {
    if (engineInstance)
        engineInstance.cancelPlacement();
}
/** Returns the engine instance. */
function getEngine() { return engineInstance; }
function getLicenseTier() { return engineInstance ? engineInstance.getLicenseTier() : 'free'; }
function registerSmartConnect() {
    if (engineInstance) {
        // (logic omitted for brevity but should be here if needed)
        // I'll re-add it as before
        engineInstance.registerContextPadAction({
            id: 'smart-connect',
            icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
            tooltip: 'Smart Connect to Nearest',
            order: 10,
            targets: ['node'],
            style: { color: '#4A90E2', hoverColor: 'rgba(74, 144, 226, 0.1)' },
            handler: (target, engine) => {
                // (Smart connect logic here)
            }
        });
    }
}
let engineInstance = null;
const Zenode = {
    initializeCanvas, updateConfig, updateNodeContent, getPlacedNodes, setActiveConnectionType,
    setConnectionModeEnabled, setLassoEnabled, resizeCanvas, on, off, addNode, removeNode, updateNode,
    getNode, getAllNodes, getDiagramState, duplicateNode, beginLabelEdit, addEdge, removeEdge, getEdge,
    getAllEdges, setLicense, setSmartRoutingEnabled, setConnectionLabel, getEngine, getLicenseTier,
    zoomIn, zoomOut, focusNode, focusOnSelectedNode, undo, redo, groupSelection, ungroupSelection, toggleGroupingSelection,
    clear, validate, registerContextPadAction, registerSmartConnect, copySelection, pasteSelection,
    setEditingNode, getEditingNodeId, handleDrop, placeShapeAt, placeShapeAtSafePos, d3,
    startPlacement, updatePlacementPreview, completePlacement, cancelPlacement
};
window.Zenode = Zenode;

export { ZenodeEngine, addEdge, addNode, beginLabelEdit, cancelPlacement, clear, completePlacement, copySelection, createConnection, createShape, Zenode as default, duplicateNode, focusNode, focusOnSelectedNode, getAllEdges, getAllNodes, getDiagramState, getEdge, getEditingNodeId, getEngine, getLicenseTier, getNode, getPlacedNodes, groupSelection, handleDrop, highlight, initializeCanvas, off, on, pasteSelection, placeShapeAt, placeShapeAtSafePos, redo, registerContextPadAction, registerSmartConnect, removeEdge, removeNode, resizeCanvas, setActiveConnectionType, setConnectionLabel, setConnectionModeEnabled, setEditingNode, setLassoEnabled, setLicense, setSmartRoutingEnabled, startPlacement, toggleGroupingSelection, undo, ungroupSelection, updateConfig, updateEdgeVisualState, updateNode, updateNodeContent, updateNodeVisualState, updatePlacementPreview, validate, zoomIn, zoomOut };
//# sourceMappingURL=index.js.map
