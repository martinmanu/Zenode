// src/core/engine.ts
import { drawCanvas, lockedCanvas } from "../components/canvas/canvas.js";
import { drawGrid, toggleGrid } from "../components/canvas/grid.js";
import { EventManager } from "./eventManager.js";
import { ZoomManager } from "./zoom&PanManager.js";
export class ZenodeEngine {
    constructor(container, config) {
        this.shapes = new Map();
        this.connections = [];
        this.canvasObject = { svg: null, grid: null, elements: null, canvasContainer: null };
        this.container = container;
        this.config = config;
        this.eventManager = new EventManager(); // New event system
        this.initializeCanvas();
    }
    initializeCanvas() {
        this.canvasObject = drawCanvas(this.container ? `#${this.container.id}` : "body", this.config.canvas);
        this.svg = this.canvasObject.svg;
        this.grid = drawGrid(this.svg, this.config.canvas, this.canvasObject.grid);
        this.alignmentLine = this.svg.append("g").attr("class", "alignment-line");
        this.canvasContainerGroup = this.canvasObject.canvasContainer;
        // Initialize zoom manager
        this.zoomManager = new ZoomManager(this.canvasContainerGroup, this.svg, this.config, (eventType, event) => {
            this.eventManager.trigger(eventType, event);
        });
        console.log("SVG canvas and grid created.");
    }
    // Custom event system
    on(eventType, callback) {
        this.eventManager.on(eventType, callback);
    }
    /**
     * Creates a shape on the canvas.
     * @param type The type of shape ('rectangle' or 'circle').
     * @param x The x-coordinate.
     * @param y The y-coordinate.
     * @param name Optional name (used as an identifier).
     */
    createShape(type, x, y, name = "") {
        if (this.shapes.has(name)) {
            throw new Error(`A shape with the name '${name}' already exists.`);
        }
        const shape = { type, x, y, name };
        this.shapes.set(name, shape);
        console.log(`Shape created:`, shape);
        // Actual shape creation logic here
    }
    // Not done yet
    /**
     * Creates a connection between two shapes.
     * @param from The name of the first shape.
     * @param to The name of the second shape.
     */
    createConnection(from, to) {
        if (!this.shapes.has(from) || !this.shapes.has(to)) {
            throw new Error(`One or both shapes ('${from}', '${to}') do not exist.`);
        }
        const connection = { from, to };
        this.connections.push(connection);
        console.log(`Connection created:`, connection);
    }
    lockedTheCanvas(locked) {
        lockedCanvas(locked, this.svg, this.zoomBehaviour);
    }
    gridToggles(toggle) {
        toggleGrid(toggle);
    }
}
let engineInstance = null;
export function initializeCanvas(container, config) {
    if (!engineInstance) {
        engineInstance = new ZenodeEngine(container, config);
        console.log("Canvas initialized");
    }
    else {
        console.log("Canvas already initialized");
    }
    return engineInstance;
}
export function createShape(type, x, y, name) {
    if (!engineInstance) {
        throw new Error("Engine is not initialized. Call initializeCanvas first.");
    }
    return engineInstance.createShape(type, x, y, name);
}
export function gridToggle(toggle) {
    if (!engineInstance) {
        throw new Error("Engine is not initialized. Call initializeCanvas first.");
    }
    return engineInstance.gridToggles(toggle);
}
export function lockCanvas(isLocked) {
    if (!engineInstance) {
        throw new Error("Engine is not initialized. Call initializeCanvas first.");
    }
    engineInstance.lockedTheCanvas(isLocked);
}
// export function createConnection(from: string, to: string) {
//     return new ZenodeEngine(null, {}).createConnection(from, to);
// }
//# sourceMappingURL=engine.js.map