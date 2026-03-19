// src/core/engine.ts
import { drawCanvas, lockedCanvas } from "../components/canvas/canvas.js";
import { drawGrid, toggleGrid } from "../components/canvas/grid.js";
import { EventManager } from "./eventManager.js";
import { ZoomManager } from "./zoom&PanManager.js";
import { svgMouseMove } from "../events/mouseMove.js";
import { svgMouseClick } from "../events/mouseClick.js";
export class ZenodeEngine {
    constructor(container, config) {
        this.shapeMap = new Map();
        this.shapes = new Map();
        this.connections = [];
        this.canvasObject = { svg: null, grid: null, elements: null, canvasContainer: null };
        this.container = container;
        this.config = config;
        this.eventManager = new EventManager();
        this.initializeCanvas();
    }
    initializeCanvas() {
        this.canvasObject = drawCanvas(this.container ? `#${this.container.id}` : "body", this.config.canvas);
        this.svg = this.canvasObject.svg;
        this.grid = drawGrid(this.svg, this.config.canvas, this.canvasObject.grid);
        this.alignmentLine = this.svg.append("g").attr("class", "alignment-line");
        this.canvasContainerGroup = this.canvasObject.canvasContainer;
        this.zoomManager = new ZoomManager(this.canvasContainerGroup, this.svg, this.config, (eventType, event) => {
            this.eventManager.trigger(eventType, event);
        });
        console.log("SVG canvas and grid created.");
    }
    on(eventType, callback) {
        this.eventManager.on(eventType, callback);
    }
    /**
     * Creates a shape on the canvas.
     * @param type The type of shape ('rectangle' or 'circle').
     * @param data Optional inner content
     */
    createShape(shapeType, id, data) {
        var _a;
        // const shapeId = generateShapeId(id, this.shapeMap);
        const shapeList = ((_a = this.config.shapes.default) === null || _a === void 0 ? void 0 : _a[shapeType]) || [];
        if (!shapeList) {
            console.error(`No shapes found for type "${shapeType}".`);
            return;
        }
        const shapeToFind = shapeList.find(shape => shape.id === id);
        if (!shapeToFind) {
            console.error(`Shape ID "${id}" not found in type "${shapeType}".`);
            return;
        }
        this.svg.on("mousemove", (event) => svgMouseMove(event, shapeType, shapeToFind, this.grid, this.config, this.canvasObject, data));
        this.svg.on('click', (event) => svgMouseClick(event));
        // this.eventManager.trigger("shapePlaced", shape);
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
export function createShape(type, id, event, data) {
    if (!engineInstance) {
        throw new Error("Engine is not initialized. Call initializeCanvas first.");
    }
    return engineInstance.createShape(type, id, data);
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
export function alignmentLineToggle(toggle) { }
export function deleteShape(toggle, shapeid) { }
export function resetCanvas(config) { }
export function activateLassoTool(activate) { }
export function createConnection(from, to) { }
//# sourceMappingURL=engine.js.map